"""
Retry behaviour of the Gemini call.

These matter because the behaviour is otherwise only observable during a real
outage. Each test corresponds to a failure actually seen in the logs:
a 503 "high demand" that the old code retried 1.3s later and lost, and a
400 API_KEY_INVALID that it retried pointlessly.

No network: the client is replaced with a stub that raises on demand.
"""

import pytest

from app.services import ats_service
from app.services.ats_service import AnalysisError, _call_gemini, _is_retryable


# --- classification --------------------------------------------------------

@pytest.mark.parametrize("message", [
    "503 UNAVAILABLE. This model is currently experiencing high demand.",
    "429 RESOURCE_EXHAUSTED. Quota exceeded for metric ...",
    "500 INTERNAL. Internal error encountered.",
    "504 DEADLINE_EXCEEDED",
    "Connection reset by peer",
])
def test_transient_failures_are_retryable(message):
    assert _is_retryable(Exception(message)) is True


@pytest.mark.parametrize("message", [
    "400 INVALID_ARGUMENT. API key not valid. API_KEY_INVALID",
    "403 PERMISSION_DENIED",
    "401 UNAUTHENTICATED",
])
def test_permanent_failures_are_not_retryable(message):
    assert _is_retryable(Exception(message)) is False


def test_terminal_marker_wins_over_retryable_one():
    """A 400 carrying API_KEY_INVALID must not be read as a retryable 4xx."""
    exc = Exception("400 INVALID_ARGUMENT API_KEY_INVALID (request id 429000)")
    assert _is_retryable(exc) is False


# --- retry loop ------------------------------------------------------------

class _StubClient:
    """Stands in for genai.Client, counting calls and raising to order."""

    def __init__(self, error: Exception | None, succeed_on: int | None = None):
        self.calls = 0
        self.error = error
        self.succeed_on = succeed_on
        self.models = self

    def generate_content(self, model, contents):
        self.calls += 1
        if self.succeed_on is not None and self.calls >= self.succeed_on:
            class _Response:
                text = '{"ats_score": 42, "feedback": "ok", "missing_keywords": []}'
            return _Response()
        raise self.error


@pytest.fixture
def no_sleep(monkeypatch):
    """Collapse the backoff so the tests do not actually wait."""
    slept = []
    monkeypatch.setattr(ats_service.time, "sleep", lambda s: slept.append(s))
    return slept


def _install(monkeypatch, client):
    monkeypatch.setattr(ats_service, "get_client", lambda: client)


def test_terminal_error_is_not_retried(monkeypatch, no_sleep):
    client = _StubClient(Exception("400 INVALID_ARGUMENT API_KEY_INVALID"))
    _install(monkeypatch, client)

    with pytest.raises(AnalysisError, match="not retryable"):
        _call_gemini("resume", "jd")

    assert client.calls == 1, "an invalid key must not spend a second request"
    assert no_sleep == [], "no backoff should be paid for a terminal failure"


def test_transient_error_exhausts_attempts(monkeypatch, no_sleep):
    client = _StubClient(Exception("503 UNAVAILABLE high demand"))
    _install(monkeypatch, client)

    with pytest.raises(AnalysisError, match="after 3 attempts"):
        _call_gemini("resume", "jd")

    assert client.calls == ats_service.MAX_ATTEMPTS
    assert len(no_sleep) == ats_service.MAX_ATTEMPTS - 1, "one backoff between attempts"


def test_backoff_grows_between_attempts(monkeypatch, no_sleep):
    """Full jitter draws from [0, base * 2^n); the ceiling must double."""
    drawn = []
    monkeypatch.setattr(ats_service.random, "uniform",
                        lambda lo, hi: drawn.append(hi) or hi)
    client = _StubClient(Exception("503 UNAVAILABLE"))
    _install(monkeypatch, client)

    with pytest.raises(AnalysisError):
        _call_gemini("resume", "jd")

    assert drawn == [ats_service.RETRY_BASE_SECONDS,
                     ats_service.RETRY_BASE_SECONDS * 2]


def test_recovers_when_a_later_attempt_succeeds(monkeypatch, no_sleep):
    """The 503 that lost the benchmark run should now be survivable."""
    client = _StubClient(Exception("503 UNAVAILABLE high demand"), succeed_on=2)
    _install(monkeypatch, client)

    result = _call_gemini("resume", "jd")

    assert result["ats_score"] == 42.0
    assert client.calls == 2


def test_score_is_clamped_into_range(monkeypatch, no_sleep):
    class _Wild(_StubClient):
        def generate_content(self, model, contents):
            class _Response:
                text = '{"ats_score": 1200, "feedback": "", "missing_keywords": []}'
            return _Response()

    _install(monkeypatch, _Wild(None))
    assert _call_gemini("resume", "jd")["ats_score"] == 100.0
