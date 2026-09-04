"""Weighted overlap between the skills a job asks for and the ones a resume shows."""

from dataclasses import dataclass, field

from app.core.skill_weights import weight_of


@dataclass
class MatchResult:
    """
    The outcome of one comparison, including the arithmetic behind it.

    `score` is None when the job description contained no recognised skill.
    That case is not a zero: zero means "asked for skills, matched none of
    them", whereas None means "there was nothing here to score". Collapsing the
    two would report a confident 0 for a job description the scorer simply
    could not read.
    """

    matched: set[str]
    missing: set[str]
    matched_weight: float
    total_weight: float
    score: float | None
    breakdown: list[dict] = field(default_factory=list)


def match_keywords(jd_skills: set[str], resume_skills: set[str]) -> MatchResult:
    """
    Score the resume against the job description.

    Each skill the job asks for contributes its weight to the denominator, and
    contributes it again to the numerator if the resume shows it. The result is
    the share of the job's *weighted* requirements that the resume covers, so
    missing one core skill costs more than missing three generic ones.
    """
    matched = jd_skills & resume_skills
    missing = jd_skills - resume_skills

    total_weight = sum(weight_of(s) for s in jd_skills)
    matched_weight = sum(weight_of(s) for s in matched)

    score = round(matched_weight / total_weight * 100, 2) if total_weight else None

    # Sorted heaviest-first: the top of this list is what the candidate should
    # fix first, and it is also the audit trail for how the score was reached.
    breakdown = sorted(
        (
            {"skill": s, "weight": weight_of(s), "matched": s in matched}
            for s in jd_skills
        ),
        key=lambda row: (-row["weight"], row["skill"]),
    )

    return MatchResult(
        matched=matched,
        missing=missing,
        matched_weight=round(matched_weight, 2),
        total_weight=round(total_weight, 2),
        score=score,
        breakdown=breakdown,
    )
