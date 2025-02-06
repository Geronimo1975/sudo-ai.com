from google.cloud.dialogflowcx import SessionsClient
from google.cloud.dialogflowcx import TextInput, QueryInput
import os
from dotenv import load_dotenv
import logging
import uuid

logger = logging.getLogger(__name__)

class DialogflowService:
    def __init__(self):
        load_dotenv()
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("DIALOGFLOW_LOCATION")
        self.agent_id = os.getenv("DIALOGFLOW_AGENT_ID")
        
        if not all([self.project_id, self.agent_id]):
            raise ValueError("Missing required Dialogflow CX configuration")
        
        # Initialize the client
        client_options = {"api_endpoint": f"{self.location}-dialogflow.googleapis.com"}
        self.session_client = SessionsClient(client_options=client_options)
    
    def get_response(self, text, session_id):
        """
        Get response from Dialogflow CX for a given text input
        """
        try:
            session_path = self.session_client.session_path(
                self.project_id, self.location, self.agent_id, session_id
            )
            
            text_input = TextInput(text=text)
            query_input = QueryInput(text=text_input, language_code="en-US")
            
            response = self.session_client.detect_intent(
                request={"session": session_path, "query_input": query_input}
            )
            
            return {
                "text": response.query_result.response_messages[0].text.text[0],
                "intent": response.query_result.intent.display_name,
                "confidence": response.query_result.intent_detection_confidence
            }
            
        except Exception as e:
            print(f"Error in Dialogflow service: {str(e)}")
            return {"error": str(e)}

    def detect_intent(
        self,
        session_id: str,
        text: str,
        language_code: str = "en"
    ) -> Dict[Any, Any]:
        """
        Detectează intenția din textul primit și returnează răspunsul.
        """
        try:
            # Crearea sesiunii
            session_path = self.session_client.session_path(
                self.project_id, self.location, self.agent_id, session_id
            )
            
            # Configurarea input-ului
            text_input = TextInput(text=text)
            query_input = QueryInput(text=text_input, language_code=language_code)
            
            # Detectarea intenției
            response = self.session_client.detect_intent(
                request={"session": session_path, "query_input": query_input}
            )
            
            # Procesarea răspunsului
            result = response.query_result
            
            return {
                "query_text": result.query_text,
                "intent": result.intent.display_name,
                "confidence": result.intent_detection_confidence,
                "parameters": dict(result.parameters),
                "response_messages": [
                    {
                        "text": result.fulfillment_text,
                        "type": "text"
                    }
                ],
                "sentiment": {
                    "score": result.sentiment_analysis_result.score,
                    "magnitude": result.sentiment_analysis_result.magnitude
                } if result.sentiment_analysis_result else None
            }
            
        except Exception as e:
            logger.error(f"Error detecting intent: {str(e)}")
            return {
                "error": str(e),
                "text": "I apologize, but I'm having trouble understanding. Could you please rephrase that?",
                "response_messages": [{
                    "text": "I apologize, but I'm having trouble understanding. Could you please rephrase that?",
                    "type": "text"
                }]
            } 