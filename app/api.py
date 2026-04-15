"""
FastAPI backend for the Mental Health Chatbot
Provides REST API endpoints for the frontend
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import shutil
from chatbot import MentalHealthChatbot
from document_processor import DocumentProcessor
import config_runtime as config
from database import Database
import json

# Initialize FastAPI app
app = FastAPI(
    title="Mental Health AI Companion API",
    description="Backend API for RAG-based mental health chatbot",
    version="1.0.0"
)

# Enable CORS for frontend communication
# Supports local dev and multiple production domains.
cors_origins = [
    "http://localhost:3000",      # React dev server (Create React App)
    "http://localhost:5173",      # Vite dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

frontend_url = os.getenv("FRONTEND_URL", "").strip()
if frontend_url:
    cors_origins.append(frontend_url)

# Optional comma-separated list for production frontends.
frontend_urls = os.getenv("FRONTEND_URLS", "").strip()
if frontend_urls:
    cors_origins.extend([
        url.strip()
        for url in frontend_urls.split(",")
        if url.strip()
    ])

# Preserve order while removing duplicates.
cors_origins = list(dict.fromkeys(cors_origins))

cors_origin_regex = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"https://.*\.(vercel\.app|netlify\.app|onrender\.com)$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chatbot with API key from config
chatbot = MentalHealthChatbot(groq_api_key=config.GROQ_API_KEY)
chatbot.load_knowledge_base()

# Initialize database
db = Database()

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None
    language: Optional[str] = 'English'
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]

class StatusResponse(BaseModel):
    knowledge_base_loaded: bool
    total_documents: int
    api_key_set: bool

class ApiKeyRequest(BaseModel):
    api_key: str

# Add new models
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class AssessmentRequest(BaseModel):
    responses: Dict
    session_token: str
    assessment_type: Optional[str] = 'dass42'

class EmotionResponse(BaseModel):
    primary_emotion: str
    confidence: float
    all_emotions: Dict[str, float]
    intensity: str
    method: str

class EnhancedChatResponse(BaseModel):
    response: str
    sources: List[dict]
    emotion: EmotionResponse

class AssessmentSupportRequest(BaseModel):
    session_token: str
    score: int
    assessment_type: str
    severity: str
    item9_positive: bool = False
    language: Optional[str] = 'English'
    dass42_subscales: Optional[Dict] = None

class MoodJournalRequest(BaseModel):
    session_token: str
    mood_score: int
    emotions: List[str] = []
    triggers: str = ''
    notes: str = ''

class AssessmentChatRequest(BaseModel):
    session_token: str
    message: str
    assessment_type: str
    score: int
    severity: str
    chat_history: List[Dict] = []
    language: Optional[str] = 'English'
    dass42_subscales: Optional[Dict] = None

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Mental Health AI Companion API is running"}

@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    """Get system status"""
    vectorstore_path = os.path.join(config.VECTORSTORE_DIRECTORY, "index.faiss")
    knowledge_base_loaded = os.path.exists(vectorstore_path)
    
    # Count PDFs
    pdf_count = 0
    if os.path.exists(config.PDF_DIRECTORY):
        pdf_count = len([f for f in os.listdir(config.PDF_DIRECTORY) if f.endswith('.pdf')])
    
    # Check if API key is set (from config or chatbot)
    api_key_set = bool(config.GROQ_API_KEY or chatbot.groq_client is not None)
    
    return StatusResponse(
        knowledge_base_loaded=knowledge_base_loaded,
        total_documents=pdf_count,
        api_key_set=api_key_set
    )

@app.post("/api/set-api-key")
async def set_api_key(request: ApiKeyRequest):
    """Set Groq API key"""
    try:
        chatbot.set_groq_api_key(request.api_key)
        return {"success": True, "message": "API key set successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message and get AI response"""
    try:
        # Use API key from config if not provided in request
        if request.api_key:
            chatbot.set_groq_api_key(request.api_key)
        elif not chatbot.groq_client and config.GROQ_API_KEY:
            chatbot.set_groq_api_key(config.GROQ_API_KEY)
        
        # Get response
        response, sources, emotion_data = chatbot.chat(request.message, language=request.language or 'English')

        # Format sources
        formatted_sources = []
        for doc in sources:
            formatted_sources.append({
                "source": os.path.basename(doc.metadata.get('source', 'Unknown')),
                "page": doc.metadata.get('page', 'N/A'),
                "content": doc.page_content[:300] + "..."
            })

        return ChatResponse(response=response, sources=formatted_sources)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF document"""
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save file
        os.makedirs(config.PDF_DIRECTORY, exist_ok=True)
        file_path = os.path.join(config.PDF_DIRECTORY, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"success": True, "message": f"File {file.filename} uploaded successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-documents")
async def process_documents():
    """Process all uploaded PDFs"""
    try:
        processor = DocumentProcessor(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP
        )
        
        chunks = processor.process_directory(config.PDF_DIRECTORY)
        
        if not chunks:
            return {"success": False, "message": "No documents found to process"}
        
        chatbot.add_documents_to_knowledge_base(chunks)
        
        return {
            "success": True,
            "message": f"Processed {len(chunks)} document chunks successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/clear-knowledge-base")
async def clear_knowledge_base():
    """Clear the knowledge base"""
    try:
        chatbot.vector_db.clear_vectorstore()
        return {"success": True, "message": "Knowledge base cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/clear-chat-history")
async def clear_chat_history():
    """Clear chat history"""
    try:
        chatbot.clear_history()
        return {"success": True, "message": "Chat history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/list-pdfs")
async def list_pdfs():
    """List all uploaded PDFs"""
    try:
        if not os.path.exists(config.PDF_DIRECTORY):
            return {"pdfs": []}
        
        pdfs = [f for f in os.listdir(config.PDF_DIRECTORY) if f.endswith('.pdf')]
        return {"pdfs": pdfs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        user_id = db.create_user(request.username, request.email, request.password)

        if user_id:
            return {"success": True, "message": "User registered successfully"}

        raise HTTPException(status_code=400, detail="Username or email already exists")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed on server: {str(e)}"
        )

@app.post("/api/login")
async def login(request: LoginRequest):
    """Login user"""
    user = db.authenticate_user(request.username, request.password)
    
    if user:
        session_token = db.create_session(user['id'])
        return {
            "success": True,
            "session_token": session_token,
            "user": user
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/verify-session")
async def verify_session(session_token: str):
    """Verify session token"""
    user = db.verify_session(session_token)
    
    if user:
        return {"success": True, "user": user}
    else:
        raise HTTPException(status_code=401, detail="Invalid session")

@app.post("/api/submit-assessment")
async def submit_assessment(request: AssessmentRequest):
    """Submit mental health assessment"""
    user = db.verify_session(request.session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Calculate score based on responses and assessment type
    assessment_type = request.assessment_type or 'dass42'
    score = calculate_mental_health_score(request.responses, assessment_type)

    # Save assessment
    db.save_assessment(
        user['id'],
        json.dumps(request.responses),
        score,
        assessment_type
    )

    return {
        "success": True,
        "score": score,
        "interpretation": interpret_score(score, assessment_type, request.responses)
    }

@app.get("/api/get-assessments/{session_token}")
async def get_assessments(session_token: str):
    """Get user's assessment history"""
    user = db.verify_session(session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    assessments = db.get_user_assessments(user['id'])
    return {"assessments": assessments}

@app.post("/api/chat-with-auth")
async def chat_with_auth(request: ChatRequest, session_token: str):
    """Chat with authentication and full personalization"""
    user = db.verify_session(session_token)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Create or get session
    session_id = request.session_id
    if not session_id:
        session_id = db.create_chat_session(user['id'])

    # Initialize Groq client if needed
    if not chatbot.groq_client and config.GROQ_API_KEY:
        chatbot.set_groq_api_key(config.GROQ_API_KEY)

    # Fetch personalization context
    try:
        # Get user's recent mood
        user_mood = None
        wellness_data = db.get_wellness_stats(user['id'])
        if wellness_data:
            user_mood = wellness_data.get('current_mood')

        # Get user's name
        user_name = user.get('username') or user.get('email', '').split('@')[0]

        # Get recent assessments
        assessment_data = {}
        assessments = db.get_user_assessments(user['id'], limit=3)
        if assessments:
            latest = assessments[0]  # Most recent
            if isinstance(latest, dict):
                responses = latest.get('responses')
                if isinstance(responses, str):
                    import json
                    responses = json.loads(responses)
                assessment_type = latest.get('assessment_type', 'dass42')
                assessment_data[assessment_type] = {
                    'score': latest.get('score', 0),
                    'responses': responses
                }
                # Parse scores if available in responses
                if isinstance(responses, dict):
                    assessment_data[assessment_type].update(responses)

        # Get conversation history for this session
        conversation_history = []
        session_messages = db.get_session_messages(user['id'], session_id)
        if session_messages:
            for msg in session_messages[-8:]:  # Last 8 messages
                conversation_history.append({
                    'message': msg.get('message'),
                    'response': msg.get('response')
                })

        # Get emotion history (from emotion tracking)
        emotion_history = db.get_emotion_history(user['id'], limit=20)

        # Generate personalized response
        response, sources, emotion_data = chatbot.chat_with_personalization(
            request.message,
            language=request.language or 'English',
            user_mood=user_mood,
            assessment_data=assessment_data,
            emotion_history=emotion_history,
            conversation_history=conversation_history,
            user_name=user_name
        )

    except Exception as e:
        print(f"Error during personalization: {str(e)}")
        # Fallback to standard response if personalization fails
        response, sources, emotion_data = chatbot.chat(request.message, language=request.language or 'English')

    # Save to database with session_id
    chat_id = db.save_chat_message(user['id'], session_id, request.message, response)

    # Format sources
    formatted_sources = []
    for doc in sources:
        formatted_sources.append({
            "source": os.path.basename(doc.metadata.get('source', 'Unknown')),
            "page": doc.metadata.get('page', 'N/A'),
            "content": doc.page_content[:300] + "..."
        })

    return {
        "response": response,
        "sources": formatted_sources,
        "chat_id": chat_id,
        "session_id": session_id
    }

@app.post("/api/create-session")
async def create_session(session_token: str, title: str = None):
    """Create a new chat session"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        session_id = db.create_chat_session(user['id'], title)
        return {"success": True, "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat-sessions/{session_token}")
async def get_chat_sessions(session_token: str, limit: int = 30):
    """Get a user's chat sessions"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        sessions = db.get_chat_sessions(user['id'], limit=limit)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session-messages/{session_token}/{session_id}")
async def get_session_messages(session_token: str, session_id: int):
    """Get all messages in a specific chat session"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        messages = db.get_session_messages(user['id'], session_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/chat-sessions/{session_token}/{session_id}")
async def delete_chat_session(session_token: str, session_id: int):
    """Delete a chat session and all its messages"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        success = db.delete_chat_session(user['id'], session_id)
        if success:
            return {"success": True, "message": "Chat session deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chat session not found or unauthorized")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat-history/{session_token}")
async def get_chat_history(session_token: str, limit: int = 30):
    """Get a user's previous chat messages (sessions)"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        history = db.get_chat_history(user['id'], limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/chat-history/{session_token}/{chat_id}")
async def delete_chat_message(session_token: str, chat_id: int):
    """Delete a specific chat message from history"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        success = db.delete_chat_message(user['id'], chat_id)
        if success:
            return {"success": True, "message": "Chat message deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Chat message not found or unauthorized")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def calculate_mental_health_score(responses: Dict, assessment_type: str = 'dass42') -> int:
    """Calculate total score from questionnaire responses."""
    return sum(int(v) for v in responses.values())


# DASS-42 question → subscale mapping (matches frontend question list)
_DASS42_SCALES: Dict[int, str] = {
    1: 'stress',      2: 'anxiety',     3: 'depression',  4: 'anxiety',
    5: 'depression',  6: 'stress',      7: 'anxiety',     8: 'stress',
    9: 'anxiety',    10: 'depression', 11: 'stress',     12: 'stress',
   13: 'depression', 14: 'stress',     15: 'anxiety',    16: 'depression',
   17: 'depression', 18: 'stress',     19: 'anxiety',    20: 'anxiety',
   21: 'depression', 22: 'stress',     23: 'anxiety',    24: 'depression',
   25: 'anxiety',    26: 'depression', 27: 'stress',     28: 'anxiety',
   29: 'stress',     30: 'anxiety',    31: 'depression', 32: 'stress',
   33: 'stress',     34: 'depression', 35: 'stress',     36: 'anxiety',
   37: 'depression', 38: 'depression', 39: 'stress',     40: 'anxiety',
   41: 'anxiety',    42: 'depression',
}


def calculate_dass42_subscales(responses: Dict) -> Dict[str, int]:
    """Return DASS-42 subscale scores (raw item sum × 2 per protocol)."""
    dep = anx = str_ = 0
    for q_id_str, val in responses.items():
        scale = _DASS42_SCALES.get(int(q_id_str), 'depression')
        v = int(val)
        if scale == 'depression':
            dep += v
        elif scale == 'anxiety':
            anx += v
        else:
            str_ += v
    return {'depression': dep * 2, 'anxiety': anx * 2, 'stress': str_ * 2}


def _dass42_subscale_severity(score: int, scale: str) -> Dict[str, str]:
    """Return severity key and display label for one DASS-42 subscale score."""
    thresholds: Dict[str, list] = {
        'depression': [(9, 'normal', 'Normal'), (13, 'mild', 'Mild'),
                       (20, 'moderate', 'Moderate'), (27, 'severe', 'Severe')],
        'anxiety':    [(7, 'normal', 'Normal'),  (9,  'mild', 'Mild'),
                       (14, 'moderate', 'Moderate'), (19, 'severe', 'Severe')],
        'stress':     [(14, 'normal', 'Normal'), (18, 'mild', 'Mild'),
                       (25, 'moderate', 'Moderate'), (33, 'severe', 'Severe')],
    }
    for t, key, label in thresholds.get(scale, thresholds['depression']):
        if score <= t:
            return {'severity': key, 'label': label}
    return {'severity': 'extremely_severe', 'label': 'Extremely Severe'}


def interpret_score(score: int, assessment_type: str = 'dass42', responses: Dict = None) -> Dict:
    """Interpret score according to the relevant assessment scale."""

    if assessment_type == 'phq9':
        if score <= 4:
            severity = "minimal"
            description = "Minimal or no depression"
            recommendation = "Monitor; may not require treatment."
        elif score <= 9:
            severity = "mild"
            description = "Mild depression"
            recommendation = "Clinical judgement required; consider watchful waiting and repeat PHQ-9 at follow-up."
        elif score <= 14:
            severity = "moderate"
            description = "Moderate depression"
            recommendation = "Consider a treatment plan including counselling, follow-up, or pharmacotherapy."
        elif score <= 19:
            severity = "moderately_severe"
            description = "Moderately severe depression"
            recommendation = "Active treatment recommended — antidepressants and/or psychotherapy."
        else:
            severity = "severe"
            description = "Severe depression"
            recommendation = "Immediate initiation of pharmacotherapy; if severe impairment consider expedited specialist referral."

        critical_actions = [
            "Perform suicide risk assessment if item 9 (thoughts of self-harm) is scored > 0.",
            "Rule out bipolar disorder, normal bereavement, and medical disorders causing depression.",
        ]
        return {
            "assessment_type": "PHQ-9",
            "severity": severity,
            "description": description,
            "score": score,
            "score_range": "0–27",
            "recommendation": recommendation,
            "critical_actions": critical_actions,
            "crisis_resources": "If you are in crisis, call or text 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741.",
        }

    elif assessment_type == 'gad7':
        if score <= 4:
            severity = "minimal"
            description = "Minimal anxiety"
            recommendation = "Monitor symptoms."
        elif score <= 9:
            severity = "mild"
            description = "Mild anxiety"
            recommendation = "Monitor; possible clinically significant anxiety."
        elif score <= 14:
            severity = "moderate"
            description = "Moderate anxiety"
            recommendation = "Possible clinically significant anxiety — consider further evaluation and treatment."
        else:
            severity = "severe"
            description = "Severe anxiety"
            recommendation = "Active treatment likely needed — refer for further evaluation."

        critical_actions = [
            "Rule out medical causes of anxiety before diagnosing an anxiety disorder (e.g., ECG for arrhythmias, TSH for thyroid disease).",
            "A score ≥10 is the recommended cut-off for further evaluation of GAD.",
        ]
        return {
            "assessment_type": "GAD-7",
            "severity": severity,
            "description": description,
            "score": score,
            "score_range": "0–21",
            "recommendation": recommendation,
            "critical_actions": critical_actions,
            "crisis_resources": "If you are in crisis, call or text 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741.",
        }

    else:
        # DASS-42 — proper subscale scoring
        if responses:
            subscales = calculate_dass42_subscales(responses)
            dep_s = _dass42_subscale_severity(subscales['depression'], 'depression')
            anx_s = _dass42_subscale_severity(subscales['anxiety'],    'anxiety')
            str_s = _dass42_subscale_severity(subscales['stress'],     'stress')

            _order = ['normal', 'mild', 'moderate', 'severe', 'extremely_severe']
            dominant = max(
                [dep_s['severity'], anx_s['severity'], str_s['severity']],
                key=lambda s: _order.index(s)
            )
            return {
                "assessment_type": "DASS-42",
                "severity": dominant,
                "score": score,
                "score_range": "0–126",
                "subscales": {
                    "depression": {"score": subscales["depression"], "severity": dep_s["severity"], "label": dep_s["label"]},
                    "anxiety":    {"score": subscales["anxiety"],    "severity": anx_s["severity"], "label": anx_s["label"]},
                    "stress":     {"score": subscales["stress"],     "severity": str_s["severity"], "label": str_s["label"]},
                },
                "crisis_resources": "If you're in crisis, call 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741.",
            }
        else:
            # Fallback without responses: map raw total (0–126) to severity bands
            _pct = score / 126
            if _pct < 0.20:
                severity = "normal"
            elif _pct < 0.35:
                severity = "mild"
            elif _pct < 0.55:
                severity = "moderate"
            elif _pct < 0.75:
                severity = "severe"
            else:
                severity = "extremely_severe"
            return {
                "assessment_type": "DASS-42",
                "severity": severity,
                "score": score,
                "score_range": "0–126",
                "crisis_resources": "If you're in crisis, call 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741.",
            }

@app.post("/api/chat-with-emotion", response_model=EnhancedChatResponse)
async def chat_with_emotion(request: ChatRequest):
    """Enhanced chat endpoint with emotion detection"""
    try:
        # Set API key if needed
        if request.api_key:
            chatbot.set_groq_api_key(request.api_key)
        elif not chatbot.groq_client and config.GROQ_API_KEY:
            chatbot.set_groq_api_key(config.GROQ_API_KEY)
        
        # Get response with emotion detection
        response, sources, emotion_data = chatbot.chat(request.message, language=request.language or 'English')
        
        # Format sources
        formatted_sources = []
        for doc in sources:
            formatted_sources.append({
                "source": os.path.basename(doc.metadata.get('source', 'Unknown')),
                "page": doc.metadata.get('page', 'N/A'),
                "content": doc.page_content[:300] + "..."
            })
        
        return EnhancedChatResponse(
            response=response,
            sources=formatted_sources,
            emotion=EmotionResponse(**emotion_data)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/emotion-history")
async def get_emotion_history(limit: int = 10):
    """Get recent emotion detection history"""
    try:
        history = chatbot.get_emotion_history(limit=limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/clear-emotion-history")
async def clear_emotion_history():
    """Clear emotion detection history"""
    try:
        chatbot.clear_emotion_history()
        return {"success": True, "message": "Emotion history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-emotion")
async def analyze_emotion(request: ChatRequest):
    """Standalone emotion analysis without generating response"""
    try:
        emotion_data = chatbot.emotion_detector.detect_emotion(request.message)
        return {"emotion": emotion_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/api/assessment-support")
async def assessment_support(request: AssessmentSupportRequest):
    """Generate AI-powered plain-language interpretation of an assessment result"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        if not chatbot.groq_client and config.GROQ_API_KEY:
            chatbot.set_groq_api_key(config.GROQ_API_KEY)
        interpretation = chatbot.generate_assessment_support(
            score=request.score,
            assessment_type=request.assessment_type,
            severity=request.severity,
            item9_positive=request.item9_positive,
            language=request.language or 'English',
            dass42_subscales=request.dass42_subscales,
        )
        return {"interpretation": interpretation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/assessment-chat")
async def assessment_chat(request: AssessmentChatRequest):
    """Supportive chat endpoint with assessment context — no RAG retrieval"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        if not chatbot.groq_client and config.GROQ_API_KEY:
            chatbot.set_groq_api_key(config.GROQ_API_KEY)
        response = chatbot.generate_assessment_chat_response(
            user_message=request.message,
            assessment_type=request.assessment_type,
            score=request.score,
            severity=request.severity,
            chat_history=request.chat_history,
            language=request.language or 'English',
            dass42_subscales=request.dass42_subscales,
        )
        try:
            session_id = db.create_chat_session(
                user['id'],
                title=f"{request.assessment_type.upper()} Assessment Support"
            )
            db.save_chat_message(user['id'], session_id, request.message, response)
        except Exception as save_error:
            print(f"Warning: failed to persist assessment chat message: {save_error}")
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/mood-journal")
async def save_mood_journal(request: MoodJournalRequest):
    """Save a mood journal entry"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        import json as _json
        entry_id = db.save_journal_entry(
            user_id=user['id'],
            mood_score=request.mood_score,
            emotions=_json.dumps(request.emotions),
            triggers=request.triggers,
            notes=request.notes,
        )
        return {"success": True, "entry_id": entry_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/mood-journal/{session_token}")
async def get_mood_journal(session_token: str, limit: int = 30):
    """Get mood journal entries for a user"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        entries = db.get_journal_entries(user['id'], limit=limit)
        return {"entries": entries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/wellness-stats/{session_token}")
async def get_wellness_stats(session_token: str):
    """Get wellness stats (points, streaks, etc)"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        stats = db.get_or_create_wellness_stats(user['id'])
        return {"stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WellnessStatsUpdate(BaseModel):
    session_token: str
    points: int = 0
    streak: Optional[int] = None
    longest_streak: Optional[int] = None
    last_checkin_date: Optional[str] = None


@app.post("/api/wellness-stats/update")
async def update_wellness_stats(request: WellnessStatsUpdate):
    """Update wellness stats"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        stats = db.update_wellness_stats(
            user_id=user['id'],
            points=request.points,
            streak=request.streak,
            longest_streak=request.longest_streak,
            last_checkin_date=request.last_checkin_date
        )
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class BadgeRequest(BaseModel):
    session_token: str
    badge_id: str
    badge_name: str


@app.post("/api/badges/add")
async def add_badge(request: BadgeRequest):
    """Add badge to user"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        success = db.add_badge(user['id'], request.badge_id, request.badge_name)
        if success:
            return {"success": True, "message": f"Badge {request.badge_name} unlocked!"}
        else:
            return {"success": False, "message": "Badge already unlocked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/badges/{session_token}")
async def get_badges(session_token: str):
    """Get all badges for user"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        badges = db.get_user_badges(user['id'])
        return {"badges": badges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class GratitudeRequest(BaseModel):
    session_token: str
    entry_text: str


@app.post("/api/gratitude/add")
async def add_gratitude_entry(request: GratitudeRequest):
    """Add gratitude entry"""
    user = db.verify_session(request.session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        entry_id = db.add_gratitude_entry(user['id'], request.entry_text)
        return {"success": True, "entry_id": entry_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/gratitude/{session_token}")
async def get_gratitude_entries(session_token: str, limit: int = 50):
    """Get gratitude entries for user"""
    user = db.verify_session(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    try:
        entries = db.get_gratitude_entries(user['id'], limit=limit)
        return {"entries": entries}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
