import os
from typing import List, Optional
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
import pandas as pd
from sklearn.linear_model import LinearRegression
import joblib

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
        self.embeddings = None
        self.vectorstore: Optional[FAISS] = None
        
        # Create directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)

    def _get_embeddings(self) -> HuggingFaceEmbeddings:
        """Load embeddings model lazily so API startup stays fast and reliable."""
        if self.embeddings is None:
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'}
            )
        return self.embeddings
        
    def create_vectorstore(self, documents: List[Document]) -> None:
        """
        Create a new vector database from documents.
        
        Args:
            documents: List of LangChain Document objects to embed
        """
        if not documents:
            raise ValueError("No documents provided to create vectorstore")
        
        print(f"Creating vectorstore with {len(documents)} documents...")
        embeddings = self._get_embeddings()
        self.vectorstore = FAISS.from_documents(documents, embeddings)
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
            embeddings = self._get_embeddings()
            self.vectorstore = FAISS.load_local(
                self.persist_directory, 
                embeddings,
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


class MLModel:
    
    def __init__(self, data_path: str = "data2/0000.parquet", model_path: str = "data/model.pkl"):
        """
        Initialize the ML model.
        
        Args:
            data_path: Path to the Parquet dataset
            model_path: Path to save/load the trained model
        """
        self.data_path = data_path
        self.model_path = model_path
        self.model = None
        
    def load_data(self) -> pd.DataFrame:
        """Load the dataset from Parquet file."""
        return pd.read_parquet(self.data_path)
    
    def preprocess_data(self, df: pd.DataFrame) -> tuple:
        """Preprocess data to extract features and target."""
        # Feature: length of context
        X = df['Context'].str.len().values.reshape(-1, 1)
        # Target: length of response
        y = df['Response'].str.len().values
        return X, y
    
    def train_model(self) -> None:
        """Train the linear regression model."""
        df = self.load_data()
        X, y = self.preprocess_data(df)
        
        self.model = LinearRegression()
        self.model.fit(X, y)
        
        # Save the model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        print("ML model trained and saved!")
    
    def load_model(self) -> bool:
        """Load the trained model from disk."""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            print("ML model loaded!")
            return True
        return False
    
    def predict_response_length(self, context: str) -> float:
        """
        Predict the response length based on context length.
        
        Args:
            context: The input context text
            
        Returns:
            Predicted response length
        """
        if self.model is None:
            if not self.load_model():
                self.train_model()
        
        context_length = len(context)
        prediction = self.model.predict([[context_length]])[0]
        return max(0, prediction)  # Ensure non-negative
