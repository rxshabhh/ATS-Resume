"""
The scoring vocabulary: every skill the deterministic scorer can recognise,
paired with how much a match is worth.

This dict is the single source of truth. `skill_vocab.VALID_SKILLS` is derived
from its keys, so it is structurally impossible for a weighted skill to sit
outside the vocabulary or for a vocabulary entry to be silently unweighted.
That coupling is deliberate: the two tables previously drifted apart, and every
skill whose key did not match ("ci"/"cd" against a vocabulary spelling of
"ci/cd", "microservice" against "microservices") fell through to the default
weight, so the weighting was mostly inert.

Weights are relative, not absolute — only their ratios affect the score, since
the result is normalised by the total weight of the job description's skills.
The tiers encode one claim: a skill that is expensive to acquire and specific
to the role should move the score more than a term that appears in every
posting.
"""

# Tier 3.0 — core languages and frameworks a role is built on.
_CORE = ["python", "java", "c++", "fastapi", "django"]

# Tier 2.5 — infrastructure and data stores you need to actually ship.
_INFRA = ["docker", "kubernetes", "aws", "postgresql", "mysql", "sql", "redis"]

# Tier 2.0 — architectural and process competencies.
_PRACTICE = [
    "rest api", "microservices", "system design", "ci/cd",
    "machine learning", "deep learning",
]

# Tier 1.5 — supporting tools and broad domains.
_SUPPORTING = ["linux", "git", "backend", "data science", "cloud computing"]

# Tier 1.0 — umbrella terms that appear in nearly every posting and therefore
# carry little discriminating signal.
_GENERIC = ["api", "data"]

SKILL_WEIGHTS: dict[str, float] = {
    **{s: 3.0 for s in _CORE},
    **{s: 2.5 for s in _INFRA},
    **{s: 2.0 for s in _PRACTICE},
    **{s: 1.5 for s in _SUPPORTING},
    **{s: 1.0 for s in _GENERIC},
}

# Applied to a skill that is in the vocabulary but has no explicit weight.
# Given the derivation above this is currently unreachable; it exists so a
# future vocabulary entry cannot produce a KeyError at request time.
DEFAULT_WEIGHT = 1.0


def weight_of(skill: str) -> float:
    """Weight for a skill, falling back to DEFAULT_WEIGHT."""
    return SKILL_WEIGHTS.get(skill, DEFAULT_WEIGHT)
