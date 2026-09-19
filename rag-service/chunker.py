import re
from config import settings

_ABBREVIATIONS = r"(?<!\bMr\.)(?<!\bMrs\.)(?<!\bDr\.)(?<!\bInc\.)(?<!\bLtd\.)(?<!\be\.g\.)(?<!\bi\.e\.)(?<!\betc\.)"
_SENTENCE_END = re.compile(rf"(?<=[.!?]){_ABBREVIATIONS}\s+")


def split_sentences(text: str) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    return [s for s in _SENTENCE_END.split(text) if s.strip()]


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[str]:
    """Group sentences into chunks of ~chunk_size chars, carrying `overlap`
    characters of trailing context into the next chunk so ideas spanning a
    boundary remain retrievable from either side."""
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap

    sentences = split_sentences(text)
    if not sentences:
        return []

    chunks: list[str] = []
    current = ""

    for sentence in sentences:
        if len(sentence) > chunk_size:
            if current.strip():
                chunks.append(current.strip())
                current = ""
            for i in range(0, len(sentence), chunk_size):
                chunks.append(sentence[i:i + chunk_size].strip())
            continue

        if len(current) + len(sentence) + 1 > chunk_size and current:
            chunks.append(current.strip())
            tail = current[-overlap:] if overlap else ""
            current = f"{tail} {sentence}"
        else:
            current = f"{current} {sentence}".strip()

    if current.strip():
        chunks.append(current.strip())

    return chunks