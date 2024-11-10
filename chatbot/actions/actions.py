from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from utils.custom_gpt import CustomGPTHandler
import logging

class ActionDefaultFallback(Action):
    _instance = None
    _gpt_handler = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ActionDefaultFallback, cls).__new__(cls)
            cls._gpt_handler = CustomGPTHandler()
        return cls._instance

    def name(self) -> Text:
        return "action_default_fallback"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        try:
            latest_message = tracker.latest_message.get("text", "")
            thread_id = tracker.get_slot("thread_id")

            if not thread_id:
                thread_id = self._gpt_handler.create_thread()
                
            response = self._gpt_handler.get_response(thread_id, latest_message)
            dispatcher.utter_message(text=response["text"])
            
            return [{"event": "slot", "name": "thread_id", "value": thread_id}]

        except Exception as e:
            logging.error(f"Fallback action error: {str(e)}")
            dispatcher.utter_message(text="I apologize, but I'm having trouble connecting to my knowledge base. Please try again later.")
            return []