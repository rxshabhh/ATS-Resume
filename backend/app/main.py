import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyze import router as keyword_router
from app.core.config import settings
from app.routers.resume import router as resume_router
from app.services.ats_service import close_cache, init_cache

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Probe Redis once at startup so the cache flag reflects a real connection
    # rather than the mere existence of a lazily-constructed client.
    await init_cache()
    yield
    await close_cache()


app = FastAPI(
    title="ATS Resume Analyzer",
    description="Analyze resumes against job descriptions using AI-powered ATS scoring.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server and any configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=list({settings.frontend_url, "http://localhost:5173"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(keyword_router)


@app.get("/")
def health():
    return {"status": "ATS backend running"}
