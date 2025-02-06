import os
from dotenv import load_dotenv
from pathlib import Path

def test_env():
    env_path = Path(__file__).parent / '.env'
    print(f"Looking for .env at: {env_path}")
    print(f"File exists: {env_path.exists()}")
    
    if env_path.exists():
        print("\nContents of .env:")
        print(env_path.read_text())
    
    load_dotenv(dotenv_path=env_path)
    api_key = os.getenv("ELEVENLABS_API_KEY")
    print(f"\nELEVENLABS_API_KEY: {api_key}")

if __name__ == "__main__":
    test_env() 