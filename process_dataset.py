"""
Script to process the mental health conversation dataset (parquet) and add it
to the existing FAISS vectorstore alongside the WHO/clinical PDF embeddings.

Usage:
    python process_dataset.py

The dataset rows (Context + Response pairs) are converted to LangChain Documents
and merged into data/vectorstore/ so the chatbot can retrieve both clinical
guidance and real counselling conversation examples during RAG.
"""

import os
import pandas as pd
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from models import VectorDatabase
import config

DATASET_PATH = "data2/0000.parquet"

# For very long conversations, split them so they stay within the same
# chunk size used for PDFs.
CONV_CHUNK_SIZE = 1000
CONV_CHUNK_OVERLAP = 100


def load_conversations(path: str) -> pd.DataFrame:
    """Load the parquet dataset and validate expected columns."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found: {path}")
    df = pd.read_parquet(path)
    missing = [c for c in ("Context", "Response") if c not in df.columns]
    if missing:
        raise ValueError(f"Expected columns missing from dataset: {missing}")
    # Drop rows where either column is null / empty
    df = df.dropna(subset=["Context", "Response"])
    df = df[df["Context"].str.strip().astype(bool) & df["Response"].str.strip().astype(bool)]
    df = df.reset_index(drop=True)
    print(f"Loaded {len(df)} valid conversation pairs from {path}")
    return df


def conversations_to_documents(df: pd.DataFrame) -> list[Document]:
    """
    Convert each Context/Response pair into a LangChain Document.

    The combined text is:
        Patient: <context>
        Counselor: <response>

    Metadata marks the source so the chatbot can label it differently from
    clinical PDFs when building the RAG context string.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CONV_CHUNK_SIZE,
        chunk_overlap=CONV_CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )

    documents = []
    for idx, row in df.iterrows():
        combined = (
            f"Patient: {row['Context'].strip()}\n\n"
            f"Counselor: {row['Response'].strip()}"
        )
        base_doc = Document(
            page_content=combined,
            metadata={
                "source": "mental_health_conversations",
                "type": "conversation",
                "row": idx,
            },
        )
        # Split only if the combined text exceeds the chunk size
        if len(combined) > CONV_CHUNK_SIZE:
            chunks = splitter.split_documents([base_doc])
            documents.extend(chunks)
        else:
            documents.append(base_doc)

    print(f"Created {len(documents)} document chunks from conversations")
    return documents


def main():
    print("=" * 60)
    print("Processing Mental Health Conversation Dataset")
    print("=" * 60)

    # 1. Load dataset
    df = load_conversations(DATASET_PATH)

    # 2. Convert to LangChain Documents
    print("\nConverting conversations to document chunks...")
    documents = conversations_to_documents(df)

    if not documents:
        print("No documents created. Exiting.")
        return

    # 3. Load existing vectorstore and MERGE (add_documents preserves PDFs)
    print(f"\nLoading existing vectorstore from: {config.VECTORSTORE_DIRECTORY}")
    vector_db = VectorDatabase(config.VECTORSTORE_DIRECTORY)
    loaded = vector_db.load_vectorstore()

    if loaded:
        print("Existing vectorstore found — merging dataset into it...")
        vector_db.add_documents(documents)
    else:
        print("No existing vectorstore found — creating new one from dataset only...")
        vector_db.create_vectorstore(documents)

    print("\n" + "=" * 60)
    print("Dataset processing complete!")
    print("=" * 60)
    print(f"Conversation chunks added : {len(documents)}")
    print(f"Vectorstore location      : {config.VECTORSTORE_DIRECTORY}")
    print("\nRestart the API server (uvicorn api:app) for changes to take effect.")


if __name__ == "__main__":
    main()
