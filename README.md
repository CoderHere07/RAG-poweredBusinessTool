cat > README.md << 'EOF'
# DocQA — RAG-powered Document Q&A

Upload documents, ask questions, get answers grounded in your own files with inline source citations.

## Architecture
React (Vercel) → Node/Express (Railway) → FastAPI RAG service (Railway) → Chroma
                        ↓
                  Claude API (streaming)

## Status
In active development.
EOF