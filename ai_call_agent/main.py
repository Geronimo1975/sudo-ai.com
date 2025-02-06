from fastapi import FastAPI
from twilio.twiml.voice_response import VoiceResponse, Gather
from twilio.rest import Client
import elevenlabs
import os
from dotenv import load_dotenv
from .services.ai_service import AIService

load_dotenv()

app = FastAPI()

# Configurare credențiale
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Inițializare servicii
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
elevenlabs.set_api_key(ELEVENLABS_API_KEY)
ai_service = AIService()

@app.post("/incoming-call")
async def handle_incoming_call():
    response = VoiceResponse()
    gather = Gather(input='speech', action='/handle-response', method='POST')
    
    initial_response = ai_service.process_input("greeting")
    ai_voice = ai_service.generate_voice_response(initial_response.text)
    
    gather.play(ai_voice)
    response.append(gather)
    
    return str(response)

@app.post("/handle-response")
async def handle_response(speech_result: str):
    response = VoiceResponse()
    gather = Gather(input='speech', action='/handle-response', method='POST')
    
    ai_response = ai_service.process_input(speech_result)
    ai_voice = ai_service.generate_voice_response(ai_response.text)
    
    gather.play(ai_voice)
    response.append(gather)
    
    return str(response) 