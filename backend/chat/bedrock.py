import boto3
import json
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

load_dotenv()

class BedrockAgent:
    def __init__(self):
        self.session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ca-central-1')
        )
        
        self.bedrock_runtime = self.session.client(
            service_name='bedrock-runtime',
            region_name=os.getenv('AWS_REGION', 'ca-central-1')
        )
        
        self.bedrock_agent_runtime = self.session.client(
            service_name='bedrock-agent-runtime',
            region_name=os.getenv('AWS_REGION', 'ca-central-1')
        )
        
        self.agent_id = os.getenv('BEDROCK_AGENT_ID')
        self.agent_alias_id = os.getenv('BEDROCK_AGENT_ALIAS_ID')
        
        # Add instructions loading
        self.instructions = ""
        try:
            with open('chatbot_instructions.txt', 'r') as file:
                self.instructions = file.read().strip()
        except Exception as e:
            print(f"Error loading instructions: {e}")

    def invoke_agent(self, message, session_id):
        try:
            response = self.bedrock_agent_runtime.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.agent_alias_id,
                sessionId=session_id,
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

    def generate_stream(self, prompt: str):
        try:
            response = self.bedrock_runtime.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0',
                body=json.dumps({
                    'anthropic_version': 'bedrock-2023-05-31',
                    'max_tokens': 1000,
                    'messages': [
                        {
                            'role': 'user',
                            'content': f"Instructions: {self.instructions}\n\nUser message: {prompt}"
                        }
                    ]
                })
            )
            
            response_body = json.loads(response['body'].read())
            text = response_body['content'][0]['text']
            
            # Simulate streaming by yielding chunks of text
            chunk_size = 4
            for i in range(0, len(text), chunk_size):
                yield text[i:i + chunk_size]

        except Exception as e:
            print(f"Error in generate_stream: {e}")
            yield ""

    def generate_response(self, prompt: str) -> str:
        """Generate a single response without streaming"""
        try:
            response = self.bedrock_runtime.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0',
                body=json.dumps({
                    'anthropic_version': 'bedrock-2023-05-31',
                    'max_tokens': 1000,
                    'messages': [
                        {
                            'role': 'user',
                            'content': f"Instructions: {self.instructions}\n\nUser message: {prompt}"
                        }
                    ]
                })
            )
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
        except Exception as e:
            print(f"Error generating response: {e}")
            return ""
