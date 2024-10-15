from django.apps import AppConfig

class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'

    def ready(self):
        from .views import speech_to_text_utils
        # This will initialize the Whisper model
        speech_to_text_utils