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

class MessageView(APIView):
    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        conversation = get_object_or_404(Conversation, id=request.data.get('conversation_id'))
        
        if user and conversation.user != user:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        is_audio = request.data.get('is_audio', False)

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
            detected_language = detect(user_message) # need to test this part

        Message.objects.create(conversation=conversation, content=user_message, is_user=True)

        # Send message to Rasa
        rasa_response = requests.post(f'{RASA_API_URL}/webhooks/rest/webhook', json={
            'sender': conversation.session_id,
            'message': user_message
        })

        # Save Rasa response
        for response in rasa_response.json():
            print(response)
            Message.objects.create(conversation=conversation, content=response['text'], is_user=False)

        # Return all messages in the conversation
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response({"messages": serializer.data, "detected_language": detected_language})
    
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
