from typing import Any, Dict, List, Text
import openai
from django.conf import settings

class CustomGPTHandler:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.assistant_id = settings.OPENAI_ASSISTANT_ID
        
    async def create_thread(self) -> str:
        """Create a new conversation thread."""
        try:
            thread = await self.client.beta.threads.create()
            return thread.id
        except Exception as e:
            raise Exception(f"Failed to create thread: {str(e)}")

    async def get_response(self, thread_id: str, message: str) -> Dict[str, Any]:
        """Send message to CustomGPT and get response."""
        try:
            # Add the user message to the thread
            await self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )

            # Run the assistant
            run = await self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant_id
            )

            # Wait for completion
            while True:
                run_status = await self.client.beta.threads.runs.retrieve(
                    thread_id=thread_id,
                    run_id=run.id
                )
                if run_status.status == 'completed':
                    break
                elif run_status.status == 'failed':
                    raise Exception("Assistant run failed")

            # Get the assistant's response
            messages = await self.client.beta.threads.messages.list(
                thread_id=thread_id
            )
            
            latest_message = messages.data[0]
            
            return {
                "text": latest_message.content[0].text.value,
                "thread_id": thread_id
            }

        except Exception as e:
            raise Exception(f"Error in CustomGPT communication: {str(e)}")