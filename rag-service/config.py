from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    chroma_path: str = "./chroma_db"
    collection_name: str = "documents"
    embedding_model: str = "all-MiniLM-L6-v2"

    chunk_size: int = 800
    chunk_overlap: int = 150
    max_file_size_mb: int = 100
    relevance_threshold: float = 0.65

    @field_validator("chunk_overlap")
    @classmethod
    def overlap_must_be_smaller_than_chunk(cls, v, info):
        chunk_size = info.data.get("chunk_size", 800)
        if v >= chunk_size:
            raise ValueError(f"chunk_overlap ({v}) must be smaller than chunk_size ({chunk_size})")
        return v

    @field_validator("relevance_threshold")
    @classmethod
    def threshold_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("relevance_threshold must be positive")
        return v

    class Config:
        env_file = ".env"

settings = Settings()