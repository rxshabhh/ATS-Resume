import spacy
from app.utils.normalizer import normalize
from app.utils.phrase_matcher import extract_phrases

nlp = spacy.load("en_core_web_sm")

def extract_keywords(text: str):
    phrases, cleaned_text = extract_phrases(text)

    doc = nlp(cleaned_text)
    tokens = {
        token.lemma_
        for token in doc
        if token.pos_ in ["NOUN", "PROPN"]
        and not token.is_stop
        and token.is_alpha
    }

    return normalize(tokens | phrases)
