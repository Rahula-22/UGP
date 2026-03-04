import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class DocumentProcessor:
    """
    Handles loading and processing of PDF documents.
    Splits documents into chunks for efficient embedding and retrieval.
    """
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Initialize the document processor.
        
        Args:
            chunk_size: Size of text chunks (in characters)
            chunk_overlap: Overlap between chunks to maintain context
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def load_pdf(self, file_path: str) -> List[Document]:
        """
        Load a single PDF file.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of Document objects
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")
        
        print(f"Loading PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        print(f"Loaded {len(documents)} pages from PDF")
        return documents
    
    def load_pdfs_from_directory(self, directory: str) -> List[Document]:
        """
        Load all PDF files from a directory.
        
        Args:
            directory: Path to directory containing PDFs
            
        Returns:
            List of all Document objects from all PDFs
        """
        all_documents = []
        
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")
            return all_documents
        
        pdf_files = [f for f in os.listdir(directory) if f.endswith('.pdf')]
        
        if not pdf_files:
            print(f"No PDF files found in {directory}")
            return all_documents
        
        for pdf_file in pdf_files:
            file_path = os.path.join(directory, pdf_file)
            try:
                documents = self.load_pdf(file_path)
                all_documents.extend(documents)
            except Exception as e:
                print(f"Error loading {pdf_file}: {str(e)}")
        
        print(f"Total documents loaded: {len(all_documents)}")
        return all_documents
    
    def split_documents(self, documents: List[Document]) -> List[Document]:
        """
        Split documents into smaller chunks.
        
        Args:
            documents: List of Document objects to split
            
        Returns:
            List of chunked Document objects
        """
        if not documents:
            return []
        
        print(f"Splitting {len(documents)} documents into chunks...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks")
        return chunks
    
    def process_pdf(self, file_path: str) -> List[Document]:
        """
        Complete pipeline: load and split a PDF.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            List of chunked Document objects ready for embedding
        """
        documents = self.load_pdf(file_path)
        chunks = self.split_documents(documents)
        return chunks
    
    def process_directory(self, directory: str) -> List[Document]:
        """
        Complete pipeline: load and split all PDFs in a directory.
        
        Args:
            directory: Path to directory containing PDFs
            
        Returns:
            List of chunked Document objects ready for embedding
        """
        documents = self.load_pdfs_from_directory(directory)
        chunks = self.split_documents(documents)
        return chunks
