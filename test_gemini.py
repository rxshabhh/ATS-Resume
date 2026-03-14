import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")

client = genai.Client(api_key=api_key)

model_name = "gemini-2.5-flash"

print(f"\nTesting model: {model_name}")
try:
    response = client.models.generate_content(
        model=model_name,
        contents="Hello, world!"
    )
    print(f"Success! Response: {response.text}")
except Exception as e:
    print(f"Error with {model_name}: {e}")
