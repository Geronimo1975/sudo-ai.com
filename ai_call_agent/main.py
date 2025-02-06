from fastapi import FastAPI, Request, File, UploadFile, HTTPException, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse, FileResponse
from fastapi.websockets import WebSocket
import uuid
from pathlib import Path
import sys
import speech_recognition as sr
import io
import wave
import numpy as np
import subprocess
import tempfile
import starlette.websockets
from random import choice
import json
from ai_call_agent.services.dialogflow_service import DialogflowService
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .call_handler import CallHandler
from ai_call_agent.services.llm_service import LLMService
from ai_call_agent.services.rag_service import RAGService
from gtts import gTTS
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import jwt
import sounddevice as sd
import asyncio

# Găsim calea către fișierul .env
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    raise FileNotFoundError(f".env file not found at {env_path}")

# Încărcăm variabilele de mediu
load_dotenv(dotenv_path=env_path)

# Configurare logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inițializare Dialogflow
dialogflow = DialogflowService()

app = FastAPI()

# Configurare CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # În producție, specifică domeniile exacte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurare director pentru fișiere audio
AUDIO_DIR = Path("static/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Adăugăm dicționar pentru traduceri
TRANSLATIONS = {
    "en": {
        "greeting": "Hello! I'm the AI Call Agent. How can I help you today?",
        "info_request": "I'd like to know more about your services.",
        "service_info": "Of course! We offer complete AI voice assistance services for call centers...",
        "error_msg": "Could not connect to AI Call Agent. Please try again later."
    },
    "de": {
        "greeting": "Hallo! Ich bin der KI-Call-Agent. Wie kann ich Ihnen heute helfen?",
        "info_request": "Ich möchte mehr über Ihre Dienstleistungen erfahren.",
        "service_info": "Natürlich! Wir bieten komplette KI-Sprachassistenzdienste für Call-Center...",
        "error_msg": "Verbindung zum KI-Call-Agent nicht möglich. Bitte versuchen Sie es später erneut."
    }
}

# Răspunsuri predefinite pentru agent
AI_RESPONSES = {
    "greeting": [
        "Hello! How can I help you today?",
        "Hi there! What can I do for you?",
        "Good day! How may I assist you?"
    ],
    "acknowledgment": [
        "I understand. Let me help you with that.",
        "I see what you mean.",
        "Got it, here's what I can tell you."
    ],
    "information": [
        "We offer comprehensive AI solutions for businesses.",
        "Our services include voice recognition and natural language processing.",
        "We can help automate your customer service operations."
    ]
}

def generate_ai_response(transcription: str) -> str:
    """Generează un răspuns contextual bazat pe transcrierea primită."""
    transcription = transcription.lower()
    
    if any(word in transcription for word in ['hello', 'hi', 'hey']):
        return choice(AI_RESPONSES["greeting"])
    elif any(word in transcription for word in ['what', 'how', 'tell']):
        return choice(AI_RESPONSES["information"])
    else:
        return choice(AI_RESPONSES["acknowledgment"])

@app.post("/demo-call")
async def handle_demo_call(request: Request):
    try:
        logger.info("Received demo call request")
        data = await request.json()
        logger.info(f"Request data: {data}")
        
        language = data.get('language', 'en')
        texts = TRANSLATIONS[language]
        
        return JSONResponse({
            "status": "success",
            "ai_response": texts["greeting"],
            "user_response": texts["info_request"],
            "ai_follow_up": texts["service_info"],
            "language": language
        })
        
    except Exception as e:
        logger.error(f"Error in demo-call: {str(e)}")
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)

@app.post("/process-voice")
async def process_voice(audio: UploadFile = File(...)):
    try:
        logger.info("Received voice processing request")
        audio_content = await audio.read()
        logger.info(f"Received audio size: {len(audio_content)} bytes")

        with io.BytesIO(audio_content) as audio_bytes:
            recognizer = sr.Recognizer()
            with sr.AudioFile(audio_bytes) as source:
                logger.info("Reading audio file...")
                audio_data = recognizer.record(source)
                logger.info("Transcribing audio...")
                transcription = recognizer.recognize_google(audio_data)
                logger.info(f"Transcription result: {transcription}")

        return JSONResponse({
            "status": "success",
            "transcription": transcription,
            "response": f"I understand you said: {transcription}"
        })
    except Exception as e:
        logger.error(f"Error processing voice: {str(e)}")
        return JSONResponse({
            "status": "error",
            "message": str(e)
        }, status_code=500)

@app.get("/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "services": {
            "speech_recognition": True
        }
    })

# Adăugăm servirea fișierelor statice
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize call handler
call_handler = CallHandler()

# Initialize LLM service
llm_service = LLMService()

# Initialize RAG service
try:
    logger.info("Initializing RAG service...")
    rag_service = RAGService()
    logger.info("RAG service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize RAG service: {str(e)}")
    raise

class Message(BaseModel):
    text: str
    session_id: str | None = None

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.post("/api/chat")
async def chat(request: Request):
    try:
        body = await request.json()
        message = body.get("message")
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
            
        logger.info(f"Received message: {message}")
        response = await rag_service.get_response(message)
        
        return JSONResponse({
            "response": response["text"],
            "source": response.get("source", "unknown")
        })
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice")
async def voice_chat(request: Request):
    try:
        # Pentru moment, dezactivăm procesarea vocală
        return JSONResponse({
            "response": "Voice chat is currently disabled. Please use text chat.",
            "source": "system"
        })
    except Exception as e:
        logger.error(f"Voice chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Database configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Secret1975")
DB_NAME = "ai-call-agency"
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Initialize SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    gdpr_accepted = Column(Boolean, default=False)
    gdpr_accepted_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    transcript = Column(Text, default="")
    voice_enabled = Column(Boolean, default=False)
    video_enabled = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)

# Dependency for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# GDPR consent model
class GDPRConsent(BaseModel):
    user_name: str
    consent: bool

# Store active connections
active_connections: Dict[str, Dict[str, Any]] = {}

@app.post("/api/gdpr-consent")
async def submit_gdpr_consent(consent: GDPRConsent, db: Session = Depends(get_db)):
    if not consent.consent:
        raise HTTPException(status_code=400, detail="GDPR consent is required")
    
    user_id = generate_user_id()  # Implement user ID generation
    user = User(
        id=user_id,
        name=consent.user_name,
        gdpr_accepted=True,
        gdpr_accepted_date=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    
    token = create_access_token(user_id)  # Implement JWT token creation
    return {"token": token, "user_id": user_id}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # Create new session
    db = SessionLocal()
    session = ChatSession()
    db.add(session)
    db.commit()
    
    client_id = session.id
    active_connections[client_id] = {
        "websocket": websocket,
        "session": session,
        "transcript": []
    }
    
    try:
        while True:
            data = await websocket.receive_json()
            logger.info(f"Received websocket data: {data}")
            
            if "message" in data:
                # Save user message to transcript
                message = {
                    "sender": "user",
                    "content": data["message"],
                    "timestamp": datetime.utcnow().isoformat()
                }
                active_connections[client_id]["transcript"].append(message)
                
                # Get AI response
                response = await rag_service.get_response(data["message"])
                
                # Save AI response to transcript
                ai_message = {
                    "sender": "ai",
                    "name": "George",
                    "content": response["text"],
                    "timestamp": datetime.utcnow().isoformat()
                }
                active_connections[client_id]["transcript"].append(ai_message)
                
                # Send response to client
                await websocket.send_json(ai_message)
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Save transcript and close session
        session.end_time = datetime.utcnow()
        session.transcript = json.dumps(active_connections[client_id]["transcript"])
        db.commit()
        db.close()
        
        del active_connections[client_id]
        await websocket.close()

@app.get("/api/sessions/{user_id}")
async def get_user_sessions(user_id: str, db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    return sessions

@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        db.delete(session)
        db.commit()
        return {"message": "Session deleted"}
    raise HTTPException(status_code=404, detail="Session not found")

@app.on_event("startup")
async def startup_event():
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8010, 
        log_level="info",
        reload=True,
        reload_dirs=["ai_call_agent"]
    )
