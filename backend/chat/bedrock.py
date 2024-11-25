import boto3
import json
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
import re

load_dotenv()

class BedrockAgent:
    def __init__(self):
        self.session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        
        self.bedrock_runtime = self.session.client(
            service_name='bedrock-runtime',
            region_name=os.getenv('AWS_REGION')
        )
        
        self.bedrock_agent_runtime = self.session.client(
            service_name='bedrock-agent-runtime',
            region_name=os.getenv('AWS_REGION')
        )
        
        self.agent_id = os.getenv('BEDROCK_AGENT_ID')
        self.agent_alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')

    def sanitize_session_id(self, email: str) -> str:
        """Convert email to valid session ID format"""
        if not email or email == 'guest':
            return 'temp-session'
        # Replace @ and any other invalid characters with '-'
        return re.sub(r'[^0-9a-zA-Z._:-]', '-', email)

    def invoke_agent(self, message, session_id):
        try:
            response = self.bedrock_agent_runtime.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.agent_alias_id,
                sessionId=self.sanitize_session_id(session_id),
                inputText=message
            )
            
            # First, collect the full response
            event_stream = response.get('completion')
            completion_text = ""
            
            for event in event_stream:
                if 'chunk' in event:
                    chunk_data = event['chunk'].get('bytes').decode('utf-8')
                    completion_text += chunk_data
                    # Yield each chunk as it comes
                    yield chunk_data
            
        except ClientError as error:
            yield f"Error: {str(error)}"

    def generate_stream(self, prompt: str, user_email: str = None):
        try:
            # Use sanitized user_email as session ID
            session_id = user_email if user_email and user_email != 'guest' else 'temp-session'
            for chunk in self.invoke_agent(prompt, session_id):
                yield chunk
        except Exception as e:
            print(f"Error in generate_stream: {e}")
            yield ""

    def generate_response(self, prompt: str, user_email: str = None) -> str:
        """Generate a single response without streaming"""
        try:
            # Use sanitized user_email as session ID
            session_id = user_email if user_email and user_email != 'guest' else 'temp-session'
            full_response = ""
            for chunk in self.invoke_agent(prompt, session_id):
                full_response += chunk
            return full_response
        except Exception as e:
            print(f"Error generating response: {e}")
            return ""
