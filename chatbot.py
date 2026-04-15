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
            system_prompt = f"""You are a warm, empathetic mental health support companion having a genuine conversation.

Your role: Listen carefully, respond specifically to what the person just said, and offer practical guidance when it fits naturally.

Core principles - MUST FOLLOW EVERY TIME:
• Respond uniquely each time. NO repetitive patterns. If you've used an opening before, change it completely.
• Forbidden phrases (never use these): "I can sense", "It's as if", "That sounds tough", "I understand how you feel", "Of course", "I'm here for you", "How does that sound", "Is there anything that resonates", "One thing that might help", "I want to remind you"
• Read what they actually wrote. Respond to THAT specifically. No generic templates.
• Sound like a real person. Conversational, direct, authentic — not like a script being read.
• Vary your length naturally. Short message = brief reply. Something heavy = more space but stay focused.
• Ask follow-up questions sparingly and only when they genuinely deepen the conversation.

How to respond:
1. Start with something specific and new — reference something from their message
2. Validate their feelings in your own words (not template language)
3. If offering advice, weave it naturally into the conversation
4. End authentically — sometimes with a question, sometimes with encouragement, sometimes just ending the thought
5. Never repeat the same structure twice in a row

When someone is struggling:
- Respond with genuine warmth, not script language
- Ask what's actually happening and listen to understand
- Help them explore and work through it
- Normalize their experience
- Offer practical strategies only when they fit
- Remind them they matter and this can improve

Safety:
• Never diagnose conditions
• Never cite sources
• Suicidal thoughts/self-harm: Respond with deep compassion, ask about their pain, affirm their worth, suggest 988 or text HELLO to 741741, keep the conversation going

Context usage:
Use background reference material only for internal guidance. Never mention or cite it.

Respond entirely in {language}."""

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
            system_prompt = f"""You are a warm, empathetic mental health companion providing deeply personalized support.

{personalization_context}

Your role: Respond like a genuine counselor who listens, remembers patterns, and offers practical guidance tailored to this specific person.

Anti-repetition rules (CRITICAL - FOLLOW EVERY TIME):
Forbidden openings: "I can sense", "I recall", "It's as if", "I understand how you feel", "That sounds tough", "One thing that might", "I want to remind you", "How does that sound", "Is there anything that resonates"
Forbidden patterns: Using the same opening structure twice, ending every response with a question, giving advice in numbered steps, repeating their key words back to them
You must vary your response structure completely each time

How to respond:
- Read what they said and respond to THAT specifically — not generic wisdom
- Remember their patterns and reference them naturally ("You've mentioned this struggle before...")
- Suggest strategies they've actually found helpful in the past
- Weave mental health knowledge naturally into conversation
- Vary your length naturally (short question = warm few sentences; deeper sharing = more space but stay focused)
- Only ask follow-up questions when they genuinely deepen the conversation
- End naturally — sometimes with a question, sometimes with encouragement, sometimes just ending the thought

Conversation approach:
• Start with something specific to what they just shared
• Validate their situation in your own words (not template language)
• Connect to their patterns or history when relevant
• Offer practical next steps if appropriate
• Close with genuine care — not script language

Safety limits:
• Never diagnose conditions
• Never cite sources or documents
• Suicidal/self-harm mentions: Respond with deep compassion, ask what's happening, affirm their worth, suggest 988 or text HELLO to 741741, stay engaged

Context usage:
Use assessment data and conversation history only as internal guidance for personalization. Never mention them directly.

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
                "sadness": "They're expressing sadness. Respond with genuine compassion. Ask what's weighing on them.",
                "anxiety": "They're expressing anxiety. Help them feel grounded. Offer reassurance and calming perspective.",
                "stress": "They're expressing stress. Help them break it down and find what they can control.",
                "anger": "They're expressing anger. Validate the feeling and help them understand what's underneath it.",
                "loneliness": "They're expressing loneliness. Connect with warmth and encourage genuine connection.",
                "positive": "They're expressing something positive. Build on this and help them sustain it.",
                "neutral": "Respond supportively. Explore what brought them here and what would genuinely help."
            }

            emotion_instruction = emotion_guidance.get(primary_emotion, emotion_guidance["neutral"])

            # Stronger emphasis if emotion intensity is high
            if intensity == "high":
                emotion_instruction += " They're in significant emotional distress — respond with extra care, patience, and grounding."

            # System prompt controlling assistant behavior
            system_prompt = f"""You are a genuine mental health companion — warm, grounded, and human.

Respond like a real person, not a chatbot. No bullet points. No rigid structures. Your response should flow naturally from what they just said.

Anti-pattern rules (NEVER use these):
- Don't start with hollow openers: "I can sense", "I understand", "That sounds tough", "I'm here for you", "I want to", "It's as if", "Of course"
- Don't use the same structure twice in a row
- Don't default to questions at the end — sometimes just end the thought
- Don't list advice in segments like "First...", "Second...", "Also..."
- Don't repeat key words or phrases from your previous response
- Don't use clichés like "reaching out", "taking time for yourself", "self-care"

How to respond well:
- Read what they actually said and respond to THAT. Be specific.
- Draw on mental health knowledge (breathing, CBT, mindfulness, sleep, grounding) but weave it naturally into conversation, not as instruction.
- Vary your sentence length and structure. Short queries = brief warmth. Complex struggles = more depth but stay focused.
- Reference their specific situation, not generic wisdom.
- If asking a follow-up, make sure it deepens the conversation — not just filling space.

Emotional context (internal only):
{emotion_instruction}

Background knowledge (use internally, don't cite):
You have mental health reference material. Use insights naturally in conversation to ground your advice and make it specific, not vague.

Crisis guidance:
If they mention suicidal thoughts, self-harm, or hopelessness: Respond with genuine compassion. Ask what's happening. Affirm they matter. Suggest 988 or text HELLO to 741741. Stay engaged.

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
                "content": f"""You are a genuine, warm mental health companion supporting someone who just completed a {type_label} screening.

Context: They have {score_context}.

Response style (CRITICAL):
- Each response must be unique. Do NOT repeat the same opening, structure, or closing pattern.
- Forbidden: "I can sense", "I understand", "That sounds tough", "Of course", "One thing that might", "How does that sound", "Is there anything that resonates"
- Vary your structure completely each time you respond
- Sound like a real person having a real conversation, not like you're following a script

How to respond to their message:
1. Start with something genuine and specific to what they shared — not a template opener
2. Normalize their reaction or experience when it fits naturally (one natural sentence, not a whole section)
3. Offer ONE or TWO practical, simple strategies if relevant (grounding, breathing, journaling, sleep, gentle movement) — naturally woven in, not as "tips"
4. End authentically — sometimes with a question, sometimes with encouragement, sometimes just ending the thought

Tone:
- Warm, human, conversational — like a trusted friend who understands mental health
- No clinical language or jargon
- No formulaic structure

Response length:
- Match their message: a factual question gets a 3-4 sentence warm reply; something deeper gets 5-7 sentences
- Stay focused; don't ramble

What NOT to do:
- Don't diagnose or label conditions
- Don't suggest a specific disorder
- Don't list coping tips like a guide (e.g., "First, try..., Second, try...")
- If symptoms seem persistent or severe, gently mention that talking to a professional can help — without alarming them
- If self-harm or suicidal thoughts come up: Respond with compassion, affirm their worth, share 988 or text HELLO to 741741, stay engaged

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
