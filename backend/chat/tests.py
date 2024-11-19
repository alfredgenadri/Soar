from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Conversation, Message

class ChatbotTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.conversation = Conversation.objects.create(user=self.user, session_id='test-session')

    def test_send_message(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Send a message
        response = self.client.post('/api/chat/message/', {
            'conversation_id': self.conversation.id,
            'message': 'Hi'
        })

        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertTrue('text' in response.data[0])
        self.assertTrue('timestamp' in response.data[0])
        self.assertTrue('sender' in response.data[0])

    def test_get_conversation(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Get conversation
        response = self.client.get('/api/chat/conversation/')

        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['session_id'], 'test-session')
