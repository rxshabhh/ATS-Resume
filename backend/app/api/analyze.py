from fastapi import APIRouter, UploadFile, File, Form
from app.services.parser import extract_text
from app.services.nlp import extract_keywords
from app.services.matcher import match_keywords
from app.core.skill_vocab import VALID_SKILLS

router = APIRouter(prefix="/analyze", tags=["ATS Analysis"])

@router.post("/")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_text = extract_text(resume)

    jd_keywords_raw = extract_keywords(job_description)
    resume_keywords = extract_keywords(resume_text)

    jd_keywords = {k for k in jd_keywords_raw if k in VALID_SKILLS}

    matched, missing, score = match_keywords(jd_keywords, resume_keywords)

    return {
        "ats_score": score,
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
        "total_jd_keywords": len(jd_keywords)
    }
