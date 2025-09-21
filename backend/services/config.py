from dotenv import load_dotenv, dotenv_values
import os

load_dotenv()

print(os.getenv('GEMINI_API_KEY'))

print(dotenv_values('.env'))
    


