import os
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from extractors import extract
from store import stats, add_document

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

@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    data = await file.read()
    pages = extract(file.filename, data)
    result = add_document(file.filename, pages)
    return result