from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    chroma_path: str = "./chroma_db"
    collection_name: str = "documents"
    embedding_model: str = "all-MiniLM-L6-v2"

    chunk_size: int = 800
    chunk_overlap: int = 150
    max_file_size_mb: int = 10
    relevance_threshold: float = 0.65   # cosine distance; lower = stricter

    class Config:
        env_file = ".env"

settings = Settings()