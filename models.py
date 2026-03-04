import os
from typing import List, Optional
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

class VectorDatabase:
    """
    Manages the vector database for storing and retrieving document embeddings.
    Uses FAISS for efficient similarity search and HuggingFace embeddings.
    """
    
    def __init__(self, persist_directory: str = "data/vectorstore"):
        """
        Initialize the vector database.
        
        Args:
            persist_directory: Directory to save/load the vector database
        """
        self.persist_directory = persist_directory
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )
        self.vectorstore: Optional[FAISS] = None
        
        # Create directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)
        
    def create_vectorstore(self, documents: List[Document]) -> None:
        """
        Create a new vector database from documents.
        
        Args:
            documents: List of LangChain Document objects to embed
        """
        if not documents:
            raise ValueError("No documents provided to create vectorstore")
        
        print(f"Creating vectorstore with {len(documents)} documents...")
        self.vectorstore = FAISS.from_documents(documents, self.embeddings)
        self.save_vectorstore()
        print("Vectorstore created and saved successfully!")
        
    def add_documents(self, documents: List[Document]) -> None:
        """
        Add new documents to existing vectorstore.
        
        Args:
            documents: List of LangChain Document objects to add
        """
        if not documents:
            return
            
        if self.vectorstore is None:
            self.create_vectorstore(documents)
        else:
            print(f"Adding {len(documents)} documents to vectorstore...")
            self.vectorstore.add_documents(documents)
            self.save_vectorstore()
            print("Documents added successfully!")
    
    def load_vectorstore(self) -> bool:
        """
        Load existing vectorstore from disk.
        
        Returns:
            True if loaded successfully, False otherwise
        """
        index_path = os.path.join(self.persist_directory, "index.faiss")
        
        if os.path.exists(index_path):
            print("Loading existing vectorstore...")
            self.vectorstore = FAISS.load_local(
                self.persist_directory, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print("Vectorstore loaded successfully!")
            return True
        else:
            # No print - this is normal on first run
            return False
    
    def save_vectorstore(self) -> None:
        """Save the vectorstore to disk."""
        if self.vectorstore is not None:
            self.vectorstore.save_local(self.persist_directory)
            
    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """
        Search for similar documents based on query.
        
        Args:
            query: User's question
            k: Number of similar documents to retrieve
            
        Returns:
            List of relevant documents
        """
        if self.vectorstore is None:
            return []
        
        results = self.vectorstore.similarity_search(query, k=k)
        return results
    
    def clear_vectorstore(self) -> None:
        """Clear the vector database."""
        self.vectorstore = None
        # Remove files from persist directory
        if os.path.exists(self.persist_directory):
            for file in os.listdir(self.persist_directory):
                file_path = os.path.join(self.persist_directory, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        print("Vectorstore cleared!")
