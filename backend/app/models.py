from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


class ResumeAnalysis(Base):
    __tablename__ = "resume_analysis"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    job_desc = Column(Text, nullable=False)
    ats_score = Column(Float, nullable=False)
    feedback = Column(Text, nullable=True)
    missing_kw = Column(Text, nullable=True)   # stored as comma-separated string
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
