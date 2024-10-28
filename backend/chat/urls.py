from django.urls import path
from .views import FeedbackCreateView, ConversationView, MessageView, SpeechToTextView, ConversationListView

urlpatterns = [
    path('feedback/', FeedbackCreateView.as_view(), name='create_feedback'),
    path('conversation/', ConversationView.as_view(), name='get_conversation'),
    path('message/', MessageView.as_view(), name='send_message'),
    path('speech-to-text/', SpeechToTextView.as_view(), name='speech_to_text'),
    path('conversations/', ConversationListView.as_view(), name='conversation_list'),
]