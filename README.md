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
| **🧮 Deterministic Keyword Score** | A second, reproducible score computed locally from a weighted skill vocabulary — no API call, and it shows its arithmetic |
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

Copy the template and fill in your values:

```bash
cp .env.example .env
```

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ats_db

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# CORS — frontend origin
FRONTEND_URL=http://localhost:5173

# Optional — omit to run without caching
REDIS_URL=redis://localhost:6379
```

`.env` is gitignored. It is read once, by `backend/app/core/config.py`; the
database layer and Alembic both import those settings rather than parsing
`.env` again.

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

# Download the spaCy model used for keyword extraction
python -m spacy download en_core_web_sm

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

## 🧮 How Scoring Works

The app produces **two independent scores** from the same inputs.

### 1. AI score — `POST /api/analyze`

The resume and job description go to Gemini in a single prompt, which returns a
score, a paragraph of feedback, and a list of missing keywords. It is good at
judgement — phrasing, structure, what a recruiter would notice — but it is not
reproducible, and it cannot show why it chose a number.

The response is validated rather than trusted: the score is clamped to 0–100,
and a failed or unparseable call raises instead of persisting a fabricated 0.

### 2. Keyword score — `POST /api/keyword-score`

A deterministic scorer with no external dependency:

1. `services/nlp.py` extracts candidate terms — multi-word and punctuated
   skills (`rest api`, `ci/cd`, `c++`) are matched first and removed from the
   text, then spaCy reduces what remains to the lemmas of its nouns and proper
   nouns.
2. Terms outside the curated vocabulary in `core/skill_weights.py` are dropped.
3. `services/matcher.py` weights each skill the job asks for by how specific it
   is (a core language is worth 3.0, an umbrella term like "api" 1.0) and
   returns the share of that weight the resume covers.

```
score = (weight of matched skills) / (weight of all required skills) × 100
```

Because the vocabulary and weights are fixed, the same inputs always give the
same number, and the response includes a `breakdown` listing every required
skill, its weight, and whether it matched — so the score can be checked by hand.

A job description containing no recognised skill scores `null`, not `0`.
Zero means "asked for skills, matched none"; null means "there was nothing to
score", and reporting a confident 0 for the second case would be a lie.

### Why both

They fail in different ways, which is the point. The AI score is the readable
one; the keyword score is the defensible one. When they disagree sharply, that
gap is worth looking at. And since the keyword path calls nothing external, the
frontend falls back to it when Gemini is unavailable — a partial answer instead
of an error page.

---

## 📁 Project Structure

```
ATS-Resume/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # App entry, CORS, cache lifespan
│   │   ├── db.py                 # Engine and session dependency
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── api/analyze.py        # /api/keyword-score — deterministic scoring
│   │   ├── routers/resume.py     # /api/analyze and /api/history
│   │   ├── core/                 # Settings, skill vocabulary and weights
│   │   ├── services/             # PDF parsing, spaCy keywords, Gemini client
│   │   └── utils/                # Normalization and phrase matching
│   ├── migrations/               # Alembic migrations
│   ├── tests/
│   └── requirements.txt
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── pages/                # Dashboard, Upload, Analyze, History, LearnMore
│   │   ├── components/           # Layout, Sidebar, SkillsCard
│   │   ├── context/              # ThemeContext (dark/light)
│   │   └── services/api.js       # API client
│   └── vite.config.js            # Proxies /api to localhost:8000
│
├── execution/                    # PowerShell dev-server launchers
├── .env.example
└── README.md
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
| **Redis connection error** | Redis is optional. The app pings it at startup and runs uncached if it does not answer |
| **Frontend build fails** | Run `npm install` again and ensure Node.js ≥ 18 |
| **`/api/keyword-score` returns 503** | The spaCy model is missing. Run `python -m spacy download en_core_web_sm` |
| **`/api/analyze` returns 502** | Gemini rejected the request — usually an expired or revoked `GEMINI_API_KEY`. The app falls back to the keyword score, which still works |

---

## 📜 License

This project is for educational and personal use.

---

<p align="center">
  Built with ❤️ using React, FastAPI, and Google Gemini
</p>
