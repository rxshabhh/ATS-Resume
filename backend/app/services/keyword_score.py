"""
Deterministic ATS scoring.

The Gemini path answers "what should I improve?" but cannot answer "how do you
know that number is right?" — it is non-reproducible and has no stated rule.
This path is the opposite: same inputs always produce the same score, and the
score decomposes into a list of skills and weights that can be checked by hand.

It also has no external dependency, so it keeps working when the model API is
unavailable.
"""

from app.core.skill_vocab import VALID_SKILLS
from app.services.matcher import match_keywords
from app.services.nlp import extract_keywords


def score_keywords(resume_text: str, job_description: str) -> dict:
    """
    Compare a resume against a job description and return the scored result.

    Only terms in the curated vocabulary are considered. Restricting it this
    way is what makes the output defensible: an uncurated bag of words matches
    on "experience" and "team" and produces a number nobody can justify.
    """
    jd_skills = {kw for kw in extract_keywords(job_description) if kw in VALID_SKILLS}
    resume_skills = {kw for kw in extract_keywords(resume_text) if kw in VALID_SKILLS}

    result = match_keywords(jd_skills, resume_skills)

    return {
        "score": result.score,
        "matched_keywords": sorted(result.matched),
        "missing_keywords": sorted(result.missing),
        "resume_skills": sorted(resume_skills),
        "total_jd_skills": len(jd_skills),
        "matched_weight": result.matched_weight,
        "total_weight": result.total_weight,
        "breakdown": result.breakdown,
    }
