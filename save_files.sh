#!/bin/bash

echo "Setez permisiunile..."
sudo chown -R $USER:$USER /home/dci-student/WEBSITE/sudo-ai.com
sudo chmod -R 755 /home/dci-student/WEBSITE/sudo-ai.com

echo "Salvez main.py..."
cat > /home/dci-student/WEBSITE/sudo-ai.com/ai_call_agent/main.py << 'MAINPY'
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
import uuid
from pathlib import Path
import sys
import speech_recognition as sr
import io
import wave

# Găsim calea către fișierul .env
env_path = Path(__file__).parent / '.env'
if not env_path.exists():
    raise FileNotFoundError(f".env file not found at {env_path}")

# Încărcăm variabilele de mediu
load_dotenv(dotenv_path=env_path)

# Configurare logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configurare CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
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
from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="static"), name="static")
MAINPY

echo "Salvez requirements.txt..."
cat > /home/dci-student/WEBSITE/sudo-ai.com/ai_call_agent/requirements.txt << 'REQSTXT'
fastapi>=0.104.1
uvicorn>=0.24.0
python-dotenv>=1.0.0
python-multipart>=0.0.6
requests>=2.31.0
SpeechRecognition>=3.8.1
PyAudio>=0.2.11
REQSTXT

echo "Gata! Fișierele au fost salvate."
