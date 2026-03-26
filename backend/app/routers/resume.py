from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models import ResumeAnalysis
from app.services.ats_service import extract_text_from_pdf, analyze_resume

router = APIRouter(prefix="/api", tags=["resume"])


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

    file_bytes = await resume.read()

    try:
        resume_text = extract_text_from_pdf(file_bytes)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {exc}")

    if not resume_text:
        raise HTTPException(status_code=422, detail="No text could be extracted from the PDF.")

    try:
        result = await analyze_resume(resume_text, job_desc)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Gemini API error (likely quota or limit): {exc}")


    missing_kw_str = ", ".join(result["missing_keywords"])

    record = ResumeAnalysis(
        filename=resume.filename,
        job_desc=job_desc,
        ats_score=result["ats_score"],
        feedback=result["feedback"],
        missing_kw=missing_kw_str,
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
def history(db: Session = Depends(get_db)):
    """Return all past resume analyses ordered newest-first."""
    records: List[ResumeAnalysis] = (
        db.query(ResumeAnalysis)
        .order_by(ResumeAnalysis.created_at.desc())
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
