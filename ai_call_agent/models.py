from pydantic import BaseModel
from typing import List

class CallSession(BaseModel):
    session_id: str
    customer_phone: str
    conversation_history: List[dict]
    created_at: str
    status: str
    
class AIResponse(BaseModel):
    text: str
    confidence: float
    intent: str
    
class CustomerInput(BaseModel):
    speech_text: str
    session_id: str 