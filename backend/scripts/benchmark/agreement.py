"""
Do the two scorers agree?

Runs every corpus pair through both the LLM and the deterministic scorer and
reports how closely the two numbers track each other: Pearson correlation,
Spearman rank correlation, and mean absolute difference.

What the numbers do and do not mean. Neither scorer is ground truth, so this is
not accuracy — nobody here knows the "right" score for a resume. It is
agreement between two independent methods. High agreement means they are
measuring something similar despite sharing no code; the pairs where they
diverge most are the interesting ones, and are printed for that reason.

Usage (from backend/, venv active):
    python -m scripts.benchmark.agreement
    python -m scripts.benchmark.agreement --rpm 10
"""

import argparse
import json
import statistics
import time
from pathlib import Path

from scripts.benchmark.corpus import pairs

from app.services.ats_service import AnalysisError, _call_gemini
from app.services.keyword_score import score_keywords

RESULTS = Path(__file__).resolve().parents[2] / "benchmark_results"


def pearson(xs: list[float], ys: list[float]) -> float | None:
    """Linear correlation. None when a series is constant and r is undefined."""
    n = len(xs)
    if n < 2:
        return None
    mx, my = statistics.mean(xs), statistics.mean(ys)
    num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
    dx = sum((x - mx) ** 2 for x in xs) ** 0.5
    dy = sum((y - my) ** 2 for y in ys) ** 0.5
    if dx == 0 or dy == 0:
        return None
    return round(num / (dx * dy), 3)


def ranks(values: list[float]) -> list[float]:
    """Ranks with ties averaged, as Spearman requires."""
    order = sorted(range(len(values)), key=lambda i: values[i])
    out = [0.0] * len(values)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        average_rank = (i + j) / 2 + 1
        for k in range(i, j + 1):
            out[order[k]] = average_rank
        i = j + 1
    return out


def spearman(xs: list[float], ys: list[float]) -> float | None:
    """Rank correlation: does the ordering agree, ignoring the absolute values?"""
    return pearson(ranks(xs), ranks(ys))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rpm", type=float, default=10.0,
                    help="requests per minute against the model (default 10)")
    args = ap.parse_args()

    delay = 60.0 / args.rpm if args.rpm > 0 else 0.0
    rows = []
    skipped = []
    quota_hit = False

    corpus = pairs()
    for index, (name, resume, jd) in enumerate(corpus, start=1):
        deterministic = score_keywords(resume, jd)
        if deterministic["score"] is None:
            skipped.append((name, "no vocabulary skills in the job description"))
            continue

        try:
            llm = _call_gemini(resume, jd)
        except AnalysisError as exc:
            # A quota exhaustion is terminal, not a per-pair hiccup: every
            # remaining pair will fail the same way, and each attempt still
            # spends a request. Stop and report a partial run rather than
            # grinding out a correlation on whatever got through.
            if "RESOURCE_EXHAUSTED" in str(exc) or "429" in str(exc):
                print(f"\n  quota exhausted at pair {index}/{len(corpus)} "
                      f"({name}). Gemini's free tier allows 20 requests per day.")
                print("  Stopping. Re-run tomorrow, or reduce the corpus.")
                skipped.append((name, "quota exhausted"))
                quota_hit = True
                break
            skipped.append((name, f"model call failed: {str(exc)[:60]}"))
            continue

        row = {
            "pair": name,
            "llm_score": llm["ats_score"],
            "keyword_score": deterministic["score"],
            "difference": round(llm["ats_score"] - deterministic["score"], 2),
        }
        rows.append(row)
        print(f"  {name:<18} llm {row['llm_score']:>6.2f}   "
              f"keyword {row['keyword_score']:>6.2f}   diff {row['difference']:>+7.2f}")

        if index < len(corpus) and delay:
            time.sleep(delay)

    # A correlation over a handful of points is noise dressed as a result.
    # Eight is still small, but below it the number should not be produced at
    # all, let alone quoted.
    MIN_PAIRS = 8
    if len(rows) < MIN_PAIRS:
        print(f"\n  Only {len(rows)} of {len(corpus)} pairs scored"
              + (" (daily quota exhausted)." if quota_hit else ".")
              + f" A correlation needs at least {MIN_PAIRS} to mean anything,")
        print("  so none is reported. The per-pair scores above are still valid.")
        RESULTS.mkdir(exist_ok=True)
        (RESULTS / "agreement.json").write_text(json.dumps(
            {"status": "incomplete", "pairs_scored": len(rows),
             "quota_exhausted": quota_hit, "rows": rows,
             "note": "too few pairs to correlate; do not quote a correlation"},
            indent=2), encoding="utf-8")
        raise SystemExit(1)

    llm_scores = [r["llm_score"] for r in rows]
    kw_scores = [r["keyword_score"] for r in rows]
    diffs = [abs(r["difference"]) for r in rows]

    results = {
        "pairs_scored": len(rows),
        "pairs_skipped": skipped,
        "pearson_r": pearson(llm_scores, kw_scores),
        "spearman_rho": spearman(llm_scores, kw_scores),
        "mean_absolute_difference": round(statistics.mean(diffs), 2),
        "median_absolute_difference": round(statistics.median(diffs), 2),
        "max_absolute_difference": round(max(diffs), 2),
        "llm_mean": round(statistics.mean(llm_scores), 2),
        "keyword_mean": round(statistics.mean(kw_scores), 2),
        "rows": rows,
    }

    widest = sorted(rows, key=lambda r: abs(r["difference"]), reverse=True)[:3]

    print("\n" + "=" * 62)
    print(f"pairs scored              : {results['pairs_scored']}"
          + (f"  ({len(skipped)} skipped)" if skipped else ""))
    print(f"Pearson r                 : {results['pearson_r']}")
    print(f"Spearman rho              : {results['spearman_rho']}")
    print(f"mean absolute difference  : {results['mean_absolute_difference']} points")
    print(f"largest disagreement      : {results['max_absolute_difference']} points")
    print("\nwidest disagreements (worth explaining, not hiding):")
    for r in widest:
        print(f"  {r['pair']:<18} llm {r['llm_score']:>6.2f} vs "
              f"keyword {r['keyword_score']:>6.2f}  ({r['difference']:+.2f})")
    print("=" * 62)

    RESULTS.mkdir(exist_ok=True)
    out = RESULTS / "agreement.json"
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nwritten to {out}")


if __name__ == "__main__":
    main()
