# Benchmarks

Four measurements of the two scoring paths. Every number quoted anywhere about
this project should come from here, and every one of them should survive the
question "how did you measure that?".

Run all of these from `backend/` with the venv active.

---

## Budget your API quota first

Gemini's free tier allows **20 `gemini-2.5-flash` requests per day**. The two
model-driven scripts together want more than that:

| Script | Requests |
|---|---|
| `variance.py --runs 15` | 15 |
| `agreement.py` (12 pairs) | 12 |
| `latency.py --ai-samples 3` | 3 |

`latency.py` + `agreement.py` is 15, which fits in a day. Adding `variance.py`
does not — run that one on its own day.

Failed calls still cost quota. A transient failure is now retried with backoff
up to `MAX_ATTEMPTS` (3), so one failing request can spend three; a terminal
failure such as an invalid key costs exactly one, because it is not retried.

`agreement.py` stops at the first 429 rather than spending requests on pairs
that cannot succeed, and refuses to report a correlation below 8 pairs.

**The daily quota resets on Google's clock, not at your local midnight.** If a
run dies on a 429, the fix is to wait, not to re-run immediately.

---

## What each script measures

| Script | Question it answers | Needs |
|---|---|---|
| `variance.py` | Does the LLM return the same score twice on identical input? | Gemini API |
| `agreement.py` | Do the LLM and the deterministic scorer agree? | Gemini API |
| `latency.py` | How fast is each path, and what does the cache buy? | running server, **Redis running**, `--ai-samples` requests |

Results are written as JSON to `backend/benchmark_results/`.

---

## 1. LLM score variance

```bash
python -m scripts.benchmark.variance --runs 15 --rpm 12
```

Sends one identical resume/JD pair to Gemini N times and reports the spread.
Nothing in the app pins temperature or a seed, so this measures the
reproducibility the product actually has.

It calls `_call_gemini` directly rather than `analyze_resume`, deliberately:
the cache is keyed on the inputs, so going through the cached path would return
the first score forever and the measured spread would be an artefact.

**The honest framing:** this is the evidence for why a deterministic scorer
exists at all. Not "LLMs are unreliable" in the abstract — a number, from this
application, on this model.

## 2. Agreement between the two scorers

```bash
python -m scripts.benchmark.agreement --rpm 12
```

Scores all 12 corpus pairs both ways and reports Pearson r, Spearman rho, and
mean absolute difference.

**This is not accuracy.** Neither scorer is ground truth; nobody here knows the
correct score for a resume. It measures whether two methods that share no code
track each other. If asked, say exactly that — claiming accuracy without ground
truth is the fastest way to lose an interviewer's trust.

The pairs with the widest disagreement are printed. Those are the interesting
result, not the correlation: they show where a keyword count and a language
model see a resume differently.

## 3. Latency and cache benefit

Needs a running server:

```bash
uvicorn app.main:app          # in another terminal
python -m scripts.benchmark.latency --repeats 5
```

Measures the deterministic endpoint, the AI endpoint on a cache miss, and the
AI endpoint on a repeat of identical input.

**For the cache figure you must have Redis running**, or warm and cold will be
identical and the script will tell you so instead of printing a fake speedup:

```bash
docker run -d -p 6379:6379 --name ats-redis redis:7-alpine
```

Then restart the backend — the Redis probe runs once at startup, so a server
started before Redis will stay in no-cache mode. You should see
`Redis cache enabled` in the log rather than `Redis unavailable`.

---

## The corpus

`corpus.py` holds 12 hand-written resume/JD pairs spanning full overlap to
none. They are **synthetic**. Any figure derived from them must be reported as
measured on synthetic data — they were written to exercise the vocabulary, not
sampled from real applications, so they say nothing about how the scorer
behaves on resumes in the wild.

Using real resumes would be better and is also other people's personal data,
which is why these exist instead.

---

## Reporting these numbers

Three rules, in order of how badly breaking them hurts:

1. **Never quote a number you did not run.** Re-run after any change to the
   scoring vocabulary, the prompt, or the model.
2. **Say what the sample was.** "12 synthetic pairs" and "15 runs" are part of
   the result, not fine print.
3. **Keep the caveat attached.** Agreement is not accuracy. Synthetic is not
   real. A number offered with its limitation is far more convincing than one
   offered without.
