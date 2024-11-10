from typing import Any, Dict, List, Text
import openai
from dotenv import load_dotenv
import os
import logging
import time

class CustomGPTHandler:
    def __init__(self):
        load_dotenv()
        self.client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.assistant_id = os.getenv('OPENAI_ASSISTANT_ID')
        self._response_cache = {}
        
    def create_thread(self) -> str:
        """Create a new thread and return its ID."""
        try:
            thread = self.client.beta.threads.create()
            return thread.id
        except Exception as e:
            logging.error(f"Failed to create thread: {str(e)}")
            raise

    def get_response(self, thread_id: str, message: str) -> Dict[str, Any]:
        """Send message to CustomGPT and get response."""
        try:
            # Check cache first
            cache_key = f"{thread_id}:{message}"
            if cache_key in self._response_cache:
                return self._response_cache[cache_key]

            # Add message to thread
            self.client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=message
            )

            # Create and wait for run
            run = self.client.beta.threads.runs.create(
                thread_id=thread_id,
                assistant_id=self.assistant_id
            )

            # Poll for completion
            while True:
                run_status = self.client.beta.threads.runs.retrieve(
                    thread_id=thread_id,
                    run_id=run.id
                )
                
                if run_status.status == 'completed':
                    messages = self.client.beta.threads.messages.list(
                        thread_id=thread_id,
                        order='desc',
                        limit=1
                    )
                    
                    if not messages.data:
                        raise Exception("No response received")
                        
                    response = {
                        "text": messages.data[0].content[0].text.value,
                        "thread_id": thread_id
                    }
                    
                    self._response_cache[cache_key] = response
                    return response
                    
                elif run_status.status in ['failed', 'cancelled', 'expired']:
                    raise Exception(f"Run failed with status: {run_status.status}")
                    
                time.sleep(0.5)  # Short polling interval

        except Exception as e:
            logging.error(f"Error in get_response: {str(e)}")
            raise