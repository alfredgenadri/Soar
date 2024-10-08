from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Feedback, Conversation, Message
from .serializers import FeedbackSerializer, ConversationSerializer, MessageSerializer
import requests
import uuid

RASA_API_URL = 'http://localhost:5005'  # Update this with your Rasa server URL

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

        user_message = request.data.get('message')
        Message.objects.create(conversation=conversation, content=user_message, is_user=True)

        # Send message to Rasa
        rasa_response = requests.post(f'{RASA_API_URL}/webhooks/rest/webhook', json={
            'sender': conversation.session_id,
            'message': user_message
        })

        # Save Rasa response
        for response in rasa_response.json():
            Message.objects.create(conversation=conversation, content=response['text'], is_user=False)

        # Return all messages in the conversation
        messages = Message.objects.filter(conversation=conversation).order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
