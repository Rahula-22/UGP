from typing import List, Tuple, Optional, Dict
from langchain_core.documents import Document
from datetime import datetime
from emotion_detector import EmotionDetector
from models import VectorDatabase
import config
import os

class MentalHealthChatbot:
    """
    RAG-based chatbot for mental health support.
    Retrieves relevant information from documents and generates responses using Groq LLM.
    """
    
    def __init__(self, groq_api_key: Optional[str] = None):
        """
        Initialize the chatbot with vector database and Groq client.
        
        Args:
            groq_api_key: Groq API key (optional, can be set in config or environment)
        """
        self.vector_db = VectorDatabase(config.VECTORSTORE_DIRECTORY)
        self.chat_history: List[Tuple[str, str]] = []
        self.emotion_detector = EmotionDetector()
        self.emotion_history: List[Dict] = []
        self.groq_client = None
        self.api_key = groq_api_key or config.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        
        # Initialize Groq client if API key is provided
        if self.api_key:
            self._initialize_groq_client(self.api_key)
    
    def _initialize_groq_client(self, api_key: str) -> None:
        """
        Initialize Groq client with error handling.
        
        Args:
            api_key: Groq API key
        """
        try:
            # Import here to avoid issues
            from groq import Groq
            
            # Try simple initialization without extra kwargs
            self.groq_client = Groq(api_key=api_key)
            print("Groq client initialized successfully")
        except TypeError as e:
            # If proxies error, try alternative initialization
            try:
                from groq import Groq
                import httpx
                
                # Create client with custom httpx client
                http_client = httpx.Client()
                self.groq_client = Groq(api_key=api_key, http_client=http_client)
                print("Groq client initialized with custom http client")
            except Exception as inner_e:
                print(f"Warning: Could not initialize Groq client: {inner_e}")
                self.groq_client = None
        except Exception as e:
            print(f"Warning: Could not initialize Groq client: {e}")
            self.groq_client = None
        
    def set_groq_api_key(self, api_key: str) -> None:
        """
        Set or update the Groq API key.
        
        Args:
            api_key: Groq API key
        """
        self.api_key = api_key
        self._initialize_groq_client(api_key)
        
        if not self.groq_client:
            raise Exception("Failed to initialize Groq client. Please check your API key and Groq package version.")
    
    def load_knowledge_base(self) -> bool:
        """
        Load existing knowledge base (vector database).
        
        Returns:
            True if loaded successfully, False otherwise
        """
        return self.vector_db.load_vectorstore()
    
    def add_documents_to_knowledge_base(self, documents: List[Document]) -> None:
        """
        Add new documents to the knowledge base.
        
        Args:
            documents: List of processed document chunks
        """
        self.vector_db.add_documents(documents)
    
    def retrieve_context(self, query: str) -> List[Document]:
        """
        Retrieve relevant context from the knowledge base.
        
        Args:
            query: User's question
            
        Returns:
            List of relevant document chunks
        """
        return self.vector_db.similarity_search(query, k=config.NUM_RETRIEVED_DOCS)
    
    def format_context(self, documents: List[Document]) -> str:
        """
        Format retrieved documents into a context string.
        
        Args:
            documents: List of relevant documents
            
        Returns:
            Formatted context string
        """
        if not documents:
            return "No relevant information found in the knowledge base."
        
        context_parts = []
        for i, doc in enumerate(documents, 1):
            source = doc.metadata.get('source', 'Unknown source')
            page = doc.metadata.get('page', 'Unknown page')
            context_parts.append(f"[Source {i}: {os.path.basename(source)}, Page {page}]\n{doc.page_content}\n")
        
        return "\n".join(context_parts)
    
    def generate_response_with_groq(self, query: str, context: str, language: str = 'English') -> str:
        """
        Generate a response using Groq LLM based on the query and retrieved context.

        Args:
            query: User's question
            context: Retrieved context from documents
            language: Language to respond in

        Returns:
            Generated response from Groq
        """
        if not self.groq_client:
            return "⚠️ Groq API client is not initialized. Please check your API key configuration or contact the administrator."

        lang_instruction = f"IMPORTANT: You must respond ENTIRELY in {language}. Even if your internal reasoning is in English, your final reply must be in {language} only."

        if context == "No relevant information found in the knowledge base.":
            prompt = f"""You are a supportive mental health companion. A user asked: "{query}"

Unfortunately, I couldn't find relevant information in the uploaded documents to answer this question.

Please provide a brief, empathetic response explaining that you don't have specific information about this topic in the knowledge base, and suggest they:
1. Rephrase their question
2. Ask about a different aspect of mental health
3. Consult with a healthcare professional for medical advice

Keep your response warm, supportive, and concise.

{lang_instruction}"""
        else:
            prompt = f"""You are a supportive mental health and well-being AI companion. Your role is to provide helpful, accurate, and empathetic information based on the documents provided.

**Context from documents:**
{context}

**User's question:**
{query}

**Instructions:**
- Answer the user's question based ONLY on the context provided above
- Be empathetic, supportive, and compassionate in your tone
- If the context doesn't fully answer the question, acknowledge what information is available
- Always remind users that this is informational and they should consult healthcare professionals for medical advice
- Keep your response clear, concise, and helpful
- Use markdown formatting for better readability
- {lang_instruction}

**Your response:**"""

        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a compassionate mental health companion providing information based on medical documents. Always be supportive, accurate, and remind users to seek professional help when needed. You must respond in {language} only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=config.GROQ_MODEL,
                temperature=config.GROQ_TEMPERATURE,
                max_tokens=config.GROQ_MAX_TOKENS,
            )

            return chat_completion.choices[0].message.content

        except Exception as e:
            return f"❌ Error generating response: {str(e)}\n\nPlease check your API key or try again later."

    def chat(self, user_message: str, language: str = 'English') -> Tuple[str, List[Document], Dict]:
        """
        Main chat function with emotion detection.
        
        Args:
            user_message: User's question or message
            
        Returns:
            Tuple of (response, relevant_documents, emotion_data)
        """
        # Detect emotion
        emotion_data = self.emotion_detector.detect_emotion(user_message)
        
        # Store emotion in history
        self.emotion_history.append({
            'timestamp': datetime.now().isoformat(),
            'message': user_message,
            'emotion': emotion_data
        })
        
        # Retrieve relevant context
        relevant_docs = self.retrieve_context(user_message)
        
        # Format context
        context = self.format_context(relevant_docs)
        
        # Generate emotion-aware response
        response = self.generate_emotion_aware_response(
            user_message,
            context,
            emotion_data,
            language
        )
        
        # Update chat history
        self.chat_history.append((user_message, response))
        if len(self.chat_history) > config.MAX_HISTORY_LENGTH:
            self.chat_history.pop(0)
        
        return response, relevant_docs, emotion_data
    
    def generate_emotion_aware_response(self, query: str, context: str, emotion: Dict, language: str = 'English') -> str:
        """Generate response tailored to detected emotion"""
        if not self.groq_client:
            return "⚠️ Groq API client is not initialized. Please check your API key configuration."

        emotion_guidance = {
            'sadness': "The user is experiencing sadness. Be extra compassionate, validating, and gentle.",
            'anxiety': "The user is feeling anxious. Provide reassurance and concrete coping strategies.",
            'stress': "The user is stressed. Offer practical stress management techniques.",
            'anger': "The user is feeling anger. Validate their feelings and help them process healthily.",
            'loneliness': "The user feels lonely. Express warmth and connection.",
            'positive': "The user is in a positive state. Reinforce their wellbeing.",
            'neutral': "Respond with supportive, informative guidance."
        }

        primary_emotion = emotion.get('primary_emotion', 'neutral')
        confidence = emotion.get('confidence', 0.0)
        intensity = emotion.get('intensity', 'medium')
        emotion_context = emotion_guidance.get(primary_emotion, emotion_guidance['neutral'])

        if intensity == 'high':
            intensity_note = "The user's emotional state appears intense. Be especially supportive."
        else:
            intensity_note = ""

        lang_instruction = f"IMPORTANT: Respond ENTIRELY in {language}. Your full reply must be written in {language} only."

        if context == "No relevant information found in the knowledge base.":
            prompt = f"""You are a supportive mental health companion.
**Detected Emotion:** {primary_emotion} (confidence: {confidence:.0%}, intensity: {intensity})
**Guidance:** {emotion_context}

A user said: "{query}"

Provide a brief, empathetic response acknowledging their emotional state.
{lang_instruction}"""
        else:
            prompt = f"""You are a supportive mental health companion.
**Detected Emotion:** {primary_emotion} (confidence: {confidence:.0%}, intensity: {intensity})
**Guidance:** {emotion_context}

**Context from documents:**
{context}

**User's message:**
{query}

Answer based on the context, adjusted for their emotional state of {primary_emotion}.
{lang_instruction}"""

        try:
            chat_completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": f"You are a compassionate mental health companion. The user is experiencing {primary_emotion}. You must respond in {language} only."},
                    {"role": "user", "content": prompt}
                ],
                model=config.GROQ_MODEL,
                temperature=config.GROQ_TEMPERATURE,
                max_tokens=config.GROQ_MAX_TOKENS,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"❌ Error: {str(e)}"
    
    def get_emotion_history(self, limit: int = 10) -> List[Dict]:
        """Get recent emotion history"""
        return self.emotion_history[-limit:]
    
    def clear_emotion_history(self) -> None:
        """Clear emotion history"""
        self.emotion_history = []
    
    def clear_history(self) -> None:
        """Clear the chat history."""
        self.chat_history = []
    
    def get_history(self) -> List[Tuple[str, str]]:
        """Get the chat history."""
        return self.chat_history
