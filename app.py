import streamlit as st
import os
from document_processor import DocumentProcessor
from chatbot import MentalHealthChatbot
import config_runtime as config

# Page configuration
st.set_page_config(
    page_title=config.APP_TITLE,
    page_icon=config.APP_ICON,
    layout="wide"
)

# Initialize session state
if 'chatbot' not in st.session_state:
    st.session_state.chatbot = MentalHealthChatbot()
    loaded = st.session_state.chatbot.load_knowledge_base()
    
    # Auto-process PDFs if vectorstore doesn't exist but PDFs are present
    if not loaded:
        pdf_files = []
        if os.path.exists(config.PDF_DIRECTORY):
            pdf_files = [f for f in os.listdir(config.PDF_DIRECTORY) if f.endswith('.pdf')]
        
        if pdf_files:
            with st.spinner("🔄 First-time setup: Processing documents..."):
                processor = DocumentProcessor(
                    chunk_size=config.CHUNK_SIZE,
                    chunk_overlap=config.CHUNK_OVERLAP
                )
                chunks = processor.process_directory(config.PDF_DIRECTORY)
                if chunks:
                    st.session_state.chatbot.add_documents_to_knowledge_base(chunks)
                    st.success(f"✅ Auto-processed {len(pdf_files)} PDF(s)!")

if 'messages' not in st.session_state:
    st.session_state.messages = []

if 'knowledge_base_loaded' not in st.session_state:
    st.session_state.knowledge_base_loaded = False

if 'groq_api_key_set' not in st.session_state:
    st.session_state.groq_api_key_set = bool(config.GROQ_API_KEY or os.getenv("GROQ_API_KEY"))

# Main title
st.title(f"{config.APP_ICON} {config.APP_TITLE}")

# Sidebar for document management
with st.sidebar:
    st.header("🔑 API Configuration")
    
    # Groq API Key input
    groq_api_key = st.text_input(
        "Groq API Key",
        type="password",
        value=config.GROQ_API_KEY,
        help="Get your free API key from https://console.groq.com"
    )
    
    if groq_api_key:
        st.session_state.chatbot.set_groq_api_key(groq_api_key)
        st.session_state.groq_api_key_set = True
        st.success("✅ API key configured!")
    else:
        st.warning("⚠️ Please add your Groq API key to enable AI responses")
        st.markdown("[Get free API key →](https://console.groq.com)")
    
    st.markdown("---")
    
    st.header("📚 Document Management")
    
    # Check if knowledge base exists
    vectorstore_path = os.path.join(config.VECTORSTORE_DIRECTORY, "index.faiss")
    if os.path.exists(vectorstore_path):
        st.success("✅ Knowledge base is loaded!")
        st.session_state.knowledge_base_loaded = True
    else:
        st.warning("⚠️ No knowledge base found. Please upload and process documents.")
    
    st.markdown("---")
    
    # File upload
    st.subheader("Upload PDFs")
    uploaded_files = st.file_uploader(
        "Choose PDF files",
        type=['pdf'],
        accept_multiple_files=True,
        help="Upload medical/mental health PDF documents"
    )
    
    # Save uploaded files
    if uploaded_files:
        os.makedirs(config.PDF_DIRECTORY, exist_ok=True)
        for uploaded_file in uploaded_files:
            file_path = os.path.join(config.PDF_DIRECTORY, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
        st.success(f"✅ {len(uploaded_files)} file(s) uploaded!")
    
    st.markdown("---")
    
    # Process documents button
    if st.button("🔄 Process Documents", use_container_width=True):
        with st.spinner("Processing documents..."):
            try:
                # Initialize document processor
                processor = DocumentProcessor(
                    chunk_size=config.CHUNK_SIZE,
                    chunk_overlap=config.CHUNK_OVERLAP
                )
                
                # Process all PDFs in directory
                chunks = processor.process_directory(config.PDF_DIRECTORY)
                
                if chunks:
                    # Add to knowledge base
                    st.session_state.chatbot.add_documents_to_knowledge_base(chunks)
                    st.success(f"✅ Processed {len(chunks)} document chunks!")
                    st.session_state.knowledge_base_loaded = True
                    st.rerun()
                else:
                    st.warning("⚠️ No documents found to process. Please upload PDFs first.")
            except Exception as e:
                st.error(f"❌ Error processing documents: {str(e)}")
    
    st.markdown("---")
    
    # Model selection
    st.subheader("⚙️ Model Settings")
    selected_model = st.selectbox(
        "Groq Model",
        [
            "llama-3.3-70b-versatile",      # Best for general use
            "llama-3.1-70b-versatile",      # Alternative Llama model
            "llama-3.1-8b-instant",         # Fastest, lightweight
            "gemma2-9b-it",                 # Google's Gemma
            "llama-3.2-90b-text-preview"    # Latest preview
        ],
        help="Choose the LLM model for responses"
    )
    config.GROQ_MODEL = selected_model
    
    st.markdown("---")
    
    # Clear knowledge base
    if st.button("🗑️ Clear Knowledge Base", use_container_width=True):
        st.session_state.chatbot.vector_db.clear_vectorstore()
        st.session_state.knowledge_base_loaded = False
        st.success("✅ Knowledge base cleared!")
        st.rerun()
    
    # Clear chat history
    if st.button("🧹 Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.session_state.chatbot.clear_history()
        st.success("✅ Chat history cleared!")
        st.rerun()
    
    st.markdown("---")
    st.caption("💡 Powered by Groq AI")

# Main chat interface
if not st.session_state.messages:
    # Show welcome message
    st.info(config.WELCOME_MESSAGE)

# Display chat messages
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        
        # Show sources if available
        if message["role"] == "assistant" and "sources" in message and message["sources"]:
            with st.expander("📄 View Sources"):
                for i, doc in enumerate(message["sources"], 1):
                    source = doc.metadata.get('source', 'Unknown')
                    page = doc.metadata.get('page', 'N/A')
                    st.markdown(f"**Source {i}:** {os.path.basename(source)} (Page {page})")
                    st.text(doc.page_content[:300] + "...")

# Chat input
if prompt := st.chat_input("Ask me anything about mental health and well-being..."):
    # Check if API key is set
    if not st.session_state.groq_api_key_set:
        st.warning("⚠️ Please add your Groq API key in the sidebar first!")
    # Check if knowledge base is loaded
    elif not st.session_state.knowledge_base_loaded:
        st.warning("⚠️ Please upload and process documents first!")
    else:
        # Add user message to chat
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Generate response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response, sources, _ = st.session_state.chatbot.chat(prompt)
                st.markdown(response)
                
                # Show sources
                if sources:
                    with st.expander("📄 View Sources"):
                        for i, doc in enumerate(sources, 1):
                            source = doc.metadata.get('source', 'Unknown')
                            page = doc.metadata.get('page', 'N/A')
                            st.markdown(f"**Source {i}:** {os.path.basename(source)} (Page {page})")
                            st.text(doc.page_content[:300] + "...")
        
        # Add assistant response to chat
        st.session_state.messages.append({
            "role": "assistant",
            "content": response,
            "sources": sources
        })
