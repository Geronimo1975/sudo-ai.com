import os
from google.cloud import dialogflow_cx

def test_connection():
    try:
        # Verificăm că fișierul de credențiale există
        creds_path = "/home/dci-student/WEBSITE/sudo-ai.com/sudo-ai-call-agent-a00fb64d1f5a.json"
        if not os.path.exists(creds_path):
            print(f"Error: Credentials file not found at {creds_path}")
            return
            
        # Setăm variabila de mediu pentru credențiale
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
        
        print("Checking credentials file...")
        if os.path.exists(creds_path):
            print("Credentials file found")
            with open(creds_path, 'r') as f:
                print("Credentials file is readable")
        
        print("\nTrying to create client...")
        client = dialogflow_cx.SessionsClient()
        print("Successfully created client")
        
        print("\nChecking environment variables:")
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("DIALOGFLOW_LOCATION")
        agent_id = os.getenv("DIALOGFLOW_AGENT_ID")
        
        print(f"Project ID: {project_id}")
        print(f"Location: {location}")
        print(f"Agent ID: {agent_id}")
        
        if all([project_id, location, agent_id]):
            print("\nTrying to create session path...")
            session = client.session_path(
                project_id,
                location,
                agent_id,
                "test-session-id"
            )
            print(f"Successfully created session path: {session}")
        else:
            print("\nMissing required environment variables!")
        
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        print(f"Error type: {type(e)}")


if __name__ == "__main__":
    test_connection() 