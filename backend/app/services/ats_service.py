import asyncio
import hashlib
import io
import json
import logging

import pdfplumber
from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini client once at module load
client = genai.Client(api_key=settings.gemini_api_key)
_model_name = "gemini-2.5-flash"

MAX_ATTEMPTS = 2


class AnalysisError(Exception):
    """Raised when the model call fails or returns something unusable."""


# ---------------------------------------------------------------------------
# Redis cache (optional — the app runs without it)
# ---------------------------------------------------------------------------
try:
    import redis.asyncio as aioredis
except ImportError:  # pragma: no cover - redis is an optional dependency
    aioredis = None

CACHE_TTL = 60 * 60 * 24  # 24 hours

_redis = None
_cache_enabled = False


async def init_cache() -> None:
    """
    Connect to Redis and confirm it answers before enabling the cache.

    from_url() is lazy and never raises on an unreachable server, so checking
    only that it returned an object would leave the cache "enabled" while every
    request paid a connection timeout on both read and write. Only a successful
    ping flips the flag.
    """
    global _redis, _cache_enabled

    if aioredis is None:
        logger.info("redis package not installed; running without cache")
        return

    try:
        _redis = aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True
        )
        await _redis.ping()
    except Exception as exc:
        logger.info("Redis unavailable (%s); running without cache", exc)
        _redis = None
        _cache_enabled = False
        return

    _cache_enabled = True
    logger.info("Redis cache enabled at %s", settings.redis_url)


async def close_cache() -> None:
    """Release the Redis connection pool on shutdown."""
    global _cache_enabled
    _cache_enabled = False
    if _redis is not None:
        await _redis.aclose()


def _cache_key(resume_text: str, job_description: str) -> str:
    """Stable cache key: SHA-256 of the combined inputs."""
    raw = f"{resume_text}||{job_description}"
    return "ats:" + hashlib.sha256(raw.encode()).hexdigest()


# ---------------------------------------------------------------------------
# PDF extraction
# ---------------------------------------------------------------------------
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF given its raw bytes."""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages = [page.extract_text() or "" for page in pdf.pages]
    return "\n".join(pages).strip()


# ---------------------------------------------------------------------------
# Gemini call — runs in a thread so it never blocks the event loop
# ---------------------------------------------------------------------------
def _strip_code_fence(raw: str) -> str:
    """Remove a markdown code fence if the model wrapped its JSON in one."""
    if "```json" in raw:
        return raw.split("```json")[1].split("```")[0].strip()
    if "```" in raw:
        return raw.split("```")[1].strip()
    return raw


def _build_prompt(resume_text: str, job_description: str) -> str:
    return f"""
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


def _call_gemini(resume_text: str, job_description: str) -> dict:
    """
    Synchronous Gemini call.

    Retries once on a transport error or unparseable output, then gives up with
    an AnalysisError. It deliberately does not fall back to a zero score: a
    fabricated 0 would be persisted to history and shown to the user as though
    the resume had genuinely scored nothing.
    """
    prompt = _build_prompt(resume_text, job_description)
    last_error: Exception | None = None

    for attempt in range(1, MAX_ATTEMPTS + 1):
        raw = ""
        try:
            response = client.models.generate_content(
                model=_model_name,
                contents=prompt,
            )
            raw = (response.text or "").strip()
            data = json.loads(_strip_code_fence(raw))

            # The model is asked for 0-100 but is not bound by that. Clamp
            # rather than trust, so an out-of-range hallucination cannot reach
            # the database or the UI.
            score = max(0.0, min(100.0, float(data.get("ats_score", 0))))

            return {
                "ats_score": score,
                "feedback": str(data.get("feedback", "")),
                "missing_keywords": [str(kw) for kw in data.get("missing_keywords", [])],
            }
        except Exception as exc:
            # Catches transport/quota errors from the SDK as well as malformed
            # output. The original code caught only JSON errors, so the retry
            # never fired on the failure that actually happens in production.
            last_error = exc
            logger.warning(
                "Gemini attempt %d/%d failed: %s | raw response: %.200s",
                attempt,
                MAX_ATTEMPTS,
                exc,
                raw or "<no response>",
            )

    raise AnalysisError(f"Gemini analysis failed after {MAX_ATTEMPTS} attempts: {last_error}")


# ---------------------------------------------------------------------------
# Public async entry point — checks Redis first, then calls Gemini
# ---------------------------------------------------------------------------
async def analyze_resume(resume_text: str, job_description: str) -> dict:
    """Async ATS analysis, served from cache when available."""
    key = _cache_key(resume_text, job_description)

    if _cache_enabled and _redis is not None:
        try:
            cached = await _redis.get(key)
            if cached:
                logger.debug("cache hit %s", key[:16])
                return json.loads(cached)
        except Exception as exc:
            logger.warning("cache read failed: %s", exc)

    logger.debug("cache miss %s; calling Gemini", key[:16])
    result = await asyncio.to_thread(_call_gemini, resume_text, job_description)

    if _cache_enabled and _redis is not None:
        try:
            await _redis.setex(key, CACHE_TTL, json.dumps(result))
        except Exception as exc:
            logger.warning("cache write failed: %s", exc)

    return result
