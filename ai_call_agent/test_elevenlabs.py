import os
from dotenv import load_dotenv
from elevenlabs import generate, voices, set_api_key

load_dotenv()

def test_elevenlabs():
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        set_api_key(api_key)
        
        print("Testing ElevenLabs connection...")
        
        # Get and print available voices first
        available_voices = voices()
        if not available_voices:
            raise ValueError("No voices available in your account. Please check your subscription.")
            
        print("\nAvailable voices:")
        for voice in available_voices:
            print(f"- {voice.name} (ID: {voice.voice_id})")
        
        # Use the first available voice
        first_voice = available_voices[0]
        voice_id = first_voice.voice_id
        test_text = "This is a test message."
        print(f"\nGenerating test audio with text: '{test_text}' using voice: {first_voice.name} (ID: {voice_id})")
        
        audio = generate(
            text=test_text,
            voice=voice_id,
            model="eleven_multilingual_v2"
        )
        
        # Salvăm audio pentru verificare
        test_file = "test_audio.mp3"
        with open(test_file, "wb") as f:
            f.write(audio)
        print(f"\nTest audio saved to: {test_file}")
        
        return True
    except Exception as e:
        print(f"\nElevenLabs test failed: {str(e)}")
        print(f"API Key used: {api_key[:10]}...")  # Afișăm doar primele 10 caractere pentru securitate
        return False

if __name__ == "__main__":
    test_elevenlabs()
