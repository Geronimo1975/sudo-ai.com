import os
from dotenv import load_dotenv
import sys

def test_dialogflow_connection():
    try:
        # Load environment variables
        load_dotenv()
        
        print("Python version:", sys.version)
        
        # Import dialogflow here to catch import error specifically
        print("\nAttempting to import dialogflow_cx...")
        from google.cloud.dialogflowcx import SessionsClient
        print("Successfully imported dialogflow_cx!")
        
        # Your Dialogflow CX settings
        project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        location = os.getenv("DIALOGFLOW_LOCATION")
        agent_id = os.getenv("DIALOGFLOW_AGENT_ID")
        
        print(f"\nDialogflow CX Configuration:")
        print(f"Project ID: {project_id}")
        print(f"Location: {location}")
        print(f"Agent ID: {agent_id}")
        
        # Try to create a session client and test connection
        print("\nTesting connection to Dialogflow CX...")
        client_options = {"api_endpoint": f"{location}-dialogflow.googleapis.com"}
        session_client = SessionsClient(client_options=client_options)
        
        # Create a test session
        session_id = "test-session-1"
        session_path = session_client.session_path(
            project_id, location, agent_id, session_id
        )
        print(f"Session path created: {session_path}")
        
        # Try to send a test message
        from google.cloud.dialogflowcx import TextInput, QueryInput
        text = "Hello"
        text_input = TextInput(text=text)
        query_input = QueryInput(text=text_input, language_code="en-US")
        
        print(f"\nSending test message: '{text}'")
        response = session_client.detect_intent(
            request={"session": session_path, "query_input": query_input}
        )
        
        print("\nResponse from Dialogflow CX:")
        print(f"Response text: {response.query_result.response_messages[0].text.text[0]}")
        print(f"Intent: {response.query_result.intent.display_name}")
        print(f"Confidence: {response.query_result.intent_detection_confidence}")
        
        return True
        
    except ImportError as e:
        print(f"Import Error: {str(e)}")
        print("Please check if google-cloud-dialogflow-cx is installed correctly")
        print("\nTrying to list installed Google packages:")
        try:
            import pkg_resources
            for dist in pkg_resources.working_set:
                if "google" in dist.key:
                    print(f"- {dist.key} ({dist.version})")
        except Exception as pkg_e:
            print(f"Could not list packages: {pkg_e}")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_dialogflow_connection()