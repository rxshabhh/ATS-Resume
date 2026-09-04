"""
Does the LLM give the same score twice?

Sends one identical resume / job-description pair to Gemini N times and reports
the spread of the scores it returns. Nothing in the application pins the
model's temperature or seed, so this measures the reproducibility the product
actually has, not the reproducibility it could have with different settings.

The deterministic scorer is run once alongside, as the contrast: its spread is
zero by construction.

Usage (from backend/, venv active):
    python -m scripts.benchmark.variance
    python -m scripts.benchmark.variance --runs 20 --rpm 10

The cache is bypassed: it is keyed on the inputs, so a warm cache would return
the first score forever and the measured spread would be a fiction.
"""

import argparse
import asyncio
import json
import statistics
import time
from pathlib import Path

from scripts.benchmark.corpus import pairs

# _call_gemini is the uncached, synchronous path — exactly what a cache miss
# runs. Calling analyze_resume() instead would consult Redis and defeat this.
from app.services.ats_service import AnalysisError, _call_gemini
from app.services.keyword_score import score_keywords

RESULTS = Path(__file__).resolve().parents[2] / "benchmark_results"


def measure(resume: str, jd: str, runs: int, rpm: float) -> dict:
    """Call Gemini `runs` times on identical input, collecting every score."""
    delay = 60.0 / rpm if rpm > 0 else 0.0
    scores: list[float] = []
    failures = 0
    latencies: list[float] = []

    for i in range(1, runs + 1):
        started = time.perf_counter()
        try:
            result = _call_gemini(resume, jd)
            elapsed = time.perf_counter() - started
            scores.append(result["ats_score"])
            latencies.append(elapsed)
            print(f"  run {i:>2}/{runs}: {result['ats_score']:>6.2f}  ({elapsed:.1f}s)")
        except AnalysisError as exc:
            failures += 1
            print(f"  run {i:>2}/{runs}: FAILED - {str(exc)[:80]}")

        if i < runs and delay:
            time.sleep(delay)

    if len(scores) < 2:
        return {"error": "not enough successful runs to measure spread",
                "successes": len(scores), "failures": failures}

    return {
        "runs_requested": runs,
        "runs_succeeded": len(scores),
        "runs_failed": failures,
        "scores": scores,
        "distinct_scores": sorted(set(scores)),
        "min": min(scores),
        "max": max(scores),
        "range": round(max(scores) - min(scores), 2),
        "mean": round(statistics.mean(scores), 2),
        "median": round(statistics.median(scores), 2),
        "stdev": round(statistics.stdev(scores), 2),
        # The number to quote: half the range, i.e. "the score moves by +/- this
        # much on input that never changed".
        "plus_minus": round((max(scores) - min(scores)) / 2, 2),
        "latency_mean_s": round(statistics.mean(latencies), 2),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--runs", type=int, default=15,
                    help="how many times to call the model (default 15)")
    ap.add_argument("--rpm", type=float, default=10.0,
                    help="requests per minute, to stay under the free-tier rate "
                         "limit (default 10; use 0 for no throttle)")
    ap.add_argument("--pair", default="backend-partial",
                    help="corpus pair to use (default backend-partial, chosen "
                         "because a mid-range score has room to move in both "
                         "directions)")
    args = ap.parse_args()

    corpus = {name: (resume, jd) for name, resume, jd in pairs()}
    if args.pair not in corpus:
        raise SystemExit(f"unknown pair {args.pair!r}; have: {', '.join(corpus)}")
    resume, jd = corpus[args.pair]

    print(f"LLM score variance on identical input")
    print(f"pair: {args.pair}   runs: {args.runs}   throttle: {args.rpm}/min\n")

    llm = measure(resume, jd, args.runs, args.rpm)

    deterministic = score_keywords(resume, jd)

    print("\n" + "=" * 62)
    if "error" in llm:
        print("LLM: " + llm["error"])
    else:
        print(f"LLM score        : {llm['min']} - {llm['max']}   "
              f"(mean {llm['mean']}, sd {llm['stdev']})")
        print(f"                   {len(llm['distinct_scores'])} distinct values "
              f"in {llm['runs_succeeded']} runs: {llm['distinct_scores']}")
        print(f"                   varies by +/- {llm['plus_minus']} points on "
              f"input that never changed")
    print(f"Keyword score    : {deterministic['score']} on every run, by construction")
    print("=" * 62)

    RESULTS.mkdir(exist_ok=True)
    out = RESULTS / "variance.json"
    out.write_text(json.dumps(
        {"pair": args.pair, "llm": llm,
         "deterministic_score": deterministic["score"]},
        indent=2), encoding="utf-8")
    print(f"\nwritten to {out}")


if __name__ == "__main__":
    main()
