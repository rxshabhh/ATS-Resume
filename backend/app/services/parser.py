"""Text extraction from uploaded resume files."""

import io

import pdfplumber
from docx import Document


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract plain text from a PDF given its raw bytes.

    Lives here rather than alongside the Gemini client so that the deterministic
    scoring path can parse a resume without importing an LLM SDK or requiring an
    API key.
    """
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract plain text from a .docx given its raw bytes."""
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs).strip()
