"""Shared validation for resume uploads."""

import logging

from fastapi import HTTPException, UploadFile

from app.services.parser import extract_text_from_pdf

logger = logging.getLogger(__name__)

# Resumes are a page or two; anything larger is a mistake or an attack. The
# whole file is read into memory, so this bound is what keeps a single upload
# from exhausting the process.
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


async def read_resume_text(resume: UploadFile) -> str:
    """
    Validate an uploaded PDF and return its text.

    Raises HTTPException with a client-safe message; the underlying parse error
    is logged rather than returned, so a malformed file cannot echo library
    internals back to the caller.
    """
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await resume.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Resume exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )

    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as exc:
        logger.warning("PDF parse failed for %s: %s", resume.filename, exc)
        raise HTTPException(status_code=422, detail="Could not parse the PDF.")

    if not text:
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from the PDF. Scanned or image-only "
                   "resumes are not supported.",
        )

    return text
