import pytest
from app.services.ats_service import extract_text_from_pdf, _cache_key

def test_cache_key_consistency():
    resume = "John Doe Resume"
    jd = "Software Engineer"
    key1 = _cache_key(resume, jd)
    key2 = _cache_key(resume, jd)
    assert key1 == key2
    assert key1.startswith("ats:")

def test_extract_text_empty():
    # pdfplumber should raise or return empty for junk bytes
    with pytest.raises(Exception):
        extract_text_from_pdf(b"not a pdf")
