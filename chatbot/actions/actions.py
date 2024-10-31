from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from backend.chat.custom_gpt import CustomGPTHandler

class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        # Get the latest user message
        latest_message = tracker.latest_message.get("text")
        
        # Get or create thread_id from conversation metadata
        thread_id = tracker.get_slot("thread_id")
        gpt_handler = CustomGPTHandler()

        try:
            if not thread_id:
                # Create new thread if none exists
                thread_id = await gpt_handler.create_thread()
                
            # Get response from CustomGPT
            response = await gpt_handler.get_response(thread_id, latest_message)
            
            # Send response back to user
            dispatcher.utter_message(text=response["text"])
            
            # Update thread_id slot
            return [{"event": "slot", "name": "thread_id", "value": thread_id}]

        except Exception as e:
            dispatcher.utter_message(text="I apologize, but I'm having trouble connecting to my knowledge base. Please try again later.")
            return []