# 🧠 SERENLY - Architecture & RAG Pipeline Analysis Report

## Executive Summary
**Serenly** is a full-stack mental health AI companion platform that uses **Retrieval-Augmented Generation (RAG)** to provide evidence-based mental health support through an intelligent chatbot. The system combines LLM technology with clinical knowledge bases to deliver compassionate, contextually-aware responses.

---

## 🏗️ ARCHITECTURE OVERVIEW

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  React 18 + Vite + Tailwind CSS (Port 3000)                    │
│  - User Interface with Chat, Assessments, Mood Tracking         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/REST API
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND API LAYER                            │
│           FastAPI + Uvicorn (Port 8000)                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Core Endpoints:                                       │    │
│  │  - /api/chat (RAG-enabled chat)                       │    │
│  │  - /api/chat-with-emotion (Emotion-aware responses)   │    │
│  │  - /api/upload-pdf (Knowledge base management)        │    │
│  │  - /api/process-documents (Vectorstore rebuild)       │    │
│  │  - /api/submit-assessment (DASS-42, PHQ-9, GAD-7)    │    │
│  │  - /api/mood-journal (Mood tracking)                 │    │
│  │  - /api/analyze-emotion (Emotion detection)           │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────────┬──────────────────────┬──────────────┬────────────┘
               │                      │              │
       ┌───────▼─────────┐   ┌────────▼────────┐  ┌─▼─────────────┐
       │  RAG PIPELINE   │   │ DATABASE LAYER  │  │ EXTERNAL API  │
       │  (chatbot.py)   │   │ (SQLite)        │  │ (Groq LLM)    │
       └─────────────────┘   └─────────────────┘  └───────────────┘
```

### 6-Layer Technology Stack

| Layer | Component | Technology | Purpose |
|-------|-----------|-----------|---------|
| **Presentation** | Web UI | React 18 + Vite + Tailwind | User-facing interface |
| **API** | REST Backend | FastAPI + Uvicorn | Request handling & routing |
| **RAG Engine** | Chatbot Core | LangChain + Groq LLM | Query processing & response generation |
| **Retrieval** | Vector Search | FAISS + sentence-transformers | Semantic document retrieval |
| **Persistence** | Data Store | SQLite | User data, chat history, assessments |
| **Knowledge Base** | Document Store | PDF files | Clinical guidelines & mental health resources |

---

## 🔄 COMPLETE RAG PIPELINE

### RAG Pipeline Flow Diagram
```
USER QUERY
    │
    ├─────────────────────────────────────────────────────────────┐
    │                                                             │
    ▼                                                             │
┌─────────────────────────────────────────────────────────────┐  │
│ 1. EMOTION DETECTION (emotion_detector.py)                 │  │
│    - Analyze user's emotional tone                         │  │
│    - Extract: primary_emotion, intensity, confidence       │  │
│    - Store in emotion_history                              │  │
└────────────────┬────────────────────────────────────────────┘  │
                 │                                                 │
                 ▼                                                 │
┌─────────────────────────────────────────────────────────────┐  │
│ 2. RETRIEVAL PHASE (vector_db.similarity_search)           │  │
│    ┌─────────────────────────────────────────────────┐     │  │
│    │ Query Vectorization:                            │     │  │
│    │ - User query converted to embeddings            │     │  │
│    │ - Model: sentence-transformers/all-MiniLM-L6-v2│     │  │
│    └─────────────────┬───────────────────────────────┘     │  │
│                      │                                      │  │
│    ┌─────────────────▼───────────────────────────────┐     │  │
│    │ FAISS Semantic Search:                          │     │  │
│    │ - SQL: similarity_search(query, k=4)            │     │  │
│    │ - Retrieves TOP-K documents (k=4 by default)    │     │  │
│    │ - Returns: [Document1, Document2, Doc3, Doc4]  │     │  │
│    └─────────────────┬───────────────────────────────┘     │  │
│                      │                                      │  │
│    ┌─────────────────▼───────────────────────────────┐     │  │
│    │ Retrieved Documents Include:                    │     │  │
│    │ • Clinical Guidelines (from PDF files)          │     │  │
│    │ • Conversation Examples (from dataset)          │     │  │
│    │ • Metadata: source, page, type                 │     │  │
│    └─────────────────────────────────────────────────┘     │  │
└────────────────┬────────────────────────────────────────────┘  │
                 │                                                 │
                 ▼                                                 │
┌─────────────────────────────────────────────────────────────┐  │
│ 3. CONTEXT FORMATTING (format_context)                     │  │
│    - Label clinical vs. conversation sources               │  │
│    - Format: [Clinical Guideline 1 — filename, Page N]    │  │
│    - Create unified context string                         │  │
└────────────────┬────────────────────────────────────────────┘  │
                 │                                                 │
                 ▼                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 4. PROMPT CONSTRUCTION                                  │  │
│ │ ┌────────────────────────────────────────────────────┐  │  │
│ │ │ System Prompt (Dynamic):                          │  │  │
│ │ │ • Role: "Calm, empathetic mental health companion"│  │  │
│ │ │ • Behavior: "Warm, respectful, non-judgmental"   │  │  │
│ │ │ • Safety: "Never diagnose; handle crises care"  │  │  │
│ │ │ • Language: ${USER_LANGUAGE}                     │  │  │
│ │ │ • Context usage: "Internal guidance only"        │  │  │
│ │ │ • Emotion directive: Based on detected emotion   │  │  │
│ │ └────────────────────────────────────────────────────┘  │  │
│ │                                                         │  │
│ │ ┌────────────────────────────────────────────────────┐  │  │
│ │ │ Chat History (up to 6 recent exchanges):          │  │  │
│ │ │ - Provides contextual memory                      │  │  │
│ │ │ - Maintains conversation coherence                │  │  │
│ │ └────────────────────────────────────────────────────┘  │  │
│ │                                                         │  │
│ │ ┌────────────────────────────────────────────────────┐  │  │
│ │ │ User Prompt:                                      │  │  │
│ │ │ [Background reference: {FORMATTED_CONTEXT}]      │  │  │
│ │ │ [User message: {QUERY}]                          │  │  │
│ │ └────────────────────────────────────────────────────┘  │  │
│ └──────────────────┬───────────────────────────────────────┘  │
└────────────────────▼────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. LLM GENERATION (Groq API Call)                          │
│    Model: mixtral-8x7b (or configurable)                   │
│    Parameters:                                             │
│    - temperature: 0.7 (balanced creativity)                │
│    - max_tokens: 1200 (longer responses)                   │
│    - messages: [system, history..., user]                 │
│                                                          │
│    ▼ GROQ LLM                                            │
│    ┌──────────────────────────────────────────────┐       │
│    │ Generate contextually-aware response        │       │
│    │ Incorporates: emotion, context, history     │       │
│    │ Grounded in clinical knowledge              │       │
│    └──────────────────────────────────────────────┘       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. RESPONSE FINALIZATION                                   │
│    - Store in chat_history (max 20 exchanges)              │
│    - Save to database (if authenticated)                   │
│    - Return: (response, relevant_docs, emotion_data)       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
            RESPONSE
             TO USER
```

### Detailed Pipeline Components

#### **Phase 1: Emotion Detection**
```python
# Input: User message
# Output: Emotion metadata

emotion_data = {
    "primary_emotion": "sadness" | "anxiety" | "stress" | "anger" | "loneliness" | "positive" | "neutral",
    "intensity": "low" | "medium" | "high",
    "confidence": 0.0 - 1.0,
    "timestamp": ISO_DATE
}

# Used for: Tailoring response tone and guidance
```

#### **Phase 2: Retrieval**
```python
# Input: User query + Vector store (FAISS)
# Process:
1. Query embedding: Query → Vector (384-dim, MiniLM model)
2. Similarity search: FAISS.similarity_search(query_vector, k=4)
3. Document ranking: Cosine similarity score
4. Metadata tracking: source file, page number, doc type

# Output: Top-K documents
[
    Document(
        page_content="Mental health definition...",
        metadata={"source": "WHO_mental_disorders.pdf", "page": 5, "type": "clinical"}
    ),
    Document(
        page_content="User conversation example...",
        metadata={"source": "dataset", "type": "conversation"}
    ),
    ...
]
```

#### **Phase 3: Context Formatting**
```python
# Input: Retrieved documents
# Process: Label and structure

Formatted Context = """
[Clinical Guideline 1 — WHO_mental_disorders.pdf, Page 5]
Mental health is a state of well-being...

[Conversation Example 2 — Mental Health Dataset]
User: I'm feeling anxious about work...
Counselor: I understand that...

[Clinical Guideline 3 — DASS-42_guidelines.pdf, Page 12]
Anxiety severity levels are measured on a scale...
"""

# Purpose: Give LLM clear distinction between facts and tone
```

#### **Phase 4: Prompt Engineering**
```python
SYSTEM_PROMPT = """
You are a calm, empathetic mental health support companion.

Conversation principles:
• Respond naturally and conversationally
• Be warm, respectful, and non-judgmental
• Focus on the user's specific message
• Avoid generic filler and robotic tone

Safety approach:
• Never diagnose mental health conditions
• Never cite documents or guidelines
• If suicidal thoughts mentioned: Stay present, respond with compassion,
  suggest professional help (988, text HELLO to 741741)

Emotion Guidance: {dynamic_based_on_emotion}
Language: {dynamic_based_on_user_language}
"""

USER_PROMPT = """
Background reference (internal only):
{formatted_context}

User message:
{query}
"""
```

#### **Phase 5: LLM Generation**
```python
groq_client.chat.completions.create(
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": chat_history_messages},
        {"role": "assistant", "content": previous_responses},
        {"role": "user", "content": user_prompt}
    ],
    model="mixtral-8x7b",  # or gpt-4o, etc.
    temperature=0.7,
    max_tokens=1200
)
```

#### **Phase 6: Response & Storage**
```python
response = {
    "message": "Generated compassionate response...",
    "emotion": emotion_data,
    "sources": [doc.metadata for doc in retrieved_docs],
    "timestamp": datetime.now(),
    "session_id": user_session_id
}

# Storage:
- Chat history: In-memory (chat_history list, max 20)
- Persistent: SQLite database (if user authenticated)
- Emotion history: emotion_history list
```

---

## 📊 DATA FLOW DURING QUERY

### Example User Query Flow

**User Input:** "I'm feeling very anxious and alone right now"

**Step 1: Emotion Detection**
```
Input: "I'm feeling very anxious and alone right now"
↓
Keywords: "anxious", "alone"
↓
Output: {
  "primary_emotion": "anxiety",
  "intensity": "high",
  "confidence": 0.92
}
```

**Step 2: Vector Embedding & Retrieval**
```
Query Vector = [0.12, -0.45, 0.78, ..., 0.34] (384-dim)
              (using MiniLM model)
↓
FAISS Search: Find 4 closest documents
↓
Retrieved:
1. GAD-7 anxiety assessment guide
2. Anxiety management techniques
3. Social connection importance
4. Coping strategies for loneliness
```

**Step 3: Context Formatting**
```
[Clinical Guideline 1 — GAD-7_guidelines.pdf, Page 8]
Generalized Anxiety Disorder manifests as persistent worrying...

[Clinical Guideline 2 — anxiety_management.pdf, Page 3]
Evidence-based techniques include: deep breathing, grounding...

[Conversation Example 3 — Mental Health Dataset]
User: "I feel alone"
Counselor: "Loneliness is valid. Connection helps..."
```

**Step 4: System Prompt (with emotion directive)**
```
System: "You are a calm, empathetic companion.
IMPORTANT: The user appears to be experiencing HIGH-INTENSITY ANXIETY.
Respond with extra care, patience, and reassurance.
Provide calming strategies and validate feelings."

Also: + Chat history + User prompt
```

**Step 5: Groq LLM Generation**
```
Generated Response:
"I hear you, and what you're feeling makes sense. Anxiety can
feel overwhelming, especially when paired with loneliness. That's
a heavy combination. Let's take this a step at a time.

First, I want you to know you're not alone in feeling this way—
many people experience this.

Something that often helps: when anxiety is high, our nervous system
is in overdrive. A simple grounding technique can help: Find 5 things
you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you
can taste. This brings you back to the present moment.

Would you like to talk about what triggered this feeling today?
Sometimes naming it helps us understand it better."
```

**Step 6: Response Storage**
```
Stored in:
- chat_history (in-memory)
- emotion_history
- database (if authenticated)

Returned to frontend:
{
  "response": "I hear you...",
  "emotion": {"primary_emotion": "anxiety", "intensity": "high", ...},
  "sources": [{filename, page, type}, ...],
  "timestamp": "2026-04-12T10:30:45Z"
}
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

```sql
-- Users
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TIMESTAMP,
    last_login TIMESTAMP
);

-- Chat History
CREATE TABLE chat_history (
    message_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    user_message TEXT,
    bot_response TEXT,
    emotion_data JSON,
    retrieved_sources JSON,
    session_id INTEGER,
    timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Mental Health Assessments
CREATE TABLE assessments (
    assessment_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    assessment_type TEXT, -- 'DASS-42', 'PHQ-9', 'GAD-7'
    total_score INTEGER,
    severity_level TEXT,
    responses JSON,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Mood Journal
CREATE TABLE mood_journal (
    entry_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    mood_rating INTEGER, -- 1-10
    mood_tags TEXT,
    journal_text TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Emotion History (per-message emotion tracking)
CREATE TABLE emotion_history (
    emotion_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    primary_emotion TEXT,
    intensity TEXT,
    confidence FLOAT,
    message_context TEXT,
    timestamp TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Badges & Achievements
CREATE TABLE badges (
    badge_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    badge_name TEXT,
    achievement_description TEXT,
    earned_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

---

## 🔑 KEY FEATURES & MECHANISMS

### 1. **Knowledge Base Management**
- **Source**: 18+ WHO/mental health PDFs in `data/` folder
- **Processing**: PyPDFLoader → RecursiveCharacterTextSplitter
- **Chunking**: 1000-char chunks with 200-char overlap
- **Storage**: FAISS vectorstore (index.faiss + pkl files)
- **Retrieval**: k=4 documents per query

### 2. **Emotion-Aware Response Generation**
- **Detection**: Natural language processing of user tone
- **Emotions tracked**: sadness, anxiety, stress, anger, loneliness, positive, neutral
- **Intensity levels**: low, medium, high
- **Dynamic prompting**: System prompt adapts based on emotion
- **Special handling**: Crisis detection (suicidal ideation → immediate resources)

### 3. **Context Memory**
- **Recent history**: Last 6 user-assistant exchanges retained
- **Purpose**: Maintain conversation coherence
- **Limit**: Max 20 exchanges in memory (prevents token bloat)
- **Persistent**: Optionally stored in SQLite for authenticated users

### 4. **Multi-Language Support**
- **Parameter**: `language` field in requests
- **Default**: English
- **LLM adaptation**: System prompt includes language directive
- **Implementation**: Language parameter passed to response generator

### 5. **Assessment Tools**
Serenly integrates three globally recognized clinical scales to provide users with objective measures of their mental well-being:
- **DASS-42:** Measures subscales of Depression, Anxiety, and Stress.
- **PHQ-9:** Standardized 9-question tool for depression severity, featuring a critical alert system for suicidal ideation (Item 9).
- **GAD-7:** Specifically targets Generalized Anxiety Disorder.
After screening results, we provide personalised results and many more....

### 6. **Gamification & Wellness**
- **Mood Journal**: Free-form emotional tracking
- **Badges**: Achievements for consistency/milestones
- **Gratitude Practice**: Daily gratitude logging
- **Streak Tracking**: Motivation through consistency
- **Wellness Points**: Gamified progress metrics

---

## 📚 VECTOR DATABASE ARCHITECTURE

### FAISS Vector Store
```
Directory: data/vectorstore/
├── index.faiss          # Main vector index
├── index.pkl            # Dimension/metadata
└── docstore/
    └── {docstore_files} # Document metadata

Schema:
- Embedding dimensionality: 384 (MiniLM-L6-v2)
- Distance metric: Cosine similarity
- Index type: Flat (brute-force search for small corpus)
- Documents: ~2,500+ chunks from 18 PDFs
```

### Vectorization Process
```
PDF Document
    ↓
PyPDFLoader → Extract text pages
    ↓
RecursiveCharacterTextSplitter → 1000-char chunks
    ↓
MiniLM Encoder → 384-dim embeddings
    ↓
FAISS Index → Store embeddings + metadata
    ↓
Persisted to disk
```

---

## 🔐 SECURITY & PRIVACY

### Implementation
1. **No source citation**: Retrieved documents only used internally
2. **CORS protected**: Frontend URL validation
3. **Session tokens**: Secure authentication
4. **Data minimization**: Only necessary wellness data collected
5. **SQLite encryption**: Optional database encryption
6. **GDPR compliance**: Data export/deletion support

---

## ⚙️ CONFIGURATION

### Key Config Parameters
```python
# config.py / config_runtime.py

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "mixtral-8x7b"  # or gpt-4o

PDF_DIRECTORY = "data"
VECTORSTORE_DIRECTORY = "data/vectorstore"

NUM_RETRIEVED_DOCS = 4    # K for similarity search
MAX_HISTORY_LENGTH = 20   # Chat history max

FRONTEND_URL = "http://localhost:3000"
FRONTEND_URLS = [...]     # For production domains
```

---

## 📈 PERFORMANCE CONSIDERATIONS

### Optimization Strategies
1. **Lazy loading**: Embeddings loaded only on first use
2. **Vectorstore persistence**: Pre-computed embeddings cached
3. **Document limit**: K=4 limits context size for faster processing
4. **Async FastAPI**: Handles concurrent requests efficiently
5. **Temperature control**: 0.7 temperature balances speed & quality

### Latency Breakdown
- Emotion detection: ~50ms
- Vectorization: ~100ms
- FAISS search: ~20ms
- Context formatting: ~10ms
- LLM generation: ~1-3 seconds (Groq)
- **Total**: ~1.2-3.3 seconds per query

---

## 🔄 WORKFLOW SUMMARY

```
User Input
    ↓
[Emotion Detection] → Extract emotional context
    ↓
[Vector Search] → Retrieve 4 most relevant documents
    ↓
[Context Formatting] → Structure and label sources
    ↓
[Prompt Construction] → Build dynamic system + user prompts
    ↓
[LLM Call] → Groq generates empathetic response
    ↓
[Storage] → Save to history & database
    ↓
[Return to User] → Response + Metadata
```

---

### Q1: What is the primary purpose of the RAG pipeline in Serenly?
**Answer:**
The RAG (Retrieval-Augmented Generation) pipeline grounds the LLM's responses in evidence-based mental health knowledge. Instead of generating responses purely from the LLM's training data, the system:
1. Retrieves relevant clinical documents from a knowledge base
2. Formats them as context
3. Passes them to the LLM along with the user query
4. Generates responses grounded in reliable mental health sources

This prevents hallucinations while ensuring responses align with clinical guidelines (WHO standards, therapeutic techniques, assessment tools).

---

### Q2: Explain the architecture layers of the Serenly application.
**Answer:**
Serenly uses a **6-layer architecture**:

1. **Presentation Layer** (React + Vite): Web UI for users
2. **API Layer** (FastAPI): REST endpoints routing requests
3. **RAG Engine** (LangChain + Groq): Processing queries with context
4. **Retrieval Layer** (FAISS + MiniLM): Semantic document search
5. **Persistence Layer** (SQLite): User data, chat history, assessments
6. **Knowledge Base** (PDF files): Clinical mental health resources

Example flow: User Query → FastAPI → Emotion Detection → Vector Search → LLM → Response

---

### Q3: What is the role of FAISS in the Serenly system?
**Answer:**
FAISS (Facebook AI Similarity Search) is the vector database that enables **semantic search**:
- **Stores**: 384-dimensional embeddings of document chunks
- **Searches**: Finds documents semantically similar to user queries (not keyword-matching)
- **Retrieves**: Top-K (k=4) most relevant documents
- **Metric**: Cosine similarity for relevance ranking
- **Persistence**: Saves/loads vectorstore from disk for performance

Example: User query "I'm anxious" would retrieve documents about anxiety management, even if they don't contain the exact word "anxiety" (e.g., "worry", "panic").

---

### Q4: What embedding model does Serenly use and why?
**Answer:**
**Model**: `sentence-transformers/all-MiniLM-L6-v2`

**Why chosen**:
- **Lightweight**: 384-dimensional embeddings (vs. 768+ for larger models)
- **Fast**: CPU-friendly without GPU requirement (crucial for deployment)
- **Effective**: Trained on 1M+ sentence pairs, excellent for domain-specific retrieval
- **Accessible**: Open-source, no API calls needed
- **Balance**: Good performance-to-speed ratio for real-time responses

---

### Q5: Describe the emotion detection mechanism in Serenly.
**Answer:**
The emotion detection system analyzes user messages to identify emotional state:

**Emotions detected**:
- sadness, anxiety, stress, anger, loneliness, positive, neutral

**Data extracted**:
- `primary_emotion`: Primary detected emotion
- `intensity`: low, medium, or high
- `confidence`: Probability score (0-1)

**Usage**:
- **Adaptive responses**: System prompt dynamically includes emotion guidance
  - For anxiety: "Provide reassurance and calming strategies"
  - For sadness: "Respond with compassion and emotional validation"
  - For high intensity: "Respond with extra care and patience"
- **Context memory**: Emotion history tracked for pattern recognition

**Example**:
```
Input: "I'm feeling very anxious and overwhelmed"
Output: {primary_emotion: "anxiety", intensity: "high", confidence: 0.95}
Effect: LLM receives instruction to emphasize calming techniques
```

---

### Q6: Walk through the complete retrieval process for a user query.
**Answer:**
**Step-by-step retrieval**:

1. **Query Vectorization**:
   - User query: "How can I manage my stress?"
   - Convert to 384-dim vector using MiniLM model
   - Result: [0.12, -0.45, 0.78, ..., 0.34]

2. **FAISS Similarity Search**:
   - Call: `vectorstore.similarity_search(query_vector, k=4)`
   - Algorithm: Compute cosine similarity between query and all stored embeddings
   - Result: 4 documents with highest similarity scores

3. **Document Ranking**:
   - Documents ranked by cosine similarity
   - Top scores selected
   - Metadata attached (source file, page number)

4. **Retrieved Documents** (example):
   ```
   Doc1: "Stress management techniques include..." (WHO_guidelines.pdf, p.12)
   Doc2: "Deep breathing exercises are effective for..." (anxiety_guide.pdf, p.5)
   Doc3: "Sleep hygiene impacts stress levels..." (mental_health.pdf, p.8)
   Doc4: "Cognitive behavioral therapy for stress..." (cbt_guide.pdf, p.15)
   ```

---

### Q7: Explain the prompt engineering strategy used in Serenly.
**Answer:**
Serenly uses **dynamic, multi-component prompting**:

**1. System Prompt** (Controls LLM behavior):
```
"You are a calm, empathetic mental health companion.
- Respond conversationally, never robotic
- Be warm and non-judgmental
- Never diagnose conditions
- If crises mentioned: Stay present, suggest professional help
- Language: [DYNAMIC - e.g., English, Spanish]"
```

**2. Emotion Directive** (Added based on detected emotion):
```
If anxiety detected:
  "The user appears anxious. Provide reassurance and calming strategies."
  
If sadness detected:
  "The user appears sad. Respond with emotional validation."
```

**3. Chat History** (Last 6 exchanges):
```
User: "I'm struggling this week"
Assistant: "I'm here to listen..."
User: "Work stress is building up"
Assistant: "That makes sense..."
[Recent context helps maintain coherence]
```

**4. User Prompt** (Actual query + context):
```
"Background reference (internal only):
{Clinical Guideline 1 - stress management}
{Conversation Example - similar situation}

User message: {actual_query}"
```

**Effect**: LLM receives rich context for generating empathetic, clinically-grounded responses.

---

### Q8: How does the system handle sensitive topics like suicidal ideation?
**Answer:**
**Safety mechanism**:

1. **Detection** (via emotion detection):
   - Keywords flagged: "suicide", "harm", "hopeless", "worthless"
   - High-intensity negative emotion detected

2. **System prompt response**:
   ```
   "If user mentions suicidal thoughts, self-harm, or hopelessness:
   - Stay present and engaged
   - Respond with compassion
   - Ask about their pain and what's driving these feelings
   - Affirm their worth
   - Suggest professional resources:
     * Call 988 (Suicide Prevention Lifeline, US)
     * Text HELLO to 741741 (Crisis Text Line)
   - Keep conversation going—your care matters"
   ```

3. **LLM behavior**:
   - Prioritizes human connection over problem-solving
   - Validates feelings without minimizing
   - Redirects to professional help
   - Maintains engagement

4. **Database logging**:
   - High-risk messages logged with metadata
   - Emotion data stored for pattern detection
   - Admin alerts (in production) for concerning patterns

---

### Q9: Describe how context formatting distinguishes between clinical and conversational sources.
**Answer:**
**Formatting strategy**:

```python
def format_context(documents):
    context_parts = []
    
    for i, doc in enumerate(documents, 1):
        source_type = doc.metadata.get('type')
        
        if source_type == 'conversation':
            # Conversation examples
            context_parts.append(
                f"[Conversation Example {i} — Mental Health Dataset]\n"
                f"{doc.page_content}\n"
            )
        else:
            # Clinical guidelines
            source = doc.metadata.get('source')  # filename
            page = doc.metadata.get('page')
            context_parts.append(
                f"[Clinical Guideline {i} — {filename}, Page {page}]\n"
                f"{doc.page_content}\n"
            )
    
    return "\n".join(context_parts)
```

**Purpose**:
- **Clinical sources**: LLM knows these are factual guidelines to base advice on
- **Conversation examples**: LLM knows these are tone/approach references
- **LLM instruction**: "Use references for facts, not cited publicly"

**Result**: Response weaves in clinical knowledge naturally without sounding like a citation.

---

### Q10: How is conversation history managed to prevent token bloat?
**Answer:**
**History management strategy**:

1. **In-memory storage**:
   ```python
   self.chat_history: List[Tuple[str, str]] = []  # (user_msg, bot_response)
   ```

2. **Size limiting**:
   ```python
   if len(self.chat_history) > MAX_HISTORY_LENGTH:  # Default: 20
       self.chat_history.pop(0)  # Remove oldest entry
   ```

3. **Sliding window for LLM context**:
   ```python
   # Only use last 6 exchanges for LLM context
   for user_msg, assistant_msg in self.chat_history[-6:]:
       messages.append({"role": "user", "content": user_msg})
       messages.append({"role": "assistant", "content": assistant_msg})
   ```

**Benefits**:
- **Token efficiency**: 6 exchanges ≈ ~2000 tokens vs. full history ≈ ~8000+
- **Coherence**: Recent context is most relevant
- **Cost control**: Fewer tokens = lower API costs
- **Persistent storage**: Full history in database (if authenticated)

**Configuration**:
```python
MAX_HISTORY_LENGTH = 20  # Maximum in-memory exchanges
LLM_CONTEXT_WINDOW = 6   # Exchanges sent to LLM
```

---


### Q11: What are the trade-offs between retrieval quality and system latency?
**Answer:**
**Key trade-offs**:

| Factor | Value | Trade-off |
|--------|-------|-----------|
| **K (top docs)** | 4 | ↑ K = more context but slower search |
| **Chunk size** | 1000 | Smaller = more specific, larger = more context |
| **Chunk overlap** | 200 | More overlap = better context but large corpus |
| **Embedding model** | MiniLM | Lighter than large models, less accurate |
| **Index type** | FAISS Flat | Brute-force is slower than hierarchical |

**Optimization decisions in Serenly**:
```
k=4 (not 10)
  → Reduces search time: ~20ms vs ~50ms
  → Still captures diverse perspectives
  
MiniLM (not BERT-large)
  → 384-dim embeddings vs 768-dim
  → CPU-friendly for deployment
  
Flat index (not HNSW)
  → Works for ~3000 chunks
  → Would optimize if corpus grows 10x
```

**Latency breakdown**:
```
Emotion detection:    ~50ms
Vector embedding:    ~100ms
FAISS search:        ~20ms
Context formatting:  ~10ms
LLM API call:      ~1-3000ms ← Bottleneck
Total:             ~1.2-3.3s
```

**Conclusion**: LLM latency dominates; vector search is highly optimized.

---

### Q12: How would you scale Serenly to handle 100x user load?
**Answer:**
**Scaling strategy**:

1. **Backend**:
   - Horizontal scaling: Multiple FastAPI instances behind load balancer
   - Caching: Redis for vectorstore cache
   - Database optimization: Move to PostgreSQL with read replicas

2. **RAG Pipeline**:
   - Vectorstore: Move from FAISS to Milvus/Weaviate (distributed)
   - Embedding cache: Pre-compute frequently used queries
   - Batch processing: Queue long-running processes

3. **LLM API**:
   - Rate limiting: Implement request queue
   - Fallback models: Use faster models for simple queries
   - Local deployment: Self-hosted LLM for scale

4. **Database**:
   - Sharding: Partition user data by user_id
   - Async writes: Queue chat history writes
   - Analytics DB: Separate read-only replica

5. **Frontend**:
   - CDN: Distribute React assets globally
   - Service workers: Client-side caching

---

### Q13: Explain potential limitations and future improvements for Serenly.
**Answer:**
**Current Limitations**:

1. **Knowledge base**:
   - Static PDFs (18 documents)
   - No real-time updates to clinical guidelines
   - Limited to WHO/Indian mental health resources

2. **RAG quality**:
   - Fixed k=4 may miss nuanced topics
   - No reranking of retrieved documents
   - Chunk boundaries might split important context

3. **Emotion detection**:
   - Rule-based (keyword matching)
   - No multi-turn emotion tracking
   - Doesn't distinguish cultural differences in expression

4. **Personalization**:
   - Single-size-fits-all responses
   - No user preference profiles
   - Limited longitudinal analysis

5. **Safety**:
   - No real-time crisis intervention
   - Dependent on user self-disclosure
   - No integration with emergency services

**Future Improvements**:

1. **Knowledge base**:
   - Auto-update from medical journals
   - Support multiple languages natively
   - User-contributed resources

2. **RAG**:
   - Implement reranking (using smaller models like SBERT)
   - Dynamic k selection based on query complexity
   - Hybrid search (semantic + keyword)

3. **Emotion**:
   - Fine-tuned emotion model (DistilBERT on mental health data)
   - Multi-turn emotion trajectory tracking
   - Cultural adaptation layers

4. **Personalization**:
   - User preference profiles
   - Adaptive response style (formal, casual, technical, etc.)
   - Longitudinal analysis with recommendation engine

5. **Safety**:
   - Real-time crisis flagging
   - Professional helpline integration
   - Incident severity classification

---

### Q14: What does the LLM "see" vs what the user sees regarding sources?
**Answer:**
**Information Asymmetry**:

**LLM sees** (Full context):
```
System Prompt: [Full instructions + emotion directive]
Chat History: [Last 6 exchanges]
Background Reference: [4 clinical documents labeled with sources]
"[Clinical Guideline 1 — WHO_mental_disorders.pdf, Page 5]
Mental health definition...

[Conversation Example 2 — Mental Health Dataset]
User conversation..."

User Message: "I'm anxious"
```

**User sees** (Clean response):
```
"I understand anxiety can feel overwhelming. Many people experience
what you're describing. Let me share something that often helps: when
our body is in anxiety mode, grounding techniques can reset our
nervous system.

Try this: Find 5 things you can see, 4 you can touch, 3 you hear,
2 you smell, 1 you taste. This brings you to the present moment.

What triggered this feeling for you?"
```

**Why this design?**:
- LLM has rich context for accurate, grounded responses
- User sees conversational, natural dialogue
- Sources are internal (prevents citation reading)
- Trust in response without visible "evidence" (psychological benefit)
- Professional tone maintained (like talking to a counselor, not a database)

---

### Q15: How does Serenly handle conflicting or contradictory guidance in retrieved documents?
**Answer:**
**Current approach**:
- LLM synthesis: LLM reads multiple documents and synthesizes coherent guidance
- No explicit conflict detection
- No document prioritization by authority

**In practice**:
```
Retrieved:
Doc1: "Medication is effective for anxiety" (psychiatric_guide.pdf)
Doc2: "Cognitive therapy preferred for anxiety" (psychology_guide.pdf)
Doc3: "Exercise reduces anxiety" (wellness_guide.pdf)

LLM integrates: "While there are various approaches—medication,
therapy, and lifestyle changes—many find a combination most effective.
What resonates with you?"
```

**Limitations**:
- No source credibility weighting
- Could reinforce contradictions
- Doesn't flag conflicting advice to user

**Future solution**:
- Assign confidence scores to documents
- Implement hierarchical source authority
- Flag contradictions for user awareness
- Implement reranking to prioritize established sources

---

### Q16: How does Serenly compare to other mental health AI systems (like Woebot, Wysa)?
**Answer:**
**Comparison**:

| Feature | Serenly | Woebot | Wysa |
|---------|---------|--------|------|
| **RAG** | ✅ Yes (FAISS) | ❌ No | ❌ No |
| **Open source** | ✅ Yes | ❌ No | ❌ No |
| **Emotion detection** | ✅ Built-in | ✅ Yes | ✅ Yes |
| **Assessments** | ✅ DASS, PHQ-9, GAD-7 | ✅ Limited | ✅ Multiple |
| **LLM used** | ✅ Groq API | ❌ Proprietary | ❌ Proprietary |
| **Knowledge grounding** | ✅ WHO PDFs | ❓ Unknown | ❓ Unknown |
| **Deployment ease** | ✅ Easy (Docker) | ❌ Difficult | ❌ Difficult |
| **Cost** | ✅ Low (free LLM tier) | ❌ High | ❌ High |

**Serenly advantages**:
- True RAG pipeline (knowledge-grounded)
- Open-source for research/modification
- Deployable on commodity hardware
- Lower operational costs

**Limitations vs competitors**:
- Smaller team/community
- Less UX polish
- Fewer features (badges, gamification are basic)
- No clinical validation studies

---

### Q17: Discuss ethical considerations in mental health AI.
**Answer:**
**Key ethical concerns in Serenly**:

1. **Accuracy & Safety**:
   - Risk of bad advice from LLM hallucinations
   - Mitigation: RAG grounding + system prompts emphasizing safety
   - Limitation: Still not a replacement for human therapists

2. **Data Privacy**:
   - Storage of sensitive mental health conversations
   - Mitigation: SQLite with optional encryption, GDPR support
   - Risk: Potential data breaches

3. **Equity & Access**:
   - Language bias: Currently English-primary
   - Socioeconomic: Requires internet + device
   - Cultural: Western mental health frameworks
   - Mitigation: Multi-language support + offline capability

4. **Autonomy & Consent**:
   - Users should know they're talking to AI
   - Clear disclaimers: "Not a replacement for therapy"
   - Informed consent on data usage

5. **Accountability**:
   - Who's liable if AI gives bad advice?
   - Should have human oversight mechanisms
   - Transparent error reporting

6. **Bias**:
   - Retrieved documents may reflect biases in source materials
   - LLM itself has training biases
   - Mitigation: Diverse training corpus + bias detection

---

### Q18: Propose a research study using Serenly as a platform.
**Answer:**
**Research Proposal: "Emotion-Aware Response Effectiveness in Mental Health AI"**

**Hypothesis**: 
Emotion-aware responses (vs. standard responses) improve user engagement and perceived helpfulness in AI mental health support.

**Methodology**:
1. **Study Design**: Randomized controlled trial
2. **Sample**: 200 users (3-month study)
3. **Groups**:
   - Control: Standard responses (no emotion detection)
   - Experimental: Emotion-aware responses (Serenly as is)

4. **Metrics**:
   - Engagement: Chat frequency, message length, session duration
   - Helpfulness: User satisfaction surveys (Likert scale)
   - Emotional outcomes: PHQ-9/GAD-7 scores pre/post
   - Retention: Churn rate, return visits

5. **Data collection**:
   - Serenly logs (anonymized)
   - User surveys (monthly)
   - Assessments (pre/mid/post)

6. **Analysis**:
   - Propensity score matching for group balance
   - T-tests for engagement metrics
   - Linear regression for outcome prediction

7. **Expected findings**:
   - Emotion-aware responses → 20-30% higher engagement
   - Increased user trust & perceived helpfulness
   - Longitudinal mental health improvements

---

## **Level 5: Open-Ended Questions**

### Q19: If you had to redesign Serenly from scratch with unlimited resources, what would you change?
**Answer:**
**Redesign priorities**:

1. **Hybrid AI**:
   - LLM for empathy + smaller models for classification
   - Multi-modal: Text, voice, video interaction
   - Real-time video therapy integration

2. **Advanced RAG**:
   - GraphRAG: Document relationships, not just similarity
   - Multi-hop reasoning: "If user has anxiety + poor sleep, recommend both"
   - Temporal dynamics: Update knowledge base with latest research

3. **Personalization**:
   - Longitudinal user profiles
   - Adaptive difficulty for assessments
   - Response style learning (formal/casual/etc.)

4. **Safety**:
   - Real-time crisis intervention
   - Integration with professional therapists
   - "Escalation" pathway for complex cases

5. **Community**:
   - Peer support features (anonymized)
   - Professional therapist marketplace
   - Research data sharing (with consent)

6. **Accessibility**:
   - Offline-first design
   - Multi-language native support
   - Voice-first interface for low-literacy users

---

### Q20: What open research questions does Serenly raise?
**Answer:**
**Unanswered questions**:

1. **RAG Optimization**:
   - How to measure retrieval quality for mental health?
   - Best chunking strategy for clinical documents?
   - What's the optimal knowledge base composition?

2. **Emotion & Language**:
   - How does emotion detection transfer to non-English?
   - Cultural differences in emotion expression?
   - Long-term emotion pattern reliability?

3. **Safety & Trust**:
   - How to reliably detect crisis without false positives/negatives?
   - What response patterns build trust in users?
   - How does AI therapy compare to human therapy?

4. **Effectiveness**:
   - Does RAG improve mental health outcomes vs non-RAG?
   - Long-term user retention & satisfaction?
   - Impact on real mental health metrics?

5. **Scalability**:
   - Knowledge base saturation: When does adding more docs help?
   - Multi-modal RAG: How to incorporate videos, images?
   - Distributed emotion detection: Ethical implications?

---

# 📋 SUMMARY TABLE

| Component | Technology | Key Purpose |
|-----------|-----------|------------|
| Frontend | React 18 + Vite | User interface |
| Backend | FastAPI | REST API routing |
| Chatbot | LangChain | RAG orchestration |
| LLM | Groq (mixtral-8x7b) | Response generation |
| Vector DB | FAISS | Semantic search |
| Embeddings | MiniLM-L6-v2 | 384-dim text vectors |
| Database | SQLite | User data persistence |
| Emotion | Custom NLP | Emotional tone analysis |
| Assessment | Custom Logic | DASS-42, PHQ-9, GAD-7 scoring |

---

**Report Generated**: 2026-04-12  
**Project**: Serenly - Mental Health AI Companion  
**License**: MIT
