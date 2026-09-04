"""Behaviour of the deterministic scorer."""

import pytest

from app.services.matcher import match_keywords
from app.services.nlp import ModelUnavailable, extract_keywords
from app.services.keyword_score import score_keywords
from app.utils.phrase_matcher import extract_phrases

JD = ("Backend engineer wanted. Required: Python, FastAPI, Docker, Kubernetes, "
      "PostgreSQL, REST APIs and CI/CD.")
RESUME = "Built REST APIs in Python with FastAPI and PostgreSQL, deployed with Docker."


# --- the weighting math, independent of spaCy ------------------------------

def test_full_match_scores_100():
    result = match_keywords({"python", "docker"}, {"python", "docker", "git"})
    assert result.score == 100.0
    assert result.missing == set()


def test_no_match_scores_zero():
    result = match_keywords({"python", "docker"}, {"git"})
    assert result.score == 0.0
    assert result.missing == {"python", "docker"}


def test_empty_job_description_scores_none_not_zero():
    """None means 'nothing to score'; 0.0 means 'matched none of what was asked'."""
    result = match_keywords(set(), {"python"})
    assert result.score is None


def test_weighting_favours_the_heavier_skill():
    """python (3.0) is worth more than api (1.0), so matching it must score higher."""
    heavy = match_keywords({"python", "api"}, {"python"}).score
    light = match_keywords({"python", "api"}, {"api"}).score
    assert heavy > light
    assert heavy == pytest.approx(75.0)   # 3.0 / 4.0
    assert light == pytest.approx(25.0)   # 1.0 / 4.0


def test_breakdown_accounts_for_every_required_skill():
    result = match_keywords({"python", "docker", "api"}, {"python"})
    assert {row["skill"] for row in result.breakdown} == {"python", "docker", "api"}
    assert sum(row["weight"] for row in result.breakdown) == result.total_weight
    assert [row["weight"] for row in result.breakdown] == sorted(
        (row["weight"] for row in result.breakdown), reverse=True
    )


# --- phrase matching, independent of spaCy ---------------------------------

def test_punctuated_skills_are_found():
    """These can only come from the phrase table; the token path drops non-alpha."""
    found, _ = extract_phrases("Strong in C++ and CI/CD pipelines.")
    assert "c++" in found
    assert "ci/cd" in found


def test_phrase_is_removed_so_its_parts_are_not_recounted():
    found, remaining = extract_phrases("machine learning")
    assert found == {"machine learning"}
    assert "machine" not in remaining and "learning" not in remaining


def test_aliases_fold_onto_the_canonical_name():
    found, _ = extract_phrases("We use k8s, postgres and amazon web services.")
    assert found == {"kubernetes", "postgresql", "aws"}


def test_phrase_does_not_match_inside_a_longer_word():
    found, _ = extract_phrases("dockerfile awsome")
    assert found == set()


# --- end to end (needs the spaCy model) ------------------------------------

def _requires_model():
    try:
        extract_keywords("python")
    except ModelUnavailable as exc:
        pytest.skip(str(exc))


def test_score_is_deterministic():
    _requires_model()
    assert score_keywords(RESUME, JD) == score_keywords(RESUME, JD)


def test_score_matches_hand_computed_weights():
    """The whole point of this path: the number can be checked by hand."""
    _requires_model()
    result = score_keywords(RESUME, JD)
    assert result["matched_keywords"] == ["docker", "fastapi", "postgresql", "python", "rest api"]
    # "Backend engineer wanted" — spaCy reads this "backend" as a noun, so the
    # scorer counts it among the requirements. That is the intended behaviour.
    assert result["missing_keywords"] == ["backend", "ci/cd", "kubernetes"]
    # 3.0 fastapi + 3.0 python + 2.5 docker + 2.5 postgresql + 2.0 rest api
    assert result["matched_weight"] == pytest.approx(13.0)
    # ...plus 2.5 kubernetes, 2.0 ci/cd and 1.5 backend, which it does not have
    assert result["total_weight"] == pytest.approx(19.0)
    assert result["score"] == pytest.approx(round(13.0 / 19.0 * 100, 2))


def test_unreadable_job_description_scores_none():
    _requires_model()
    assert score_keywords(RESUME, "A motivated team player who thrives.")["score"] is None
