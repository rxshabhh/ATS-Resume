<p align="center">
  <h1 align="center">✨ Ether Talent — ATS Resume Evaluator</h1>
  <p align="center">
    AI-powered resume analysis tool that scores your resume for ATS compatibility, keyword matching, and structural readability using Google Gemini.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/Gemini_AI-Google-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" />
</p>

---

## 📸 Features

| Feature | Description |
|---|---|
| **📄 Resume Upload** | Upload PDF resumes and have them parsed automatically |
| **🤖 AI Analysis** | Get a detailed ATS score breakdown powered by Google Gemini |
| **📊 Keyword Matching** | See how well your resume aligns with job descriptions |
| **📝 Structure Review** | Receive feedback on formatting, readability, and ATS compliance |
| **📜 History Tracking** | View all your past analyses with scores at a glance |
| **🌗 Dark / Light Mode** | Toggle between themes with a single click |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS v4, Vite, Lucide Icons |
| **Backend** | FastAPI, SQLAlchemy, Alembic (migrations) |
| **AI Engine** | Google Gemini via `google-genai` SDK |
| **Database** | PostgreSQL |
| **Caching** | Redis (optional) |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18 & **npm**
- **Python** ≥ 3.10
- **PostgreSQL** 15+
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ATS-Resume.git
cd ATS-Resume
```

### 2. Configure Environment Variables

Create a `.env` file in the **project root**:

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ats_db

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# CORS — frontend origin
FRONTEND_URL=http://localhost:5173

# Backend URL — used by frontend
VITE_API_BASE_URL=http://localhost:8000
```

> **💡 Tip:** Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).

---

### 3. Set Up the Database

Open your PostgreSQL shell or GUI and create the database:

```sql
CREATE DATABASE ats_db;
```

---

### 4. Set Up the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

The API will be running at **`http://localhost:8000`**.

You can verify it by visiting [`http://localhost:8000/docs`](http://localhost:8000/docs) for the interactive Swagger UI.

---

### 5. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **`http://localhost:5173`**.

---

## 📖 How to Use

1. **Open the app** at `http://localhost:5173`
2. Navigate to the **Upload** page using the sidebar or top nav pills
3. **Upload a PDF resume** — it will be parsed automatically
4. Optionally paste a **Job Description** to compare against
5. Click **Analyze** — the AI will evaluate your resume and return:
   - An **ATS Score** (0–100)
   - **Keyword Match** analysis
   - **Structure & Readability** feedback
   - **Improvement suggestions**
6. View all your past evaluations on the **History** page
7. Click any history entry to **revisit** the full analysis
8. Toggle **Dark/Light mode** using the Sun/Moon icons at the bottom of the sidebar

---

## 📁 Project Structure

```
ATS-Resume/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # App entry point & CORS config
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic & Gemini integration
│   │   ├── models/           # SQLAlchemy models
│   │   └── config.py         # Settings & env loading
│   ├── migrations/           # Alembic DB migrations
│   ├── tests/                # Backend tests
│   └── requirements.txt
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/            # Dashboard, Upload, Analyze, History
│   │   ├── components/       # Layout, Sidebar
│   │   ├── context/          # ThemeContext (dark/light mode)
│   │   ├── services/         # API client
│   │   └── index.css         # Global styles & Tailwind config
│   ├── package.json
│   └── tailwind.config.js
│
├── .env                      # Environment variables
└── README.md                 # You are here!
```

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|---|---|
| **Dark mode not working** | Make sure `@custom-variant dark` is in `index.css` (required for Tailwind v4) |
| **Backend can't connect to DB** | Verify `DATABASE_URL` in `.env` and that PostgreSQL is running |
| **Gemini API errors** | Check your `GEMINI_API_KEY` is valid and not rate-limited |
| **Redis connection error** | Redis is optional — the app works without it. Install Redis if you want caching |
| **Frontend build fails** | Run `npm install` again and ensure Node.js ≥ 18 |

---

## 📜 License

This project is for educational and personal use.

---

<p align="center">
  Built with ❤️ using React, FastAPI, and Google Gemini
</p>
