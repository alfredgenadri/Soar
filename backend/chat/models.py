from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Feedback(models.Model):
    FEEDBACK_TYPES = [
        ('general', 'General'),
        ('bug', 'Bug'),
        ('feature', 'Feature'),
        ('other', 'Other'),
    ]

    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES)
    rating = models.IntegerField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    user_email = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Feedback by {self.user.username} - Rating: {self.rating}"

class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    user_email = models.CharField(max_length=255, null=True, blank=True)  # For guest users
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['user_email', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"Conversation {self.session_id} - {'User: ' + self.user.email if self.user else 'Guest: ' + str(self.user_email)}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_user = models.BooleanField(default=False)
    user_email = models.CharField(max_length=255, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

class UserProfile(models.Model):
    user_email = models.CharField(max_length=255, unique=True)
    key_information = models.JSONField(default=dict)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user_email}"
