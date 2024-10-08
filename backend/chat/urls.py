from django.urls import path
from .views import FeedbackCreateView, ConversationView, MessageView

urlpatterns = [
    path('feedback/', FeedbackCreateView.as_view(), name='create_feedback'),
    path('conversation/', ConversationView.as_view(), name='get_conversation'),
    path('message/', MessageView.as_view(), name='send_message'),
]