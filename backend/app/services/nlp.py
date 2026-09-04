"""Keyword extraction: spaCy tokens plus the phrase table."""

import logging

import spacy

from app.utils.normalizer import normalize
from app.utils.phrase_matcher import extract_phrases

logger = logging.getLogger(__name__)

MODEL_NAME = "en_core_web_sm"

_nlp = None


class ModelUnavailable(RuntimeError):
    """Raised when the spaCy model is not installed."""


def get_nlp():
    """
    Load the spaCy model on first use and keep it for the process lifetime.

    Loading lazily rather than at import time keeps a missing model from taking
    down the whole application at startup: only the keyword-scoring endpoint
    fails, and it fails with an instruction instead of an ImportError traceback.
    The model is ~12 MB and is not bundled by pip, so "not installed yet" is the
    normal state of a fresh clone.
    """
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load(MODEL_NAME)
        except OSError as exc:
            raise ModelUnavailable(
                f"spaCy model '{MODEL_NAME}' is not installed. "
                f"Run: python -m spacy download {MODEL_NAME}"
            ) from exc
        logger.info("loaded spaCy model %s", MODEL_NAME)
    return _nlp


def extract_keywords(text: str) -> set[str]:
    """
    Pull candidate skill terms out of free text.

    Phrases are taken first and stripped from the text, so a multi-word skill
    is not also counted as its constituent nouns. What remains is reduced to
    the lemmas of its non-stopword nouns and proper nouns — the parts of speech
    a skill name is nearly always written as.
    """
    phrases, remaining_text = extract_phrases(text)

    doc = get_nlp()(remaining_text)
    tokens = {
        token.lemma_
        for token in doc
        if token.pos_ in ("NOUN", "PROPN") and not token.is_stop and token.is_alpha
    }

    return normalize(tokens | phrases)
