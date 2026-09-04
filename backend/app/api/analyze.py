"""
Deterministic keyword-scoring endpoint.

Separate from /api/analyze on purpose: this route makes no external call, so it
answers even when the model API is down or unkeyed, and its output is fully
reproducible. It is the endpoint to point at when asked how a score was
arrived at.
"""

import asyncio
import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.keyword_score import score_keywords
from app.services.nlp import ModelUnavailable
from app.utils.upload import read_resume_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["keyword scoring"])


@router.post("/keyword-score")
async def keyword_score(
    resume: UploadFile = File(...),
    job_desc: str = Form(...),
):
    """Score a resume against a job description using the weighted skill vocabulary."""
    if not job_desc.strip():
        raise HTTPException(status_code=400, detail="Job description must not be empty.")

    resume_text = await read_resume_text(resume)

    try:
        result = await asyncio.to_thread(score_keywords, resume_text, job_desc)
    except ModelUnavailable as exc:
        logger.error("keyword scoring unavailable: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))

    return {"filename": resume.filename, **result}
