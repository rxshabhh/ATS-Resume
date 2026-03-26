import io
import json
import hashlib
import asyncio
import pdfplumber
from google import genai
from app.core.config import settings

# Configure Gemini client once at module load
client = genai.Client(api_key=settings.gemini_api_key)
_model_name = "gemini-2.5-flash"


# ---------------------------------------------------------------------------
# Redis cache (optional — degrades gracefully if Redis is not running)
# ---------------------------------------------------------------------------
try:
    import redis.asyncio as aioredis
    _redis: aioredis.Redis = aioredis.from_url(
        settings.redis_url, encoding="utf-8", decode_responses=True
    )
    CACHE_TTL = 60 * 60 * 24  # 24 hours
    REDIS_ENABLED = True
except Exception:
    _redis = None
    REDIS_ENABLED = False


def _cache_key(resume_text: str, job_description: str) -> str:
    """Stable cache key: SHA-256 of the combined inputs."""
    raw = f"{resume_text}||{job_description}"
    return "ats:" + hashlib.sha256(raw.encode()).hexdigest()


# ---------------------------------------------------------------------------
# PDF extraction (sync, but fast — no need to offload)
# ---------------------------------------------------------------------------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF given its raw bytes."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


# ---------------------------------------------------------------------------
# Gemini call — runs in a thread so it never blocks the event loop
# ---------------------------------------------------------------------------
def _call_gemini(resume_text: str, job_description: str) -> dict:
    """Synchronous Gemini call with improved prompt and parsing logic."""
    prompt = f"""
You are a senior technical recruiter and expert in 
Applicant Tracking Systems (ATS).
Your task is to analyze the provided resume against the job description.

Evaluate the resume on:
1. Keyword Match: How well do the skills and experience align with the job responsibilities?
2. Structure & Readability: Is the resume well-organized and ATS-compliant?
3. Gap Analysis: What specific skills, certifications, or experiences are missing?

Respond ONLY with a valid JSON object in exactly this format:
{{
  "ats_score": <float between 0 and 100>,
  "feedback": "<concise paragraph of overall feedback and specific suggestions for improvement>",
  "missing_keywords": ["keyword1", "keyword2", ...]
}}

### Job Description ###
{job_description}

### Resume ###
{resume_text}
"""
    
    # Simple retry logic for malformed JSON
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=_model_name,
                contents=prompt,
            )
            raw = response.text.strip()

            # Clean up markdown code blocks if the model includes them
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].strip()

            data = json.loads(raw)
            return {
                "ats_score": float(data.get("ats_score", 0)),
                "feedback": str(data.get("feedback", "")),
                "missing_keywords": [str(kw) for kw in data.get("missing_keywords", [])],
            }
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            print(f"[Gemini Error] Raw response: {raw}")
            if attempt == 1:
                # Fallback on final attempt
                return {
                    "ats_score": 0,
                    "feedback": f"Failed to parse AI response: {e}. Raw: {raw[:100]}...",
                    "missing_keywords": []
                }
            continue
    
    return {
        "ats_score": 0,
        "feedback": "An unexpected error occurred during analysis.",
        "missing_keywords": []
    }


# ---------------------------------------------------------------------------
# Public async entry point — checks Redis first, then calls Gemini
# ---------------------------------------------------------------------------
async def analyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Async ATS analysis with Redis caching.
    Cache hit  → returned instantly from Redis.
    Cache miss → Gemini called in a thread (non-blocking), result cached.
    """
    key = _cache_key(resume_text, job_description)

    # 1. Cache hit?
    if REDIS_ENABLED and _redis:
        try:
            cached = await _redis.get(key)
            if cached:
                print(f"[cache HIT] {key[:16]}…")
                return json.loads(cached)
        except Exception as e:
            print(f"[cache read error] {e}")

    # 2. Cache miss — call Gemini in a thread executor
    print("[cache MISS] calling Gemini…")
    result = await asyncio.to_thread(_call_gemini, resume_text, job_description)

    # 3. Store in Redis
    if REDIS_ENABLED and _redis:
        try:
            await _redis.setex(key, CACHE_TTL, json.dumps(result))
            msg = f"[cache SET] {key[:16]}… (TTL={CACHE_TTL}s)"
            print(msg)
        except Exception as e:
            print(f"[cache write error] {e}")

    return result
