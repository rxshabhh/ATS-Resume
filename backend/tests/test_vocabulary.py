"""
Guards on the scoring vocabulary.

Each of these encodes a way the tables previously fell out of step. A skill
that is named inconsistently across them is not a loud failure — it silently
scores at the default weight, or never matches at all.
"""

from app.core.phrases import PHRASES
from app.core.skill_vocab import VALID_SKILLS
from app.core.skill_weights import SKILL_WEIGHTS
from app.utils.normalizer import NORMALIZE_MAP


def test_every_vocabulary_skill_has_an_explicit_weight():
    assert set(VALID_SKILLS) == set(SKILL_WEIGHTS)


def test_every_phrase_maps_to_a_vocabulary_skill():
    assert set(PHRASES) <= set(VALID_SKILLS), set(PHRASES) - set(VALID_SKILLS)


def test_normalizer_targets_are_vocabulary_skills():
    assert set(NORMALIZE_MAP.values()) <= set(VALID_SKILLS)


def test_no_phrase_is_its_own_alias_of_another_skill():
    """A surface form must denote exactly one skill, or matching is order-dependent."""
    seen: dict[str, str] = {}
    for skill, forms in PHRASES.items():
        for form in forms:
            assert form not in seen, f"{form!r} claimed by {seen.get(form)} and {skill}"
            seen[form] = skill


def test_weights_are_positive():
    assert all(w > 0 for w in SKILL_WEIGHTS.values())
