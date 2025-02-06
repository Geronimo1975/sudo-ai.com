from typing import Dict, List
import json
import os
from elevenlabs import generate
from ..models import AIResponse


class AIService:
    def __init__(self):
        self.conversation_context = []
        self.default_responses = {
            "greeting": "Bună ziua! Cu ce vă pot ajuta?",
            "farewell": "La revedere! O zi bună!",
            "not_understood": "Îmi cer scuze, nu am înțeles întrebarea. Puteți reformula?"
        }
        
    def process_input(self, text: str) -> AIResponse:
        """
        Procesează input-ul utilizatorului și generează un răspuns
        """
        # Adăugăm input-ul la contextul conversației
        self.conversation_context.append({
            "role": "user",
            "content": text
        })
        
        # Aici vom implementa logica de procesare
        # Pentru moment, folosim răspunsuri simple
        response = self._generate_basic_response(text)
        
        # Adăugăm răspunsul la context
        self.conversation_context.append({
            "role": "assistant",
            "content": response.text
        })
        
        return response
    
    def _generate_basic_response(self, text: str) -> AIResponse:
        """
        Generează un răspuns de bază bazat pe cuvinte cheie
        """
        text = text.lower()
        
        # Logică simplă de răspuns
        if any(word in text for word in ["bună", "salut", "hey"]):
            return AIResponse(
                text=self.default_responses["greeting"],
                confidence=0.9,
                intent="greeting"
            )
        elif any(word in text for word in ["la revedere", "pa", "bye"]):
            return AIResponse(
                text=self.default_responses["farewell"],
                confidence=0.9,
                intent="farewell"
            )
        else:
            # Aici putem adăuga logică mai complexă pentru alte tipuri de întrebări
            return AIResponse(
                text=self.default_responses["not_understood"],
                confidence=0.5,
                intent="unknown"
            )
    
    def generate_voice_response(self, text: str) -> bytes:
        """
        Generează răspunsul vocal folosind ElevenLabs
        """
        try:
            audio = generate(
                text=text,
                voice="Rachel",
                model="eleven_multilingual_v2"
            )
            return audio
        except Exception as e:
            raise Exception(f"Eroare la generarea vocii: {str(e)}")


def generate_ai_response(text: str) -> str:
    """
    Funcție helper pentru generarea răspunsurilor AI
    """
    ai_service = AIService()
    response = ai_service.process_input(text)
    return response.text 