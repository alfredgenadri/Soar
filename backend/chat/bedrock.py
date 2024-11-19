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
