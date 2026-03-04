"""
Configuration settings for the Mental Health RAG Chatbot.
Copy this file to config.py and add your actual API key.
"""

# Directory settings
PDF_DIRECTORY = "data"
VECTORSTORE_DIRECTORY = "data/vectorstore"

# Document processing settings
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Retrieval settings
NUM_RETRIEVED_DOCS = 4

# Model settings
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Groq LLM settings
GROQ_API_KEY = ""  # Add your Groq API key here (get from https://console.groq.com)
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_TEMPERATURE = 0.7
GROQ_MAX_TOKENS = 1024

# Chat settings
MAX_HISTORY_LENGTH = 10

# UI settings
APP_TITLE = "Mental Health & Well-being AI Companion"
APP_ICON = "🧠"
WELCOME_MESSAGE = """
Welcome to your AI Mental Health Companion! 🧠

I'm here to support you by providing information based on medical and mental health documents.

**Note:** I provide information based on the documents you've uploaded. For professional medical advice, please consult a healthcare provider.
"""
