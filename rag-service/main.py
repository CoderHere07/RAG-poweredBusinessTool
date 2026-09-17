import os
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from extractors import extract, UnsupportedFileType, ExtractionError
from store import add_document, stats, query_chunks, list_documents, delete_document

app = FastAPI(title="DocQA RAG Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    top_k: int = 5
    doc_ids: list[str] | None = None


@app.get("/health")
def health():
    return {"status": "ok", "embedding_model": settings.embedding_model, "chunk_size": settings.chunk_size}


@app.get("/stats")
def get_stats():
    return stats()

@app.get("/documents")
def get_documents():
    return {"documents": list_documents()}


@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail={"error": "no_filename", "message": "Uploaded file has no name."})

    data = await file.read()

    size_mb = len(data) / (1024 * 1024)
    if size_mb > settings.max_file_size_mb:
        raise HTTPException(
            status_code=413,
            detail={
                "error": "file_too_large",
                "message": f"File is {size_mb:.1f}MB, max is {settings.max_file_size_mb}MB.",
            },
        )

    if len(data) == 0:
        raise HTTPException(status_code=400, detail={"error": "empty_file", "message": "Uploaded file is empty."})

    try:
        pages = extract(file.filename, data)
    except UnsupportedFileType as e:
        raise HTTPException(status_code=415, detail={"error": "unsupported_type", "message": str(e)})
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail={"error": "extraction_failed", "message": str(e)})

    try:
        result = add_document(file.filename, pages)
    except ValueError as e:
        raise HTTPException(status_code=422, detail={"error": "no_chunks", "message": str(e)})

    return result


@app.post("/query")
def query(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail={"error": "empty_question", "message": "Question cannot be empty."})

    chunks = query_chunks(req.question, top_k=req.top_k, doc_ids=req.doc_ids)
    return {"chunks": chunks, "has_context": len(chunks) > 0}


@app.delete("/documents/{doc_id}")
def remove_document(doc_id: str):
    deleted_count = delete_document(doc_id)
    if deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail={"error": "not_found", "message": f"No document found with id {doc_id}"},
        )
    return {"doc_id": doc_id, "chunks_deleted": deleted_count}