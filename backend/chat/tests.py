from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Conversation, Message
from unittest.mock import patch

class ChatbotTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.conversation = Conversation.objects.create(user=self.user, session_id='test-session')

    @patch('chat.views.requests.post')
    def test_send_message(self, mock_post):
        # Mock Rasa response
        mock_post.return_value.json.return_value = [{'text': 'Hello, how can I help you?'}]

        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Send a message
        response = self.client.post('/api/chat/message/', {
            'conversation_id': self.conversation.id,
            'message': 'Hi'
        })

        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)  # User message and bot response
        self.assertEqual(response.data[0]['content'], 'Hi')
        self.assertEqual(response.data[1]['content'], 'Hello, how can I help you?')

    def test_get_conversation(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Get conversation
        response = self.client.get('/api/chat/conversation/')

        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['session_id'], 'test-session')

    def test_create_feedback(self):
        # Authenticate user
        self.client.force_authenticate(user=self.user)

        # Create feedback
        response = self.client.post('/api/chat/feedback/', {
            'content': 'Great service!',
            'rating': 5
        })

        # Check response
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['content'], 'Great service!')
        self.assertEqual(response.data['rating'], 5)
