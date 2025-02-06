from elevenlabs import generate, VoiceSettings

class VoiceService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def generate_voice(self, text: str, voice_id: str = "Rachel"):
        try:
            audio = generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2",
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75
                )
            )
            return audio
        except Exception as e:
            raise Exception(f"Error generating voice: {str(e)}") 