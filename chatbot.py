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
    
    def generate_assessment_support(
        self,
        score: int,
        assessment_type: str,
        severity: str,
        item9_positive: bool = False,
        language: str = 'English',
        dass42_subscales: dict = None,
    ) -> str:
        """Generate a plain-language, compassionate interpretation of assessment results."""
        if not self.groq_client:
            return "Unable to generate interpretation — please check API configuration."

        max_scores = {'phq9': 27, 'gad7': 21, 'dass42': 126}
        max_score = max_scores.get(assessment_type, 100)

        type_names = {
            'phq9':   'PHQ-9 (Depression Screening)',
            'gad7':   'GAD-7 (Anxiety Screening)',
            'dass42': 'DASS-42 (Depression, Anxiety & Stress)'
        }
        type_name = type_names.get(assessment_type, assessment_type)

        # Build score detail line — use subscale breakdown for DASS-42 when available
        if assessment_type == 'dass42' and dass42_subscales:
            dep = dass42_subscales.get('depression', {})
            anx = dass42_subscales.get('anxiety', {})
            str_ = dass42_subscales.get('stress', {})
            score_detail = (
                f"Subscale scores (each out of 84):\n"
                f"  Depression: {dep.get('score', '?')}/84 — {dep.get('label', '?')}\n"
                f"  Anxiety:    {anx.get('score', '?')}/84 — {anx.get('label', '?')}\n"
                f"  Stress:     {str_.get('score', '?')}/84 — {str_.get('label', '?')}\n"
                f"Dominant severity: {severity.replace('_', ' ')}"
            )
        else:
            score_detail = f"Score: {score}/{max_score}\nSeverity level: {severity.replace('_', ' ')}"

        item9_note = (
            "\nNOTE: The user indicated thoughts of self-harm or being better off dead (item 9 > 0). "
            "Acknowledge this gently and include crisis resources (988, text HELLO to 741741) in your response."
        ) if item9_positive else ""

        prompt = f"""A user has just completed a {type_name} screening.
{score_detail}
{item9_note}

Provide a compassionate, plain-language response in exactly 3 short paragraphs:
1. What these results mean in everyday, jargon-free terms (2–3 sentences).
2. How someone with these results might be feeling day-to-day (2 sentences).
3. One encouraging sentence that acknowledges their courage in doing this self-check.

Rules:
- Never suggest a diagnosis
- Clearly state this is a screening tool, not a clinical assessment
- Be warm, non-alarmist, and supportive
- Keep total response under 180 words

Respond in {language}."""

        try:
            completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a compassionate mental health companion providing clear, supportive explanations. Never diagnose."},
                    {"role": "user", "content": prompt}
                ],
                model=config.GROQ_MODEL,
                temperature=0.7,
                max_tokens=400,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return "We couldn't generate a personalised interpretation right now. Please review the score summary above."

    def generate_assessment_chat_response(
        self,
        user_message: str,
        assessment_type: str,
        score: int,
        severity: str,
        chat_history: list,
        language: str = 'English',
        dass42_subscales: dict = None,
    ) -> str:
        """Generate a supportive conversational response with assessment context."""
        if not self.groq_client:
            return "⚠️ Groq API client is not initialized."

        type_names = {'phq9': 'PHQ-9 (depression)', 'gad7': 'GAD-7 (anxiety)', 'dass42': 'DASS-42'}
        type_label = type_names.get(assessment_type, assessment_type)

        # Build context description for DASS-42 subscales when available
        if assessment_type == 'dass42' and dass42_subscales:
            dep = dass42_subscales.get('depression', {})
            anx = dass42_subscales.get('anxiety', {})
            str_ = dass42_subscales.get('stress', {})
            score_context = (
                f"subscale scores of Depression {dep.get('score', '?')}/84 ({dep.get('label', '?')}), "
                f"Anxiety {anx.get('score', '?')}/84 ({anx.get('label', '?')}), "
                f"Stress {str_.get('score', '?')}/84 ({str_.get('label', '?')})"
            )
        else:
            score_context = f"a score of {score}, indicating {severity.replace('_', ' ')} symptoms"

        messages = [
            {
                "role": "system",
                "content": f"""You are a compassionate mental health support companion. The user completed a {type_label} screening with {score_context}.

Your role:
- Provide warm emotional support and active listening
- Ask one open, reflective question per response about their feelings, triggers, or recent experiences
- Suggest brief coping strategies when the user seems ready
- Use empathetic, non-judgmental language
- NEVER diagnose or prescribe
- Gently encourage professional help if symptoms seem severe or persistent
- If the user expresses thoughts of self-harm or suicide, immediately provide: 988 Suicide & Crisis Lifeline (call/text), or text HELLO to 741741

Respond in {language}. Keep responses warm but concise (under 120 words)."""
            }
        ]

        # Include recent chat history (last 8 turns)
        for entry in chat_history[-8:]:
            messages.append({"role": entry["role"], "content": entry["content"]})

        messages.append({"role": "user", "content": user_message})

        try:
            completion = self.groq_client.chat.completions.create(
                messages=messages,
                model=config.GROQ_MODEL,
                temperature=0.8,
                max_tokens=300,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"❌ Error: {str(e)}"

    def clear_history(self) -> None:
        """Clear the chat history."""
        self.chat_history = []
    
    def get_history(self) -> List[Tuple[str, str]]:
        """Get the chat history."""
        return self.chat_history
