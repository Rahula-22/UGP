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
import config
from database import Database
import json

# Initialize FastAPI app
app = FastAPI(
    title="Mental Health AI Companion API",
    description="Backend API for RAG-based mental health chatbot",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
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
    user_id = db.create_user(request.username, request.email, request.password)
    
    if user_id:
        return {"success": True, "message": "User registered successfully"}
    else:
        raise HTTPException(status_code=400, detail="Username or email already exists")

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
        "interpretation": interpret_score(score, assessment_type)
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
    """Chat with authentication"""
    user = db.verify_session(session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Use existing chat logic
    if not chatbot.groq_client and config.GROQ_API_KEY:
        chatbot.set_groq_api_key(config.GROQ_API_KEY)
    
    response, sources, emotion_data = chatbot.chat(request.message, language=request.language or 'English')

    # Save to database
    db.save_chat_message(user['id'], request.message, response)
    
    # Format sources
    formatted_sources = []
    for doc in sources:
        formatted_sources.append({
            "source": os.path.basename(doc.metadata.get('source', 'Unknown')),
            "page": doc.metadata.get('page', 'N/A'),
            "content": doc.page_content[:300] + "..."
        })
    
    return ChatResponse(response=response, sources=formatted_sources)

def calculate_mental_health_score(responses: Dict, assessment_type: str = 'dass42') -> int:
    """Calculate total score from questionnaire responses."""
    return sum(int(v) for v in responses.values())


def interpret_score(score: int, assessment_type: str = 'dass42') -> Dict:
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
        # DASS-42 (legacy path — total score interpretation)
        if score <= 4:
            severity = "minimal"
            recommendation = "Your responses suggest minimal symptoms. Continue practising self-care."
        elif score <= 9:
            severity = "mild"
            recommendation = "Your responses suggest mild symptoms. Consider speaking with a counsellor."
        elif score <= 14:
            severity = "moderate"
            recommendation = "Your responses suggest moderate symptoms. We recommend consulting a mental health professional."
        elif score <= 19:
            severity = "moderately_severe"
            recommendation = "Your responses suggest moderately severe symptoms. Please seek professional help soon."
        else:
            severity = "severe"
            recommendation = "Your responses suggest severe symptoms. Please seek professional help immediately."

        return {
            "assessment_type": "DASS-42",
            "severity": severity,
            "score": score,
            "recommendation": recommendation,
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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
