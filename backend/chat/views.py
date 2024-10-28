from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Feedback, Conversation, Message
from .serializers import FeedbackSerializer, ConversationSerializer, MessageSerializer
import requests
import uuid
from langdetect import detect
import whisper
import tempfile

RASA_API_URL = 'http://localhost:5005'


class ConversationListView(APIView):
    def get(self, request):
        user_email = request.GET.get('email')
        if not user_email:
            return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)
            
        conversations = Conversation.objects.filter(
            user_email=user_email,
            is_active=True
        ).order_by('-updated_at')
        
        conversation_data = []
        for conv in conversations:
            messages = conv.messages.all().order_by('timestamp')
            conversation_data.append({
                'id': conv.id,
                'title': f"Conversation {conv.id}",
                'lastMessage': messages.last().content if messages.exists() else "",
                'timestamp': conv.updated_at,
                'messages': [{
                    'content': msg.content,
                    'is_user': True if msg.user_email else False,
                    'timestamp': msg.timestamp,
                    'image': None
                } for msg in messages]
            })
            
        return Response(conversation_data)
    
class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ConversationView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        conversation = Conversation.objects.filter(user=user).first()
        if not conversation:
            session_id = str(uuid.uuid4())
            conversation = Conversation.objects.create(user=user, session_id=session_id)
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        user_email = request.data.get('userId')
        
        session_id = str(uuid.uuid4())
        conversation = Conversation.objects.create(
            user=user,
            user_email=user_email,
            session_id=session_id
        )
        
        return Response({
            'id': conversation.id,
            'title': f"Conversation {conversation.id}",
            'lastMessage': "",
            'timestamp': conversation.created_at,
            'messages': []
        })

class MessageView(APIView):
    def post(self, request):
        conversation_id = request.data.get('conversationId')
        user_email = request.data.get('userId')
        is_audio = request.data.get('is_audio', False)
        
        conversation = get_object_or_404(Conversation, id=conversation_id)

        user_message = request.data.get('message')
        
        # Save user message with proper user identification
        user_msg = Message.objects.create(
            conversation=conversation,
            content=user_message,
            is_user=True,
            user_email=user_email
        )

        if is_audio:
            audio_file = request.FILES.get('audio')
            if not audio_file:
                return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

            # Use SpeechToTextView to handle audio
            stt_view = SpeechToTextView()
            stt_response = stt_view.post(request)
            user_message = stt_response.data['text']
            detected_language = stt_response.data['detected_language']
        else:
            user_message = request.data.get('message')

        try:
            rasa_response = requests.post(f'{RASA_API_URL}/webhooks/rest/webhook', json={
                'sender': conversation.session_id,
                'message': user_message
            })
            bot_responses = rasa_response.json()
        except requests.exceptions.RequestException:
            bot_responses = [{
                'text': "I apologize, but I'm temporarily unavailable. Please try again later."
            }]

        # Save bot responses
        saved_responses = []
        for response in bot_responses:
            bot_msg = Message.objects.create(
                conversation=conversation,
                content=response.get('text', ''),
                is_user=False
            )
            saved_responses.append({
                'content': bot_msg.content,
                'timestamp': bot_msg.timestamp,
                'is_user': False
            })
        
        return Response(saved_responses)
    
class SpeechToTextUtils:
    _instance = None

    def __new__(cls, model_size="small"):
        if cls._instance is None:
            cls._instance = super(SpeechToTextUtils, cls).__new__(cls)
            cls._instance.model = whisper.load_model(model_size)
        return cls._instance

    def detect_language(self, file_path):
        audio = whisper.load_audio(file_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio).to(self.model.device)
        _, probs = self.model.detect_language(mel)
        return max(probs, key=probs.get)

    def transcribe(self, file_path):
        return self.model.transcribe(file_path)

# stt utils instantiation for model loading upon server startup
speech_to_text_utils = SpeechToTextUtils('small')


class SpeechToTextView(APIView):
    def post(self, request):
        audio_file = request.FILES.get('audio')
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name

        if not audio_file:
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

        response = speech_to_text_utils.transcribe(temp_audio_path)
        
        transcribed_text = response['text']
        detected_lang = response['language']

        if not transcribed_text:
            return Response({"error": "Could not transcribe audio"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"text": transcribed_text, "detected_language": detected_lang})
