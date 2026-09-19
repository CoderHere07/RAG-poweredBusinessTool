import io

from docx import Document
from pypdf import PdfReader


class UnsupportedFileType(Exception):
    pass

class ExtractionError(Exception):
    pass


def extract_pdf(data: bytes) -> list[tuple[int, str]]:
    """Returns [(page_number, text)] — 1-indexed pages for human-readable citations."""
    try:
        reader = PdfReader(io.BytesIO(data))
    except Exception as e:  # noqa: BLE001 — intentionally broad: any parse failure should become ExtractionError
        raise ExtractionError(f"Could not read PDF: {e}")

    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append((i, text))
    return pages


def extract_docx(data: bytes) -> list[tuple[int, str]]:
    """python-docx has no page concept — treat each paragraph block as page 1.
    Tables are included because contracts/reports hide key data in them."""
    try:
        doc = Document(io.BytesIO(data))
    except Exception as e:  # noqa: BLE001 — intentionally broad: any parse failure should become ExtractionError
        raise ExtractionError(f"Could not read DOCX: {e}")

    parts = [p.text for p in doc.paragraphs if p.text.strip()]

    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                parts.append(" | ".join(cells))

    text = "\n".join(parts)
    return [(1, text)] if text.strip() else []


def extract_txt(data: bytes) -> list[tuple[int, str]]:
    text = data.decode("utf-8", errors="replace")
    return [(1, text)] if text.strip() else []


EXTRACTORS = {
    "pdf": extract_pdf,
    "docx": extract_docx,
    "txt": extract_txt,
    "md": extract_txt,
}


def extract(filename: str, data: bytes) -> list[tuple[int, str]]:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in EXTRACTORS:
        raise UnsupportedFileType(
            f"Unsupported type '.{ext}'. Supported: {', '.join(EXTRACTORS)}"
        )

    pages = EXTRACTORS[ext](data)
    if not pages:
        raise ExtractionError(
            "No text could be extracted. The file may be empty or a scanned image."
        )
    return pages