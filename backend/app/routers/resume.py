import asyncio
import logging
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ResumeAnalysis
from app.services.ats_service import AnalysisError, analyze_resume
from app.services.keyword_score import score_keywords
from app.services.nlp import ModelUnavailable
from app.utils.upload import read_resume_text

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["resume"])


async def _deterministic_score(resume_text: str, job_desc: str) -> dict | None:
    """
    Run the keyword scorer, returning None if it cannot run.

    It is reported alongside the model's score rather than instead of it: the
    two are computed from the same inputs by different methods, so a wide gap
    between them is itself information. A failure here must not fail the
    request, since this is supplementary to the model's answer.
    """
    try:
        return await asyncio.to_thread(score_keywords, resume_text, job_desc)
    except ModelUnavailable as exc:
        logger.warning("keyword scoring unavailable: %s", exc)
        return None
    except Exception as exc:
        logger.warning("keyword scoring failed: %s", exc)
        return None


@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_desc: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Accept a PDF resume and job description, run ATS scoring via Gemini,
    persist the result, and return the analysis alongside a deterministic
    keyword score computed from the same inputs.
    """
    if not job_desc.strip():
        raise HTTPException(status_code=400, detail="Job description must not be empty.")

    resume_text = await read_resume_text(resume)

    try:
        result = await analyze_resume(resume_text, job_desc)
    except AnalysisError as exc:
        logger.error("Analysis failed for %s: %s", resume.filename, exc)
        raise HTTPException(
            status_code=502,
            detail="The analysis service is unavailable. Please try again shortly.",
        )

    # Computed after the model call, not before: on a 502 the client retries
    # against /api/keyword-score, so scoring here first would only be wasted work.
    keyword_result = await _deterministic_score(resume_text, job_desc)

    record = ResumeAnalysis(
        filename=resume.filename,
        job_desc=job_desc,
        ats_score=result["ats_score"],
        feedback=result["feedback"],
        missing_kw=", ".join(result["missing_keywords"]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "ats_score": record.ats_score,
        "feedback": record.feedback,
        "missing_keywords": result["missing_keywords"],
        "created_at": record.created_at,
        "keyword_score": keyword_result,
    }


@router.get("/history")
def history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """Return past resume analyses, newest first."""
    records: List[ResumeAnalysis] = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "ats_score": r.ats_score,
            "feedback": r.feedback,
            "missing_keywords": [kw.strip() for kw in (r.missing_kw or "").split(",") if kw.strip()],
            "created_at": r.created_at,
        }
        for r in records
    ]
