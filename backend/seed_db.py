import sys
import os
import random

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal, engine
from app.models import Base, ResumeAnalysis

def seed_db():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    
    # Check if we already have data
    if db.query(ResumeAnalysis).count() > 0:
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    job_descriptions = [
        "Software Engineer with experience in Python, Django, and React. Must know SQL and AWS.",
        "Data Scientist needed for machine learning projects using Pandas, Scikit-learn, and TensorFlow.",
        "Frontend Developer proficient in HTML, CSS, JavaScript, and Vue.js. Experience with UI/UX is a plus.",
        "DevOps Engineer to manage CI/CD pipelines using Jenkins, Docker, and Kubernetes.",
        "Product Manager to lead software features. Must be good with agile methodologies and Jira."
    ]

    feedbacks = [
        "Great matching skills. Strong background found.",
        "Missing some key technical skills like AWS and Docker.",
        "Good experience but lacks specific framework knowledge.",
        "Format is decent, skills match perfectly.",
        "Very relevant experience, highly recommended for interview."
    ]

    missing_keywords = [
        "AWS, Docker, CI/CD",
        "React, Node.js",
        "Machine Learning, TensorFlow",
        "Agile, Jira",
        "",
        "Python, SQL",
        "Communication, Leadership"
    ]

    first_names = ["alice", "bob", "charlie", "diana", "evan", "fiona", "george", "hannah", "ian", "julia"]
    last_names = ["smith", "jones", "brown", "davis", "miller", "wilson", "moore", "taylor", "anderson", "thomas"]

    # Insert 50 mock records
    for i in range(50):
        filename = f"{random.choice(first_names)}_{random.choice(last_names)}_resume.pdf"
        job_desc = random.choice(job_descriptions)
        ats_score = round(random.uniform(40.0, 95.0), 2)
        feedback = random.choice(feedbacks)
        missing_kw = random.choice(missing_keywords)
        
        record = ResumeAnalysis(
            filename=filename,
            job_desc=job_desc,
            ats_score=ats_score,
            feedback=feedback,
            missing_kw=missing_kw
        )
        db.add(record)
        
    try:
        db.commit()
        print("✅ Successfully inserted 50 mock resume records.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
