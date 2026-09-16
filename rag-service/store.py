import uuid
import chromadb
from sentence_transformers import SentenceTransformer
from config import settings
from chunker import chunk_text

_client = chromadb.PersistentClient(path=settings.chroma_path)
_collection = _client.get_or_create_collection(
    name=settings.collection_name,
    metadata={"hnsw:space": "cosine"},   # cosine distance, range 0-2
)

# Loads ~90MB on first call; keep it module-level so it loads once, not per request.
_model = SentenceTransformer(settings.embedding_model)


def embed(texts: list[str]) -> list[list[float]]:
    return _model.encode(texts, show_progress_bar=False).tolist()


def add_document(filename: str, pages: list[tuple[int, str]]) -> dict:
    doc_id = str(uuid.uuid4())
    documents, ids, metadatas = [], [], []

    for page_num, page_text in pages:
        for idx, chunk in enumerate(chunk_text(page_text)):
            documents.append(chunk)
            ids.append(f"{doc_id}:p{page_num}:c{idx}")
            metadatas.append({
                "doc_id": doc_id,
                "source": filename,
                "page": page_num,
                "chunk_index": idx,
            })

    if not documents:
        raise ValueError("Document produced no chunks")

    # Batch to avoid memory spikes on large documents
    BATCH = 64
    for i in range(0, len(documents), BATCH):
        batch_docs = documents[i:i + BATCH]
        _collection.add(
            documents=batch_docs,
            embeddings=embed(batch_docs),
            ids=ids[i:i + BATCH],
            metadatas=metadatas[i:i + BATCH],
        )

    return {"doc_id": doc_id, "filename": filename, "chunks": len(documents)}


def stats() -> dict:
    return {"total_chunks": _collection.count()}