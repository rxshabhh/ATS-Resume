import sys
import os

# Add the project root to sys.path to allow imports from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import engine
from app.models import Base

def init_db():
    print("Initializing the database...")
    try:
        # Create all tables defined in models.py
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully.")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

if __name__ == "__main__":
    init_db()
