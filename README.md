# Mental Health and Well-being AI Companion

A full-stack mental wellness platform that combines:

- RAG-based conversational support over uploaded PDF knowledge sources
- Emotion-aware response generation
- Clinical self-assessments (DASS-42, PHQ-9, GAD-7)
- Mood journaling and wellness tracking
- Gamified self-care tools (breathing and thought reframing)

Backend is built with FastAPI and LangChain. Frontend is built with React and Vite.

## What The Current Project Includes

- AI chat with source-grounded retrieval from FAISS vector storage
- User authentication and session handling with SQLite
- Assessment workflows and score interpretation
- Assessment support chat and AI interpretation endpoint
- Mood journal history and wellness stats tracking
- Badges and gratitude entries
- Emotion detection endpoint and emotion history
- Optional conversation-dataset ingestion from parquet data

## Tech Stack

- Python, FastAPI, Uvicorn
- LangChain, FAISS, sentence-transformers
- Groq API for LLM responses
- React 18, Vite, Tailwind CSS
- SQLite for user and wellness data

## Project Layout

- api.py: Main FastAPI backend
- chatbot.py: RAG and Groq response logic
- document_processor.py: PDF loading and chunking
- database.py: SQLite schema and data access
- process_documents.py: Build vector store from PDFs
- process_dataset.py: Add parquet conversation data into vector store
- frontend/: Vite React client
- data/: PDFs, vectorstore, and local database storage
- data2/: parquet dataset source
- backend.dockerfile, render.yaml, railway.json, frontend/vercel.json: deployment configs

## Prerequisites

- Python 3.9 or newer recommended
- Node.js 18 or newer recommended
- pip and npm
- A Groq API key

## Local Setup

1. Install backend dependencies

       pip install -r requirements.txt

2. Install frontend dependencies

       cd frontend
       npm install
       cd ..

3. Configure environment variables

   Create a .env file in the project root (optional but recommended):

       GROQ_API_KEY=your_groq_api_key
       FRONTEND_URL=http://localhost:3000

  Notes:

  - FRONTEND_URL is optional and is used to append an allowed CORS origin.
  - The frontend can also use VITE_API_BASE_URL (defaults to http://localhost:8000/api).

4. Prepare the knowledge base

   Add PDF files to the data folder, then run:

       python process_documents.py

   Optional: merge conversation dataset from data2/0000.parquet into the same vectorstore:

       python process_dataset.py

## Run The App (Development)

Start backend (from project root):

    uvicorn api:app --reload --host 0.0.0.0 --port 8000

Start frontend (from frontend folder):

    npm run dev

Open:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

## Key API Groups

- System and setup:
  - GET /
  - GET /api/status
  - POST /api/set-api-key

- RAG chat and docs:
  - POST /api/chat
  - POST /api/chat-with-emotion
  - POST /api/chat-with-auth
  - POST /api/upload-pdf
  - POST /api/process-documents
  - GET /api/list-pdfs
  - DELETE /api/clear-knowledge-base
  - DELETE /api/clear-chat-history

- Emotion utilities:
  - POST /api/analyze-emotion
  - GET /api/emotion-history
  - DELETE /api/clear-emotion-history

- Auth and user:
  - POST /api/register
  - POST /api/login
  - POST /api/verify-session

- Assessments:
  - POST /api/submit-assessment
  - GET /api/get-assessments/{session_token}
  - POST /api/assessment-support
  - POST /api/assessment-chat

- Wellness and gamification:
  - POST /api/mood-journal
  - GET /api/mood-journal/{session_token}
  - GET /api/wellness-stats/{session_token}
  - POST /api/wellness-stats/update
  - POST /api/badges/add
  - GET /api/badges/{session_token}
  - POST /api/gratitude/add
  - GET /api/gratitude/{session_token}

## Deployment Notes

- Backend
  - Docker: backend.dockerfile
  - Railway: railway.json

- Frontend
  - Vercel config: frontend/vercel.json

Set production environment variables (especially GROQ_API_KEY and frontend API base URL) in your hosting platform.

Recommended production variables:

- Backend:
  - FRONTEND_URL=https://your-frontend-domain.com
  - FRONTEND_URLS=https://your-frontend-domain.com,https://your-secondary-domain.com
  - CORS_ORIGIN_REGEX=https://.*\.(vercel\.app|netlify\.app|onrender\.com)$
- Frontend:
  - VITE_API_BASE_URL=https://your-backend-domain.com

## Optional Legacy UI

A Streamlit interface also exists in app.py and can be run separately:

    streamlit run app.py

The primary active product UI is the React frontend in the frontend folder.

## Important Disclaimer

This project is intended for educational and supportive wellness use. It is not a substitute for professional medical diagnosis or treatment. If someone is in immediate crisis, contact local emergency services or a qualified crisis helpline right away.

