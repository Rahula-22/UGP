# Mental Health and Well-being AI Companion

Full-stack mental wellness application with a FastAPI backend and a React + Vite frontend.

Core capabilities:

- Retrieval-augmented AI chat over uploaded PDF knowledge sources
- Emotion-aware response support
- Clinical self-assessments (DASS-42, PHQ-9, GAD-7)
- Mood journaling and wellness progress tracking
- Gamified wellness elements (badges, gratitude, mini-games)

## Live Demo

- https://frontend-iota-smoky-22.vercel.app/

## Repository Analysis Snapshot

This README has been aligned to the current codebase (April 2026):

- Backend entrypoint: `api.py` (FastAPI app)
- Chat/RAG logic: `chatbot.py`
- Runtime config loader: `config_runtime.py` (reads from `config.py` or environment)
- Frontend app: `frontend/src/App.jsx` with Vite dev server on port `3000`
- Local data assets: `data/` (PDFs, vectorstore, SQLite DB)
- Optional dataset ingestion: `process_dataset.py` from `data2/`

## Tech Stack

- Backend: Python, FastAPI, Uvicorn, Pydantic
- AI/RAG: LangChain, FAISS, sentence-transformers, Groq
- Data: SQLite (application data), local FAISS index (`data/vectorstore/index.faiss`)
- Frontend: React 18, Vite, Tailwind CSS, Axios

## Project Structure

- `api.py`: Main REST API
- `chatbot.py`: RAG retrieval + response generation flow
- `document_processor.py`: PDF extraction and chunking
- `database.py`: SQLite schema and persistence helpers
- `process_documents.py`: Build/rebuild vectorstore from PDFs
- `process_dataset.py`: Add parquet conversation data to vectorstore
- `config.py`: Local development config (supports `.env` through `python-dotenv`)
- `config_runtime.py`: Deployment-safe runtime configuration fallback
- `frontend/`: React client
- `backend.dockerfile`, `render.yaml`, `railway.json`, `frontend/vercel.json`: Deployment configs

## Prerequisites

- Python 3.9+
- Node.js 18+
- pip and npm
- Groq API key

## Configuration

Backend can be configured in either of these ways:

1. `config.py` (local developer settings)
2. Environment variables (recommended for deployment)

Minimum required variable:

- `GROQ_API_KEY`

Common optional variables:

- `PDF_DIRECTORY` (default: `data`)
- `VECTORSTORE_DIRECTORY` (default: `data/vectorstore`)
- `FRONTEND_URL` (single CORS origin)
- `FRONTEND_URLS` (comma-separated CORS origins)
- `CORS_ORIGIN_REGEX` (default allows common hosted frontend domains)
- `VITE_API_BASE_URL` (frontend API base override)

Example `.env` for local backend:

```env
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
```

## Local Development Setup

1. Install backend dependencies:

```bash
pip install -r requirements.txt
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

3. Prepare knowledge base (required for document-grounded answers):

```bash
python process_documents.py
```

Optional: ingest dataset from `data2/0000.parquet`:

```bash
python process_dataset.py
```

4. Start backend API (project root):

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

5. Start frontend (from `frontend/`):

```bash
npm run dev
```

Open:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## API Overview

System:

- `GET /`
- `GET /api/status`
- `POST /api/set-api-key`

Chat and documents:

- `POST /api/chat`
- `POST /api/chat-with-auth`
- `POST /api/chat-with-emotion`
- `POST /api/upload-pdf`
- `POST /api/process-documents`
- `GET /api/list-pdfs`
- `DELETE /api/clear-knowledge-base`
- `DELETE /api/clear-chat-history`

Emotion:

- `POST /api/analyze-emotion`
- `GET /api/emotion-history`
- `DELETE /api/clear-emotion-history`

Auth and sessions:

- `POST /api/register`
- `POST /api/login`
- `POST /api/verify-session`

Assessments:

- `POST /api/submit-assessment`
- `GET /api/get-assessments/{session_token}`
- `POST /api/assessment-support`
- `POST /api/assessment-chat`

Wellness and gamification:

- `POST /api/mood-journal`
- `GET /api/mood-journal/{session_token}`
- `GET /api/wellness-stats/{session_token}`
- `POST /api/wellness-stats/update`
- `POST /api/badges/add`
- `GET /api/badges/{session_token}`
- `POST /api/gratitude/add`
- `GET /api/gratitude/{session_token}`

## Deployment

Backend options included in repo:

- Docker file: `backend.dockerfile`
- Railway config: `railway.json`

Frontend option included in repo:

- Vercel config: `frontend/vercel.json`

Production recommendation:

- Backend: set `GROQ_API_KEY` and frontend origin/CORS variables
- Frontend: set `VITE_API_BASE_URL` to backend base URL


Primary UI is the React app in `frontend/`.

## Disclaimer

This project is for educational and supportive wellness use. It is not a substitute for professional medical diagnosis or treatment. In emergencies, contact local emergency services or a qualified crisis helpline immediately.

