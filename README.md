# Ether Talent — ATS Resume Evaluator

A resume analysis service that scores resumes for ATS compatibility, keyword relevance, and structural readability. Every evaluation is computed twice: once by Google Gemini, and once by a deterministic scorer that runs locally and shows its arithmetic.

**Stack:** React 18 · Tailwind CSS v4 · Vite · FastAPI · SQLAlchemy · Alembic · PostgreSQL · Redis (optional) · Google Gemin

---

## Features

| Feature | Description |
|---|---|
| Resume upload | PDF resumes are uploaded and parsed automatically |
| AI analysis | Detailed ATS score breakdown powered by Google Gemini |
| Deterministic keyword score | A reproducible second score computed locally from a weighted skill vocabulary, with no external API call |
| Keyword matching | Measures alignment between a resume and a target job description |
| Structure review | Feedback on formatting, readability, and ATS compliance |
| History tracking | All past analyses stored and retrievable with scores at a glance |
| Theming | Dark and light modes |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS v4, Vite, Lucide Icons |
| Backend | FastAPI, SQLAlchemy, Alembic |
| AI engine | Google Gemini via the `google-genai` SDK |
| NLP | spaCy (`en_core_web_sm`) |
| Database | PostgreSQL |
| Caching | Redis (optional) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later, with npm
- Python 3.10 or later
- PostgreSQL 15 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ATS-Resume.git
cd ATS-Resume
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ats_db

# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# CORS - frontend origin
FRONTEND_URL=http://localhost:5173

# Optional - omit to run without caching
REDIS_URL=redis://localhost:6379
```

`.env` is gitignored. It is read once, by `backend/app/core/config.py`; the database layer and Alembic both import those settings rather than parsing `.env` again.

Gemini API keys are issued from [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Create the database

```sql
CREATE DATABASE ats_db;
```

### 4. Set up the backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# spaCy model used for keyword extraction
python -m spacy download en_core_web_sm

alembic upgrade head

uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive Swagger documentation is available at `http://localhost:8000/docs`.

### 5. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The application runs at `http://localhost:5173`.

---

## Usage

1. Open `http://localhost:5173`.
2. Go to the Upload page from the sidebar or the top navigation.
3. Upload a PDF resume; it is parsed on upload.
4. Optionally paste a job description to compare against.
5. Run Analyze. The response contains an ATS score (0–100), keyword match analysis, structure and readability feedback, and improvement suggestions.
6. Past evaluations are listed on the History page; selecting an entry restores the full analysis.
7. Theme is toggled from the sidebar.

---

## How Scoring Works

The application produces two independent scores from the same inputs.

### AI score — `POST /api/analyze`

The resume and job description are sent to Gemini in a single prompt, which returns a score, a paragraph of feedback, and a list of missing keywords. This path is strong on judgement — phrasing, structure, and what a recruiter would notice — but it is not reproducible and cannot explain how it arrived at a number.

The response is validated rather than trusted: the score is clamped to 0–100, and a failed or unparseable call raises instead of persisting a fabricated 0.

### Keyword score — `POST /api/keyword-score`

A deterministic scorer with no external dependency:

1. `services/nlp.py` extracts candidate terms. Multi-word and punctuated skills (`rest api`, `ci/cd`, `c++`) are matched first and removed from the text, after which spaCy reduces the remainder to the lemmas of its nouns and proper nouns.
2. Terms outside the curated vocabulary in `core/skill_weights.py` are discarded.
3. `services/matcher.py` weights each required skill by specificity — a core language is worth 3.0, an umbrella term such as "api" 1.0 — and returns the share of that weight the resume covers.

```
score = (weight of matched skills) / (weight of all required skills) x 100
```

Because the vocabulary and weights are fixed, identical inputs always produce an identical number. The response includes a `breakdown` listing every required skill, its weight, and whether it matched, so the score can be verified by hand.

A job description containing no recognised skill scores `null`, not `0`. Zero means skills were required and none matched; null means there was nothing to score, and reporting a confident 0 in that case would be inaccurate.

### Why both

The two paths fail differently, which is the point. The AI score is the readable one; the keyword score is the defensible one, and a sharp disagreement between them is itself a signal worth inspecting. Because the keyword path calls nothing external, the frontend falls back to it when Gemini is unavailable, returning a partial answer instead of an error.

---

## Project Structure

```
ATS-Resume/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py               # App entry, CORS, cache lifespan
│   │   ├── db.py                 # Engine and session dependency
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── api/analyze.py        # /api/keyword-score - deterministic scoring
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

## Tests

```bash
cd backend
pytest tests/ -v
```

---

## Troubleshooting

| Issue | Resolution |
|---|---|
| Dark mode not working | Ensure `@custom-variant dark` is present in `index.css`, required by Tailwind v4 |
| Backend cannot connect to the database | Verify `DATABASE_URL` in `.env` and that PostgreSQL is running |
| Gemini API errors | Confirm `GEMINI_API_KEY` is valid and not rate-limited |
| Redis connection error | Redis is optional; the app pings it at startup and runs uncached if it does not respond |
| Frontend build fails | Re-run `npm install` and confirm Node.js 18 or later |
| `/api/keyword-score` returns 503 | The spaCy model is missing; run `python -m spacy download en_core_web_sm` |
| `/api/analyze` returns 502 | Gemini rejected the request, usually due to an expired or revoked `GEMINI_API_KEY`. The app falls back to the keyword score |

---

## License

For educational and personal use.
````
