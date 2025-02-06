from ai_call_agent.services.dialogflow_service import DialogflowService
from typing import Dict, Any, Optional

class CallHandler:
    def __init__(self):
        self.dialogflow_service = DialogflowService()
    
    async def handle_message(self, text: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Handle incoming message and return response
        
        Args:
            text (str): The input text from the user
            session_id (Optional[str]): The session identifier
            
        Returns:
            Dict[str, Any]: The response containing text, intent, and confidence
        """
        try:
            # Get response from Dialogflow
            df_response = self.dialogflow_service.get_response(text, session_id)
            
            if "error" in df_response:
                return {"error": df_response["error"]}
            
            return {
                "session_id": session_id,
                "text": df_response["text"],
                "intent": df_response["intent"],
                "confidence": df_response["confidence"]
            }
            
        except Exception as e:
            print(f"Error in call handler: {str(e)}")
            return {"error": str(e)} 