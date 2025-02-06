from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
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
from services.dialogflow_service import DialogflowService
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from call_handler import CallHandler

# Găsim calea către fișierul .env
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    raise FileNotFoundError(f".env file not found at {env_path}")

# Încărcăm variabilele de mediu
load_dotenv(dotenv_path=env_path)

# Configurare logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inițializare Dialogflow
dialogflow = DialogflowService()

app = FastAPI()

# Configurare CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class Message(BaseModel):
    text: str
    session_id: str = None

@app.get("/")
async def root():
    return {"message": "AI Call Agent API is running"}

@app.post("/api/chat")
async def chat(message: Message):
    try:
        response = await call_handler.handle_message(
            text=message.text,
            session_id=message.session_id
        )
        
        if "error" in response:
            raise HTTPException(status_code=500, detail=response["error"])
            
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/call")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection accepted")
    try:
        while True:
            # Primim audio de la client
            try:
                message = await websocket.receive()
                session_id = str(uuid.uuid4())  # Generăm un ID unic pentru sesiune
                if message["type"] == "websocket.disconnect":
                    logger.info("Client disconnected normally")
                    break
                
                if message["type"] != "websocket.receive":
                    continue
                
                audio_data = message.get("bytes")
                if not audio_data:
                    continue
            except Exception as e:
                logger.error(f"Error receiving message: {str(e)}")
                continue
            
            # Salvăm temporar audio-ul WebM
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as webm_file:
                webm_file.write(audio_data)
                webm_path = webm_file.name
            
            logger.info(f"Received audio chunk, size: {len(audio_data)} bytes")
            
            try:
                # Convertim WebM în WAV folosind ffmpeg
                wav_path = webm_path.replace('.webm', '.wav')
                result = subprocess.run([
                    'ffmpeg', '-i', webm_path,
                    '-acodec', 'pcm_s16le',
                    '-ar', '16000',
                    '-ac', '1',
                    '-y',
                    wav_path
                ], capture_output=True, text=True)
                
                if result.returncode != 0:
                    logger.error(f"FFmpeg error: {result.stderr}")
                    continue
                
                # Procesăm audio-ul
                recognizer = sr.Recognizer()
                recognizer.energy_threshold = 300  # Ajustăm sensibilitatea
                recognizer.dynamic_energy_threshold = True
                recognizer.dynamic_energy_adjustment_damping = 0.15
                recognizer.dynamic_energy_ratio = 1.5
                recognizer.pause_threshold = 0.8  # Ajustăm pauza între cuvinte
                
                with sr.AudioFile(wav_path) as source:
                    # Ajustăm pentru zgomot de fundal
                    recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    audio = recognizer.record(source)
                    try:
                        transcription = recognizer.recognize_google(audio, language='en-US')
                        logger.info(f"Transcription successful: {transcription}")
                    except sr.UnknownValueError:
                        logger.warning("Speech Recognition could not understand audio")
                        continue
                    except sr.RequestError as e:
                        logger.error(f"Could not request results from Speech Recognition service; {e}")
                        continue
                    
                    # Folosim Dialogflow pentru răspuns
                    dialog_response = dialogflow.detect_intent(session_id, transcription)
                    ai_response = dialog_response["response_messages"][0]["text"]
                
                response = {
                    "type": "transcription",
                    "text": transcription,
                    "response": ai_response
                }
                await websocket.send_json(response)
            
            finally:
                # Curățăm fișierele temporare
                try:
                    if os.path.exists(webm_path):
                        os.unlink(webm_path)
                    if os.path.exists(wav_path):
                        os.unlink(wav_path)
                except Exception as e:
                    logger.error(f"Error cleaning up temporary files: {e}")
            
            # Verificăm dacă este mesaj text sau audio
            if message.get("type") == "websocket.receive" and "text" in message:
                try:
                    text_data = json.loads(message["text"])
                    if text_data["type"] == "text":
                        # Generăm răspunsul pentru mesaj text
                        ai_response = generate_ai_response(text_data["message"])
                        response = {
                            "type": "transcription",
                            "text": text_data["message"],
                            "response": ai_response
                        }
                        await websocket.send_json(response)
                        continue
                except json.JSONDecodeError:
                    pass
    except starlette.websockets.WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close()
        except:
            pass
    finally:
        logger.info("WebSocket connection closed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
