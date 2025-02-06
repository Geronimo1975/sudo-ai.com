from twilio.rest import Client
from .voice_service import VoiceService
from ..models import CallSession
import datetime
import uuid

class CallHandler:
    def __init__(self, twilio_client: Client, voice_service: VoiceService):
        self.twilio_client = twilio_client
        self.voice_service = voice_service
        self.active_sessions = {}
        
    def create_session(self, phone_number: str) -> CallSession:
        session = CallSession(
            session_id=str(uuid.uuid4()),
            customer_phone=phone_number,
            conversation_history=[],
            created_at=datetime.datetime.now().isoformat(),
            status="active"
        )
        self.active_sessions[session.session_id] = session
        return session
        
    def handle_customer_input(self, session_id: str, input_text: str):
        if session_id not in self.active_sessions:
            raise Exception("Session not found")
            
        session = self.active_sessions[session_id]
        session.conversation_history.append({
            "role": "customer",
            "text": input_text,
            "timestamp": datetime.datetime.now().isoformat()
        }) 