from typing import List, Tuple, Optional, Dict
from langchain_core.documents import Document
from datetime import datetime
from emotion_detector import EmotionDetector
from models import VectorDatabase
import config_runtime as config
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
        Clinical PDF sources and conversation-dataset examples are labelled
        separately so the LLM knows which to use for facts vs. tone/approach.

        Args:
            documents: List of relevant documents

        Returns:
            Formatted context string
        """
        if not documents:
            return "No relevant information found in the knowledge base."

        context_parts = []
        for i, doc in enumerate(documents, 1):
            source_type = doc.metadata.get('type', 'document')
            if source_type == 'conversation':
                context_parts.append(
                    f"[Conversation Example {i} — Mental Health Dataset]\n"
                    f"{doc.page_content}\n"
                )
            else:
                source = doc.metadata.get('source', 'Unknown source')
                page = doc.metadata.get('page', 'Unknown page')
                context_parts.append(
                    f"[Clinical Guideline {i} — {os.path.basename(source)}, Page {page}]\n"
                    f"{doc.page_content}\n"
                )

        return "\n".join(context_parts)
    
    def generate_response_with_groq(self, query: str, context: str, language: str = "English") -> str:
        """
        Generate a response using Groq LLM based on the query and retrieved context.
        """

        if not self.groq_client:
            return "⚠️ Groq API client is not initialized. Please check your API configuration."

        try:

            # System prompt controlling behavior
            system_prompt = f"""You are a calm, empathetic mental health support companion.

Your role is to respond like a supportive counselor who listens carefully,
acknowledges emotions, and offers practical guidance when appropriate.

Conversation principles:
• Respond naturally and conversationally.
• Be warm, respectful, and non-judgmental.
• Focus on the user's message and respond specifically to it.
• Avoid generic filler phrases and avoid sounding robotic.
• If someone is struggling deeply, ask them about what's going on. Listen to understand.
• Help them explore their feelings and work through problems with them.

Response approach when someone is in distress:
1. Respond with genuine warmth and care
2. Validate what they're feeling
3. Ask about their struggle — what's happening? What led to this?
4. Help them think through their situation and explore what might help
5. Offer practical suggestions when appropriate
6. Let them know they matter and their problems can be addressed

Safety approach:
• Never diagnose mental health conditions.
• Never cite documents, guidelines, or sources.
• If the user mentions suicidal thoughts, self-harm, or hopelessness: Stay present and engaged. Respond with compassion. Ask them about their pain. Help them understand what's driving these feelings. Affirm their worth. Suggest reaching out to someone they trust or a professional. If in immediate danger, they can call 988 or text HELLO to 741741. Keep the conversation going — your care and attention matter.

Context usage:
If background reference material is provided, use it only as internal guidance.
Do NOT mention or cite the source.

Language rule:
Respond entirely in {language}.
"""

            # Construct conversation messages
            messages = [{"role": "system", "content": system_prompt}]

            # Add recent chat history for context awareness
            for user_msg, assistant_msg in self.chat_history[-6:]:
                messages.append({"role": "user", "content": user_msg})
                messages.append({"role": "assistant", "content": assistant_msg})

            # Attach context if available
            if context and context != "No relevant information found in the knowledge base.":
                user_prompt = f"""
    Background reference (internal only):
    {context}

    User message:
    {query}
    """
            else:
                user_prompt = query

            messages.append({"role": "user", "content": user_prompt})

            # Call Groq
            chat_completion = self.groq_client.chat.completions.create(
                messages=messages,
                model=config.GROQ_MODEL,
                temperature=0.7,
                max_tokens=1200  # higher limit so responses are not truncated
            )

            return chat_completion.choices[0].message.content

        except Exception as e:
            return f"❌ Error generating response: {str(e)}"
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

    def chat_with_personalization(
        self,
        user_message: str,
        language: str = 'English',
        user_mood: str = None,
        assessment_data: Dict = None,
        emotion_history: List[Dict] = None,
        conversation_history: List[Dict] = None,
        user_name: str = None
    ) -> Tuple[str, List[Document], Dict]:
        """
        Enhanced chat with full personalization context.

        Args:
            user_message: User's current message
            language: Response language
            user_mood: Current mood ('anxiety', 'sad', 'stressed', 'happy', 'neutral')
            assessment_data: Recent mental health assessment scores
            emotion_history: User's recent emotion patterns
            conversation_history: Previous messages in this session
            user_name: User's name for personalization

        Returns:
            Tuple of (response, relevant_documents, emotion_data)
        """
        # Detect emotion for current message
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

        # Generate personalized response with full context
        response = self.generate_personalized_response(
            user_message,
            context,
            emotion_data,
            language,
            user_mood,
            assessment_data,
            emotion_history,
            conversation_history,
            user_name
        )

        # Update chat history
        self.chat_history.append((user_message, response))
        if len(self.chat_history) > config.MAX_HISTORY_LENGTH:
            self.chat_history.pop(0)

        return response, relevant_docs, emotion_data

    def generate_personalized_response(
        self,
        query: str,
        context: str,
        emotion: Dict,
        language: str = "English",
        user_mood: str = None,
        assessment_data: Dict = None,
        emotion_history: List[Dict] = None,
        conversation_history: List[Dict] = None,
        user_name: str = None
    ) -> str:
        """
        Generate response with full personalization context.

        Incorporates:
        - User's current mood
        - Recent assessment scores
        - Emotion patterns over time
        - Conversation history
        - User preferences and name
        """
        if not self.groq_client:
            return "⚠️ Groq API client is not initialized. Please check API configuration."

        try:
            # Extract emotion signals
            primary_emotion = emotion.get("primary_emotion", "neutral")
            intensity = emotion.get("intensity", "medium")

            # Build personalization context
            personalization_context = self._build_personalization_context(
                user_name,
                user_mood,
                assessment_data,
                emotion_history,
                primary_emotion
            )

            # Build enhanced system prompt with personalization
            system_prompt = f"""You are a warm, empathetic mental health support companion providing deeply personalized care.

{personalization_context}

Your role is to respond like a supportive counselor who:
• Listens carefully and acknowledges the user's unique situation
• Remembers their patterns and struggles
• Validates their emotions with genuine understanding
• Offers practical guidance tailored to what helps them
• Adapts your approach based on their emotional patterns

Conversation principles:
• Respond naturally and conversationally
• Be warm, respectful, and non-judgmental
• Focus specifically on what the user just shared
• Avoid generic advice — personalize based on their history
• If they mention recurring struggles, acknowledge the pattern
• Reference strategies that have worked for them before
• Match their emotional intensity with appropriate care

Response approach when someone is struggling:
1. Validate their specific situation (not just generic empathy)
2. Reference their patterns if relevant ("I know you've struggled with this before...")
3. Suggest coping strategies tailored to their needs
4. Connect to what has helped them previously
5. Let them know their concerns matter and are manageable

Safety approach:
• Never diagnose mental health conditions
• Never cite sources or documents
• If they mention suicidal thoughts, self-harm: Respond with deep compassion. Ask about their pain. Affirm their worth. Suggest 988 (US crisis line) or text HELLO to 741741
• If in immediate danger, they should contact emergency services

Context usage:
Use background reference material only as internal guidance. Never mention or cite sources.

Language requirement:
Respond entirely in {language}."""

            # Construct messages with conversation history
            messages = [{"role": "system", "content": system_prompt}]

            # Add relevant conversation history (last 6-8 exchanges)
            if conversation_history:
                history_to_add = conversation_history[-8:]
                for msg in history_to_add:
                    user_msg = msg.get("message", msg.get("user_message", ""))
                    asst_msg = msg.get("response", msg.get("assistant_message", ""))
                    if user_msg:
                        messages.append({"role": "user", "content": user_msg})
                    if asst_msg:
                        messages.append({"role": "assistant", "content": asst_msg})

            # Prepare user message with context
            if context and context != "No relevant information found in the knowledge base.":
                user_prompt = f"""Background reference (internal guidance only):
{context}

User message:
{query}"""
            else:
                user_prompt = query

            messages.append({"role": "user", "content": user_prompt})

            # Generate response with Groq
            chat_completion = self.groq_client.chat.completions.create(
                messages=messages,
                model=config.GROQ_MODEL,
                temperature=0.7,
                max_tokens=1200
            )

            return chat_completion.choices[0].message.content

        except Exception as e:
            return f"❌ Error generating personalized response: {str(e)}"

    def _build_personalization_context(
        self,
        user_name: str,
        user_mood: str,
        assessment_data: Dict,
        emotion_history: List[Dict],
        current_emotion: str
    ) -> str:
        """
        Build a personalization context string from user data.
        """
        context_parts = []

        # User name
        if user_name:
            context_parts.append(f"The user's name is {user_name}.")

        # Current mood context
        if user_mood:
            mood_contexts = {
                "anxiety": "The user is currently feeling anxious. They may benefit from grounding techniques, reassurance, and practical coping strategies.",
                "sad": "The user is feeling sad. Respond with compassion, validate their feelings, and help them explore what might lift their mood.",
                "stressed": "The user is experiencing stress. Help them prioritize, break down challenges, and find practical solutions.",
                "happy": "The user is in a positive mood. Reinforce positive thinking patterns and help them maintain momentum.",
                "neutral": "The user is feeling neutral. Explore what brought them here and what would be most helpful."
            }
            context_parts.append(mood_contexts.get(user_mood, ""))

        # Assessment insights
        if assessment_data:
            insights = self._format_assessment_insights(assessment_data)
            if insights:
                context_parts.append(insights)

        # Emotion patterns
        if emotion_history and len(emotion_history) > 0:
            patterns = self._analyze_emotion_patterns(emotion_history)
            if patterns:
                context_parts.append(patterns)

        return "\n".join(filter(None, context_parts))

    def _format_assessment_insights(self, assessment_data: Dict) -> str:
        """
        Format mental health assessment data into helpful insights.
        """
        insights = []

        if isinstance(assessment_data, dict):
            if "dass42" in assessment_data:
                dass = assessment_data["dass42"]
                if isinstance(dass, dict):
                    if dass.get("depression_score", 0) > 20:
                        insights.append("• The user has indicated moderate to high depression symptoms. Prioritize hope, validation, and gentle action steps.")
                    if dass.get("anxiety_score", 0) > 20:
                        insights.append("• The user has indicated moderate to high anxiety. Offer grounding techniques and reassurance.")
                    if dass.get("stress_score", 0) > 20:
                        insights.append("• The user is under significant stress. Help with prioritization and stress-management techniques.")

            if "phq9" in assessment_data:
                phq9 = assessment_data["phq9"]
                if isinstance(phq9, dict):
                    score = phq9.get("total_score", 0)
                    if score > 15:
                        insights.append("• Recent depression screening suggests significant concern. Approach with extra care and validate their struggles.")
                    elif score > 10:
                        insights.append("• The user has been showing depressive symptoms. Check in about their wellbeing.")

            if "gad7" in assessment_data:
                gad7 = assessment_data["gad7"]
                if isinstance(gad7, dict):
                    score = gad7.get("total_score", 0)
                    if score > 15:
                        insights.append("• The user has elevated anxiety levels. Prioritize calming strategies and reassurance.")
                    elif score > 10:
                        insights.append("• Recent anxiety assessments suggest ongoing concern. Be especially validate and grounding.")

        return "Assessment context:\n" + "\n".join(insights) if insights else ""

    def _analyze_emotion_patterns(self, emotion_history: List[Dict]) -> str:
        """
        Analyze emotion patterns from recent history.
        """
        if not emotion_history or len(emotion_history) < 3:
            return ""

        # Get recent emotions
        recent = emotion_history[-10:]
        emotions = [entry.get("emotion", {}).get("primary_emotion", "neutral") for entry in recent if isinstance(entry, dict)]

        if not emotions:
            return ""

        # Count emotions
        from collections import Counter
        emotion_counts = Counter(emotions)
        most_common = emotion_counts.most_common(2)

        patterns = []
        if most_common:
            primary, count = most_common[0]
            pattern_msg = f"The user has been experiencing {primary} frequently"
            if len(most_common) > 1:
                secondary, _ = most_common[1]
                pattern_msg += f" and {secondary} occasionally"
            pattern_msg += ". Acknowledge this pattern and offer targeted support."
            patterns.append(pattern_msg)

        return "Recent emotion patterns:\n" + "\n".join(patterns) if patterns else ""

    def generate_emotion_aware_response(self, query: str, context: str, emotion: Dict, language: str = "English") -> str:
        """
        Generate response tailored to detected emotion.
        """

        if not self.groq_client:
            return "⚠️ Groq API client is not initialized. Please check API configuration."

        try:

            # Extract emotion signals
            primary_emotion = emotion.get("primary_emotion", "neutral")
            intensity = emotion.get("intensity", "medium")
            confidence = emotion.get("confidence", 0.0)

            emotion_guidance = {
                "sadness": "Respond with compassion and emotional validation.",
                "anxiety": "Provide reassurance and calming strategies.",
                "stress": "Offer practical stress-management suggestions.",
                "anger": "Validate feelings and guide toward healthy emotional processing.",
                "loneliness": "Express warmth and encourage connection.",
                "positive": "Reinforce positive emotions and wellbeing.",
                "neutral": "Respond supportively and explore the user's thoughts."
            }

            emotion_instruction = emotion_guidance.get(primary_emotion, emotion_guidance["neutral"])

            # Stronger emphasis if emotion intensity is high
            if intensity == "high":
                emotion_instruction += " The emotional intensity appears high, so respond with extra care and patience."

            # System prompt controlling assistant behavior
            system_prompt = f"""You are a warm, knowledgeable mental health companion — like a trusted friend who genuinely listens and knows a lot about mental well-being.

Your voice: conversational, grounded, and human. You sound like a real person, not a chatbot running a script. No bullet-pointed lists, no rigid templates, no formulaic structure. Each reply flows naturally from what the person just said.

How to respond:
- Read what the person actually wrote and respond to that specifically. Never give a generic reply.
- Draw on real mental health knowledge — breathing techniques, CBT strategies, mindfulness, sleep hygiene, journaling, grounding exercises, social connection — and weave them naturally into your response when they genuinely fit. Present advice as natural conversation ("something that tends to help with this is..."), never as a lecture.
- Vary your length. A brief message usually deserves a brief, warm reply. Something heavy deserves more space — but stay focused, not rambling.
- Ask a follow-up question only when it genuinely deepens the conversation. Avoid tacking one on every single reply just to fill space.
- Never start with hollow openers like "I understand", "That sounds tough", "Of course", or "I'm here for you". Get straight to a real, specific response.

Emotional context (keep this internal — do not name or describe the detection to the user):
The user appears to be feeling {primary_emotion} (intensity: {intensity}).
{emotion_instruction}

Background knowledge (keep this internal — use it to ground your advice, do not cite or mention sources):
The background reference material provided contains clinical guidelines and real counselling examples. Use any relevant insights naturally as part of your advice, expressed in plain conversational language. This is what separates a grounded, helpful response from a vague one.

Special handling for crisis moments:
- If the person mentions suicidal thoughts, self-harm, or feeling hopeless: This is important. Respond with genuine compassion and care.
  - Acknowledge their pain without judgment. Affirm that they matter and their feelings are valid.
  - Ask them about what's happening — what's driving these thoughts? What led to this moment? Listen deeply to understand their struggle.
  - Help them explore what's feeling overwhelming. Often people who are struggling need someone to understand the weight they're carrying.
  - Suggest immediate support: reaching out to someone they trust (friend, family, therapist), or if they're in immediate danger, call 988 (Suicide & Crisis Lifeline) or text HELLO to 741741.
  - Stay engaged in the conversation. Don't shut down the dialogue. Your presence and genuine care matter.

Hard limits:
- Never diagnose or suggest a specific condition.
- Never make them feel like a burden or like their problems can't be helped.
- Always treat crisis disclosures with the seriousness and compassion they deserve.

Respond entirely in {language}."""

            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation history
            for user_msg, assistant_msg in self.chat_history[-6:]:
                messages.append({"role": "user", "content": user_msg})
                messages.append({"role": "assistant", "content": assistant_msg})

            # Build user prompt with context
            if context and context != "No relevant information found in the knowledge base.":
                user_prompt = (
                    f"[Background reference — use naturally, do not cite]\n"
                    f"{context}\n\n"
                    f"[User message]\n{query}"
                )
            else:
                user_prompt = query

            messages.append({"role": "user", "content": user_prompt})

            chat_completion = self.groq_client.chat.completions.create(
                messages=messages,
                model=config.GROQ_MODEL,
                temperature=0.7,
                max_tokens=1200
            )

            return chat_completion.choices[0].message.content

        except Exception as e:
            return f"❌ Error generating response: {str(e)}"
    
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
                "content": f"""You are a calm, empathetic mental health companion supporting a user who just completed a {type_label} screening with {score_context}.

Follow these guidelines in every reply:

Response length: Match the message. A short question needs 3–4 sentences. A deeper emotional concern may need 5–7 sentences. No one-liners, and no long unbroken paragraphs.

Structure (follow this order each time):
  1. Acknowledge — recognize what they shared or how they might be feeling after completing the screening, in specific terms
  2. Normalize — gently affirm that their reaction or experience makes sense, where it fits naturally
  3. Guidance — offer one or two simple, practical coping strategies relevant to what they're going through (e.g. a breathing exercise, journaling, gentle movement, a sleep tip). One clear sentence per tip — no lengthy instructions.
  4. Follow-up — close with ONE thoughtful question that encourages them to open up further

Tone:
  - Warm, human, and conversational — like a trusted friend who understands mental health
  - Vary your opening naturally; never use filler openers like "I'm here for you", "That sounds tough", "Of course", or "I understand how you feel"
  - No clinical terms, jargon, or textbook language

Stay focused:
  - Respond specifically to what the user said — no generic replies
  - Skip coping suggestions if the user is asking a simple factual question; just address it warmly

Limits:
  - Never diagnose, label conditions, or suggest a specific disorder
  - If symptoms seem severe or persistent, gently mention that talking to a professional can help — without alarming them
  - If self-harm or suicidal thoughts are mentioned: respond with compassion, affirm their worth, and gently share: 988 Suicide & Crisis Lifeline (call or text), or text HELLO to 741741

Respond in {language}."""
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
                max_tokens=500,
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
