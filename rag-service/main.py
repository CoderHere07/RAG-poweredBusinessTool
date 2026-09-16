from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from store import stats

app = FastAPI(title="DocQA RAG Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "embedding_model": settings.embedding_model,
        "chunk_size": settings.chunk_size,
    }


@app.get("/stats")
def get_stats():
    return stats()