from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Feedback, Conversation, Message, UserProfile
from .serializers import FeedbackSerializer, ConversationSerializer, MessageSerializer
import requests
import uuid
from langdetect import detect
import whisper
import tempfile
import threading
import logging
import time
from .bedrock import BedrockAgent
from django.http import StreamingHttpResponse
import json
from rest_framework.decorators import api_view

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
                    'user_email': msg.user_email,
                    'timestamp': msg.timestamp,
                    'image': None
                } for msg in messages]
            })
            
        return Response(conversation_data)
    
class FeedbackCreateView(APIView):
    def post(self, request):
        try:
            # Print the received data for debugging
            print("Received feedback data:", request.data)
            
            serializer = FeedbackSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Feedback submitted successfully'})
            # Print validation errors if any
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=400)
        except Exception as e:
            # Print the actual error
            print("Error submitting feedback:", str(e))
            return Response({'error': str(e)}, status=500)

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
    def update_user_profile(self, user_email: str, message_content: str, bot_response: str):
        bedrock = BedrockAgent()
        
        prompt = """Based on this conversation, extract any important information about the user's:
        - Goals
        - Preferences
        - Challenges
        - Important life events
        - First Name

        Previous message: {message}
        Bot response: {response}

        Format your response EXACTLY as a JSON object with these categories as keys, or return an empty JSON object if no important information found.
        Example: {{"goals": ["wants to work out daily"], "challenges": ["finding time to exercise"], "first name": ["james"], "preferences": ["speak in english only"], "important life events": ["father is in the hospital"]}}
        Only respond with the JSON object, nothing else.""".format(
            message=message_content,
            response=bot_response
        )

        try:
            extraction = bedrock.generate_response(prompt, user_email)
            # Clean the response to ensure it's valid JSON
            extraction = extraction.strip()
            if extraction:
                try:
                    info = json.loads(extraction)
                    if isinstance(info, dict):  # Verify we got a valid dictionary
                        profile, created = UserProfile.objects.get_or_create(user_email=user_email)
                        
                        # Update existing information
                        for category, items in info.items():
                            if isinstance(items, list):  # Verify items is a list
                                if category not in profile.key_information:
                                    profile.key_information[category] = items
                                else:
                                    # Convert to set to remove duplicates
                                    existing_items = set(profile.key_information[category])
                                    new_items = set(items)
                                    profile.key_information[category] = list(existing_items | new_items)
                        
                        profile.save()
                except json.JSONDecodeError as e:
                    print(f"Failed to parse extraction response: {extraction}")
                    print(f"JSON Error: {e}")
        except Exception as e:
            print(f"Error updating user profile: {e}")

    def get_relevant_context(self, user_email: str) -> str:
        try:
            profile = UserProfile.objects.get(user_email=user_email)
            if profile.key_information:
                context = "Important information about this user:\n"
                for category, items in profile.key_information.items():
                    context += f"{category.title()}: {', '.join(items)}\n"
                print(context)
                return context
        except UserProfile.DoesNotExist:
            return ""
        return ""

    def post(self, request):
        try:
            conversation_id = request.data.get('conversationId')
            user_message = request.data.get('message')
            user_email = request.data.get('user_email')

            # Get user context if logged in
            context = ""
            if user_email and user_email != 'guest':
                context = self.get_relevant_context(user_email)

            # Prepare the prompt with user context
            system_message = (
                f"{context}\n"
                "Current conversation:\n"
                f"User: {user_message}\n"
                "Assistant:"
            )

            return StreamingHttpResponse(
                self.stream_response(system_message, conversation_id, user_message, user_email),
                content_type='text/event-stream'
            )
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def stream_response(self, prompt: str, conversation_id: str, user_message: str, user_email: str):
        bedrock = BedrockAgent()
        full_response = ""
        
        try:
            # Generate chat response first
            for chunk in bedrock.generate_stream(prompt, user_email=user_email):
                # Only filter out valid JSON objects that match our expected format
                try:
                    json_obj = json.loads(chunk)
                    expected_keys = ['goals', 'preferences', 'challenges', 'important life events', 'first name']
                    if any(key.lower() in json_obj for key in expected_keys):
                        continue  # Skip profile update JSON
                except json.JSONDecodeError:
                    # Not a JSON object, send it to the user
                    full_response += chunk
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            # Save the message after getting full response
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Save user message
            Message.objects.create(
                conversation=conversation,
                content=user_message,
                user_email=user_email
            )
            
            # Save bot response
            Message.objects.create(
                conversation=conversation,
                content=full_response.strip()
            )
            
            # Update user profile with new information
            if user_email and user_email != 'guest':
                # Do this in the background to not affect response time
                threading.Thread(
                    target=self.update_user_profile,
                    args=(user_email, user_message, full_response)
                ).start()
                
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

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