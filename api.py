"""
FastAPI backend for the Mental Health Chatbot
Provides REST API endpoints for the frontend
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from chatbot import MentalHealthChatbot
from document_processor import DocumentProcessor
import config

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

# Request/Response models
class ChatRequest(BaseModel):
    message: str
    api_key: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[dict]

class StatusResponse(BaseModel):
    knowledge_base_loaded: bool
    total_documents: int
    api_key_set: bool

class ApiKeyRequest(BaseModel):
    api_key: str

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
        response, sources = chatbot.chat(request.message)
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
