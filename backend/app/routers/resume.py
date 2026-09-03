import logging
from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import ResumeAnalysis
from app.services.ats_service import AnalysisError, analyze_resume, extract_text_from_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["resume"])

# Resumes are a page or two; anything larger is a mistake or an attack. The
# whole file is read into memory, so this bound is what keeps a single upload
# from exhausting the process.
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_desc: str = Form(...),
    db: Session = Depends(get_db),
):
    """
    Accept a PDF resume and job description, run ATS scoring via Gemini,
    persist the result, and return the analysis.
    """
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    if not job_desc.strip():
        raise HTTPException(status_code=400, detail="Job description must not be empty.")

    file_bytes = await resume.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Resume exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )

    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as exc:
        logger.warning("PDF parse failed for %s: %s", resume.filename, exc)
        raise HTTPException(status_code=422, detail="Could not parse the PDF.")

    if not resume_text:
        raise HTTPException(
            status_code=422,
            detail="No text could be extracted from the PDF. Scanned or image-only "
                   "resumes are not supported.",
        )

    try:
        result = await analyze_resume(resume_text, job_desc)
    except AnalysisError as exc:
        logger.error("Analysis failed for %s: %s", resume.filename, exc)
        raise HTTPException(
            status_code=502,
            detail="The analysis service is unavailable. Please try again shortly.",
        )

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
