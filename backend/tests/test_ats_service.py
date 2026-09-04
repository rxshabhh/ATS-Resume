import pytest

from app.services.ats_service import _cache_key
from app.services.parser import extract_text_from_pdf


def test_cache_key_consistency():
    key1 = _cache_key("John Doe Resume", "Software Engineer")
    key2 = _cache_key("John Doe Resume", "Software Engineer")
    assert key1 == key2
    assert key1.startswith("ats:")


def test_cache_key_differs_on_different_input():
    assert _cache_key("resume a", "jd") != _cache_key("resume b", "jd")


def test_extract_text_rejects_non_pdf():
    with pytest.raises(Exception):
        extract_text_from_pdf(b"not a pdf")
