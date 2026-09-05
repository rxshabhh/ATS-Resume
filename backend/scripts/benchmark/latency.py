"""
How long does each scoring path take, and what does the cache buy?

Measures three things against a running server:

  1. /api/keyword-score  - the deterministic path, no external call, no quota
                           (one warm-up request is discarded before timing)
  2. /api/analyze (cold) - a cache miss, so a real Gemini round trip
  3. /api/analyze (warm) - the same input again, served from Redis if enabled

(3) is the measurement behind any claim about repeat analyses being faster.
If Redis is not running the warm figure will match the cold one, and the script
says so rather than quietly reporting a meaningless number.

QUOTA. The AI measurements cost exactly `--ai-samples` Gemini requests. The
warm test re-uses a cold request's input, so it adds nothing. The free tier
allows 20 per day, so the default of 3 leaves ample room for agreement.py's 12
on the same day.

Any AI measurement that fails is reported as unavailable rather than aborting
the run: the deterministic numbers cost nothing and are worth keeping.

Usage (server must already be running, venv active):
    python -m scripts.benchmark.latency
    python -m scripts.benchmark.latency --repeats 5 --ai-samples 3
"""

import argparse
import json
import statistics
import time
import uuid
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


class Unavailable(Exception):
    """The endpoint could not be measured — quota, outage, misconfiguration."""


def time_post(client: httpx.Client, base: str, path: str, pdf: bytes, jd: str) -> float:
    """Time one request. Raises Unavailable on a server-side failure."""
    started = time.perf_counter()
    r = client.post(
        base + path,
        files={"resume": ("resume.pdf", pdf, "application/pdf")},
        data={"job_desc": jd},
        timeout=180,
    )
    elapsed = time.perf_counter() - started

    if r.status_code >= 500:
        detail = ""
        try:
            detail = r.json().get("detail", "")
        except Exception:
            detail = r.text[:120]
        raise Unavailable(f"{r.status_code} from {path}: {detail}")
    r.raise_for_status()
    return elapsed


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base", default="http://127.0.0.1:8000")
    ap.add_argument("--repeats", type=int, default=5,
                    help="samples for the free deterministic path (default 5)")
    ap.add_argument("--ai-samples", type=int, default=3,
                    help="cache-miss samples of the AI path; costs this many "
                         "Gemini requests, plus one to seed the warm test "
                         "(default 3)")
    ap.add_argument("--pair", default="backend-partial")
    args = ap.parse_args()

    corpus = {name: (resume, jd) for name, resume, jd in pairs()}
    resume_text, jd = corpus[args.pair]
    pdf = make_pdf(resume_text.split(". "))

    results: dict = {}
    notes: list[str] = []

    with httpx.Client() as client:
        try:
            client.get(args.base + "/", timeout=5)
        except Exception:
            raise SystemExit(f"no server at {args.base} - start uvicorn first")

        # --- 1. deterministic path: free, so always measured -----------------
        print(f"deterministic path, {args.repeats} samples")
        try:
            # One untimed warm-up. The first request through this path pays for
            # spaCy's pipeline initialising inside the worker; including it
            # would put a one-off startup cost into a steady-state percentile.
            # What we want to report is what a user's second request onward
            # costs, which is what the endpoint does in normal operation.
            time_post(client, args.base, "/api/keyword-score", pdf, jd)
            keyword = [time_post(client, args.base, "/api/keyword-score", pdf, jd)
                       for _ in range(args.repeats)]
            results["keyword_score"] = summarise("/api/keyword-score", keyword)
        except Unavailable as exc:
            notes.append(f"keyword path unavailable: {exc}")
            print(f"  unavailable: {exc}")

        # --- 2. AI path, cache miss ------------------------------------------
        # A unique job description per sample guarantees a miss, so these are
        # genuine model round trips rather than one call and N replays.
        print(f"AI path (cold, unique input each time), {args.ai_samples} samples"
              f"  [{args.ai_samples} Gemini requests]")
        cold: list[float] = []
        last_cold_jd: str | None = None
        # A token unique to this run. Without it the probe strings are the same
        # on every run, so the second run of the day finds them already in the
        # cache and times cache hits while calling them misses -- which is
        # exactly what happened: a "cache miss" measured at 90ms against a real
        # Gemini round trip of ~10s. The cache TTL is 24h, so fixed probes are
        # only ever honest once.
        run_token = uuid.uuid4().hex[:12]
        try:
            for i in range(args.ai_samples):
                probe_jd = f"{jd} Reference {run_token}-{i}."
                cold.append(time_post(client, args.base, "/api/analyze", pdf, probe_jd))
                last_cold_jd = probe_jd
        except Unavailable as exc:
            notes.append(f"AI path unavailable: {exc}")
            print(f"  unavailable: {exc}")

        if cold:
            results["analyze_cold"] = summarise("/api/analyze (cache miss)", cold)
            # A genuine model round trip is seconds. Anything an order of
            # magnitude faster was served from somewhere else, and comparing it
            # against the warm figure would report a meaningless speedup.
            if results["analyze_cold"]["p50_ms"] < 1000:
                notes.append(
                    f"cold p50 is {results['analyze_cold']['p50_ms']:.0f}ms, far below "
                    "a real model round trip - these requests did not reach Gemini, "
                    "so the cache comparison is not valid")
                results["analyze_cold"]["suspect"] = True

        # --- 3. AI path, cache hit -------------------------------------------
        # Re-uses the last cold request's job description, which already
        # populated the cache. Seeding with a fresh one instead cost an extra
        # Gemini request and added a failure point: a run could measure the
        # cold path successfully and still lose the cache figure because that
        # one extra call hit the quota. With the cache working these repeats
        # never reach Gemini at all, so this measurement is now free.
        #
        # If they DO reach Gemini the timings will look like the cold path,
        # which is exactly the signal that the cache is not working.
        warm: list[float] = []
        if cold and last_cold_jd:
            print(f"AI path (warm, identical input), {args.repeats} samples"
                  f"  [0 Gemini requests if the cache is working]")
            try:
                warm = [time_post(client, args.base, "/api/analyze", pdf, last_cold_jd)
                        for _ in range(args.repeats)]
                results["analyze_warm"] = summarise("/api/analyze (cache hit)", warm)
            except Unavailable as exc:
                notes.append(f"warm-cache measurement unavailable: {exc}")
                print(f"  unavailable: {exc}")
        else:
            notes.append("warm-cache measurement skipped: the AI path is "
                         "unavailable, so there is nothing to cache")
            print("AI path (warm): skipped, cold path unavailable")

    # --- derived figures ------------------------------------------------------
    kw = results.get("keyword_score")
    cold_s = results.get("analyze_cold")
    warm_s = results.get("analyze_warm")

    if cold_s and warm_s and not cold_s.get("suspect"):
        cache_active = warm_s["p50_ms"] < cold_s["p50_ms"] * 0.5
        results["cache_detected"] = cache_active
        if cache_active:
            results["cache_speedup_x"] = round(cold_s["p50_ms"] / warm_s["p50_ms"], 1)
            results["cache_reduction_pct"] = round(
                (1 - warm_s["p50_ms"] / cold_s["p50_ms"]) * 100, 1)

    if kw and cold_s and not cold_s.get("suspect"):
        results["keyword_vs_ai_speedup_x"] = round(cold_s["p50_ms"] / kw["p50_ms"], 1)

    results["notes"] = notes

    # --- report ---------------------------------------------------------------
    print("\n" + "=" * 66)
    for key in ("keyword_score", "analyze_cold", "analyze_warm"):
        r = results.get(key)
        if r:
            print(f"{r['endpoint']:<32} p50 {r['p50_ms']:>9.1f} ms   "
                  f"p95 {r['p95_ms']:>9.1f} ms   n={r['samples']}")
    print("-" * 66)

    if "keyword_vs_ai_speedup_x" in results:
        print(f"keyword path is {results['keyword_vs_ai_speedup_x']}x faster "
              f"than the AI path")
    if results.get("cache_detected"):
        print(f"cache: repeat analyses {results['cache_speedup_x']}x faster "
              f"({results['cache_reduction_pct']}% less latency)")
    elif cold_s and warm_s:
        print("cache: NOT active - warm and cold are the same, so Redis is not "
              "running. Start it and re-run before quoting a cache figure.")

    for note in notes:
        print(f"note: {note}")
    if notes:
        print("\nPartial run. The measurements above are still valid; the "
              "missing ones are missing, not zero.")
    print("=" * 66)

    RESULTS.mkdir(exist_ok=True)
    out = RESULTS / "latency.json"
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nwritten to {out}")


if __name__ == "__main__":
    main()
