# 🧠 Serenly - Mental Health and Well-being AI Companion

> **Your Personal AI Companion for Mental Wellness**
>
> A comprehensive mental health platform designed to support your emotional well-being, reduce anxiety, help manage depression, and foster personal growth through AI-powered insights and evidence-based wellness practices.

## About Serenly

Serenly is a full-stack mental wellness application that combines the power of artificial intelligence with evidence-based therapeutic techniques to help you:

✨ **Core Features:**

- 🤖 **AI Chatbot Support** - Get personalized, empathetic responses grounded in mental health knowledge
- 😌 **Anxiety Management** - Access calming techniques, guided conversations, and stress-reduction strategies
- 😞 **Depression Support** - Track mood patterns, receive encouraging support, and develop coping strategies
- 📊 **Clinical Assessments** - Take standardized mental health assessments (DASS-42, PHQ-9, GAD-7) to understand your mental state
- 📝 **Mood Journaling** - Document your feelings and track emotional patterns over time
- 🏆 **Gamified Wellness** - Earn badges, practice gratitude, and engage with wellness mini-games for motivation
- 📚 **Knowledge Base** - Learn from comprehensive mental health resources and educational materials
- ❤️ **Emotion-Aware Responses** - AI adapts responses based on your emotional state for more empathetic support

## Why Serenly?

Mental health challenges are increasingly common, and many people struggle to access timely, affordable support. Serenly bridges this gap by providing:

- **24/7 Availability**: Access support whenever you need it, day or night
- **Evidence-Based Approaches**: Built on established psychological assessments and wellness practices
- **Privacy First**: Your mental health data is secure and confidential
- **Non-Judgmental Support**: AI provides compassionate support without stigma
- **Progress Tracking**: Monitor your wellness journey with detailed mood and emotion tracking
- **Accessible Resource Library**: Learn from expert-curated mental health materials

> ⚠️ **Important Disclaimer**: Serenly is a supportive wellness tool, not a replacement for professional mental health treatment. If you're in crisis, please contact emergency services or a crisis helpline immediately.

---

## 🏗️ Repository Structure

This README has been aligned to the current codebase (April 2026):

- Backend entrypoint: `app/api.py` (FastAPI app)
- Chat/RAG logic: `chatbot.py`
- Runtime config loader: `config_runtime.py` (reads from `config.py` or environment)
- Frontend app: `frontend/src/App.jsx` with Vite dev server on port `3000`
- Local data assets: `data/` (PDFs, vectorstore, SQLite DB)
- Optional dataset ingestion: `process_dataset.py` from `data2/`

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python, FastAPI, Uvicorn | RESTful API with async support |
| **AI/RAG** | LangChain, FAISS, sentence-transformers, Groq | Intelligent document retrieval and response generation |
| **Database** | SQLite | Persistent user data, chat history, assessments |
| **Vector Store** | FAISS | Semantic search over mental health knowledge base |
| **Frontend** | React 18, Vite, Tailwind CSS | Modern, responsive user interface |
| **API Communication** | Axios | Reliable HTTP requests between frontend and backend |

## 📂 Project Structure

```
├── app/
│   ├── __init__.py                 # Python package marker for backend app module
│   └── api.py                      # Main FastAPI application
├── chatbot.py                      # RAG retrieval & AI response logic
├── database.py                     # SQLite schema & persistence
├── document_processor.py           # PDF extraction & text chunking
├── process_documents.py            # Build vectorstore from PDFs
├── process_dataset.py              # Ingest conversation datasets
├── config.py                       # Local development configuration
├── config_runtime.py               # Deployment-safe runtime config
├── requirements.txt                # Python dependencies
│
├── frontend/                       # React + Vite application
│   ├── src/App.jsx                # Main React component
│   ├── package.json               # Node.js dependencies
│   ├── vite.config.js             # Vite build configuration
│   └── vercel.json                # Vercel deployment config
│
├── data/                          # Local knowledge base
│   ├── *.pdf                      # Mental health resource PDFs
│   └── vectorstore/               # FAISS vector index
│
├── backend.dockerfile             # Docker build for backend
├── render.yaml                    # Render.com deployment config
├── railway.json                   # Railway deployment config
└── README.md                      # This file
```

## 📋 Prerequisites

Before you start, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.9+ | Required for backend |
| Node.js | 18+ | Required for frontend |
| pip | Latest | Python package manager |
| npm | Latest | Node.js package manager |
| Groq API Key | - | [Get one free](https://console.groq.com) |

## ⚡ Quick Start

### 1. Clone & Setup Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your Groq API key
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "FRONTEND_URL=http://localhost:3000" >> .env
```

### 2. Prepare Knowledge Base

```bash
# Process mental health PDFs (required for knowledge-grounded responses)
python process_documents.py

# Optional: Ingest conversation dataset
python process_dataset.py
```

### 3. Setup Frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Start Development Servers

**Terminal 1 - Backend API:**
```bash
uvicorn app.api:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 📚 **API Docs**: http://localhost:8000/docs
- 🔧 **API Schema**: http://localhost:8000/openapi.json

## ⚙️ Configuration

Backend configuration supports two methods (environment variables take precedence):

### Method 1: Environment Variables (Recommended for Production)

```bash
# Required
GROQ_API_KEY=your_api_key

# Optional (defaults provided)
PDF_DIRECTORY=data
VECTORSTORE_DIRECTORY=data/vectorstore
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=http://localhost:3000,https://yourdomain.com
CORS_ORIGIN_REGEX=.*  # Allows all origins by default
VITE_API_BASE_URL=http://localhost:8000
```

### Method 2: Python Config File

Edit `config.py` for local development settings (loads if environment variables not set)

## 📡 API Overview

### System Endpoints
```
GET  /                    # Root endpoint
GET  /api/status         # API health check
POST /api/set-api-key   # Update Groq API key
```

### Chat & Knowledge Base
```
POST /api/chat                      # Standard AI chat
POST /api/chat-with-auth            # Authenticated chat
POST /api/chat-with-emotion         # Emotion-aware responses
POST /api/upload-pdf                # Upload mental health resources
POST /api/process-documents         # Reprocess vectorstore
GET  /api/list-pdfs                # List available knowledge base
DELETE /api/clear-knowledge-base   # Reset vectorstore
DELETE /api/clear-chat-history     # Clear conversation history
```

### Emotion & Mental Health
```
POST /api/analyze-emotion           # Analyze user's emotional state
GET  /api/emotion-history          # Retrieve emotion data
DELETE /api/clear-emotion-history  # Clear emotion records
```

### Authentication & Sessions
```
POST /api/register          # Create new account
POST /api/login            # Log in user
POST /api/verify-session   # Verify session token
```

### Clinical Assessments
```
POST /api/submit-assessment        # Submit DASS-42, PHQ-9, or GAD-7
GET  /api/get-assessments/{token} # View past assessments
POST /api/assessment-support      # Get support based on assessment
POST /api/assessment-chat         # Chat with assessment context
```

### Wellness & Gamification
```
POST /api/mood-journal                 # Log mood entry
GET  /api/mood-journal/{token}        # Retrieve mood history
GET  /api/wellness-stats/{token}      # Get wellness metrics
POST /api/wellness-stats/update       # Update wellness data
POST /api/badges/add                  # Earn achievement badge
GET  /api/badges/{token}              # View earned badges
POST /api/gratitude/add               # Log gratitude entry
GET  /api/gratitude/{token}           # View gratitude history
```

## 🚀 Deployment

### Deploy Backend

#### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up
```

#### Option 2: Render.com
- Connect GitHub repository
- Create new Web Service
- Set environment variables (especially `GROQ_API_KEY`)
- Render deploys automatically from `main` branch

#### Option 3: Docker
```bash
docker build -f backend.dockerfile -t Serenly-backend .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key Serenly-backend
```

### Deploy Frontend

#### Vercel (Recommended)
1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Set environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`
4. Vercel auto-deploys on push

#### Production Checklist
- [ ] Set `GROQ_API_KEY` in backend environment
- [ ] Configure `FRONTEND_URL` or `FRONTEND_URLS` for CORS
- [ ] Set `VITE_API_BASE_URL` in frontend
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure error logging/monitoring
- [ ] Test assessments and wellness features

## 📚 Features in Detail

### 🤖 AI-Powered Chat
- **Knowledge-Grounded Responses**: Answers based on your mental health knowledge base
- **Contextual Memory**: Remembers conversation history for coherent support
- **Emotion-Aware**: Detects emotional tone and adapts responses with empathy
- **24/7 Availability**: Get support anytime without appointment scheduling

### 😌 Anxiety & Stress Management
- **Guided Calming Techniques**: Step-by-step anxiety reduction exercises
- **Breathing Exercises**: Integrated mindfulness and breathing practice
- **Stress Tracking**: Monitor stress levels and identify triggers
- **Personalized Coping Strategies**: AI recommends techniques tailored to your needs

### 😞 Depression Support
- **Mood Tracking**: Log daily mood and emotional patterns
- **Depression Assessment**: PHQ-9 clinical assessment tool
- **Encouraging Support**: Compassionate responses that validate feelings
- **Progress Monitoring**: Visual charts showing mood trends over time

### 📊 Clinical Assessments
- **DASS-42**: Depression, Anxiety, Stress Scale (42 questions)
- **PHQ-9**: Patient Health Questionnaire for depression screening
- **GAD-7**: Generalized Anxiety Disorder assessment
- **Personalized Feedback**: Detailed results with wellness recommendations

### 📝 Mood Journaling
- **Free-Form Entry**: Express thoughts and feelings without structure
- **Mood Tagging**: Label entries with emotion categories
- **Pattern Recognition**: AI identifies mood patterns and triggers
- **Historical Review**: Browse past entries and see your progress

### 🏆 Gamification & Motivation
- **Achievement Badges**: Earn badges for consistency and milestones
- **Gratitude Practice**: Daily gratitude logging for positive psychology
- **Streak Tracking**: Maintain streaks to stay motivated
- **Wellness Points**: Track progress with gamified metrics

### 📚 Educational Resources
- **Mental Health Knowledge Base**: Learn about conditions, treatments, and self-help
- **Coping Strategy Library**: Curated techniques from evidence-based therapy
- **Personalized Recommendations**: Content tailored to your mental health needs

## 🔒 Privacy & Security

- **End-to-End**: Communication between frontend and backend is encrypted
- **Data Minimization**: We only collect necessary wellness data
- **No Tracking**: No third-party analytics or data selling
- **Secure Database**: SQLite with proper access controls
- **Session Management**: Secure token-based authentication
- **GDPR Compliant**: Supports data export and deletion requests

## ❓ FAQ

**Q: Is my data really private?**
A: Yes. All data is stored locally or securely encrypted. We don't sell or share your mental health information.

**Q: Can this replace therapy?**
A: Serenly is a supportive tool, not a replacement for professional mental health care. Use it alongside professional support, not instead of it.

**Q: What if I'm having a crisis?**
A: If you're in immediate danger, contact emergency services. For crisis support:
- National Suicide Prevention Lifeline: 988 (US)
- Crisis Text Line: Text HOME to 741741
- International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

**Q: How accurate are the AI responses?**
A: Responses are grounded in your knowledge base and generated by Groq's LLM. They're informative but should never replace professional diagnosis.

**Q: Do you store conversation history?**
A: Yes, if you're logged in. You can clear history anytime via the API or delete your account.

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Areas for Contribution
- 🎨 UI/UX improvements
- 🔧 Backend optimization
- 📚 Mental health resource curation
- 🧪 Testing and bug fixes
- 📖 Documentation improvements
- 🌍 Localization/translations
- ♿ Accessibility improvements

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Frontend with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- AI powered by [Groq](https://groq.com/)
- Data processing with [LangChain](https://www.langchain.com/)
- Special thanks to mental health professionals who guided this project

