"""
How long does each scoring path take, and what does the cache buy?

Measures three things against a running server:

  1. /api/keyword-score  - the deterministic path, no external call
  2. /api/analyze (cold) - a cache miss, so a real Gemini round trip
  3. /api/analyze (warm) - the same input again, served from Redis if enabled

(3) is the measurement behind any claim about repeat analyses being faster.
If Redis is not running the warm figure will match the cold one, and the script
says so rather than quietly reporting a meaningless number.

Usage (server must already be running):
    python -m scripts.benchmark.latency
    python -m scripts.benchmark.latency --base http://127.0.0.1:8000 --repeats 5
"""

import argparse
import json
import statistics
import time
from pathlib import Path

import httpx

from scripts.benchmark.corpus import pairs
from scripts.benchmark.pdf import make_pdf

RESULTS = Path(__file__).resolve().parents[2] / "benchmark_results"


def percentile(values: list[float], p: float) -> float:
    """Nearest-rank percentile. Adequate for the sample sizes here."""
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round(p / 100 * len(ordered) + 0.5) - 1))
    return ordered[index]


def summarise(name: str, timings: list[float]) -> dict:
    return {
        "endpoint": name,
        "samples": len(timings),
        "mean_ms": round(statistics.mean(timings) * 1000, 1),
        "p50_ms": round(percentile(timings, 50) * 1000, 1),
        "p95_ms": round(percentile(timings, 95) * 1000, 1),
        "min_ms": round(min(timings) * 1000, 1),
        "max_ms": round(max(timings) * 1000, 1),
    }


def time_post(client: httpx.Client, base: str, path: str, pdf: bytes, jd: str) -> float:
    started = time.perf_counter()
    r = client.post(
        base + path,
        files={"resume": ("resume.pdf", pdf, "application/pdf")},
        data={"job_desc": jd},
        timeout=180,
    )
    elapsed = time.perf_counter() - started
    r.raise_for_status()
    return elapsed


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base", default="http://127.0.0.1:8000")
    ap.add_argument("--repeats", type=int, default=5,
                    help="samples per measurement (default 5)")
    ap.add_argument("--pair", default="backend-partial")
    args = ap.parse_args()

    corpus = {name: (resume, jd) for name, resume, jd in pairs()}
    resume_text, jd = corpus[args.pair]
    pdf = make_pdf(resume_text.split(". "))

    with httpx.Client() as client:
        try:
            client.get(args.base + "/", timeout=5)
        except Exception:
            raise SystemExit(f"no server at {args.base} - start uvicorn first")

        print(f"deterministic path, {args.repeats} samples")
        keyword = [time_post(client, args.base, "/api/keyword-score", pdf, jd)
                   for _ in range(args.repeats)]

        # A unique job description per sample guarantees a cache miss, so these
        # are all genuine model round trips rather than one call and N replays.
        print(f"AI path (cold, unique input each time), {args.repeats} samples")
        cold = [time_post(client, args.base, "/api/analyze", pdf,
                          f"{jd} Reference {i}.")
                for i in range(args.repeats)]

        # Identical input repeated: the second and later calls hit the cache if
        # Redis is up. The first is dropped as it is the miss that populates it.
        print(f"AI path (warm, identical input), {args.repeats + 1} samples")
        warm_jd = f"{jd} Cache probe."
        time_post(client, args.base, "/api/analyze", pdf, warm_jd)
        warm = [time_post(client, args.base, "/api/analyze", pdf, warm_jd)
                for _ in range(args.repeats)]

    results = {
        "keyword_score": summarise("/api/keyword-score", keyword),
        "analyze_cold": summarise("/api/analyze (cache miss)", cold),
        "analyze_warm": summarise("/api/analyze (cache hit)", warm),
    }

    cold_p50 = results["analyze_cold"]["p50_ms"]
    warm_p50 = results["analyze_warm"]["p50_ms"]
    kw_p50 = results["keyword_score"]["p50_ms"]

    cache_active = warm_p50 < cold_p50 * 0.5
    results["cache_detected"] = cache_active
    if cache_active:
        results["cache_speedup_x"] = round(cold_p50 / warm_p50, 1)
        results["cache_reduction_pct"] = round((1 - warm_p50 / cold_p50) * 100, 1)
    results["keyword_vs_ai_speedup_x"] = round(cold_p50 / kw_p50, 1)

    print("\n" + "=" * 62)
    for key in ("keyword_score", "analyze_cold", "analyze_warm"):
        r = results[key]
        print(f"{r['endpoint']:<32} p50 {r['p50_ms']:>9.1f} ms   p95 {r['p95_ms']:>9.1f} ms")
    print("-" * 62)
    print(f"keyword path is {results['keyword_vs_ai_speedup_x']}x faster than the AI path")
    if cache_active:
        print(f"cache: repeat analyses {results['cache_speedup_x']}x faster "
              f"({results['cache_reduction_pct']}% less latency)")
    else:
        print("cache: NOT active - warm and cold are the same, so Redis is not "
              "running. Start it and re-run before quoting a cache figure.")
    print("=" * 62)

    RESULTS.mkdir(exist_ok=True)
    out = RESULTS / "latency.json"
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nwritten to {out}")


if __name__ == "__main__":
    main()
