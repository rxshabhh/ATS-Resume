from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.resume import router as resume_router

app = FastAPI(
    title="ATS Resume Analyzer",
    description="Analyze resumes against job descriptions using AI-powered ATS scoring.",
    version="1.0.0",
)

# CORS — allow the Vite dev server and any configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)


@app.get("/")
def health():
    return {"status": "ATS backend running"}
