import re
from app.core.phrases import PHRASES

def extract_phrases(text):
    found = set()
    lowered = text.lower()

    for key, patterns in PHRASES.items():
        for pattern in patterns:
            if re.search(rf"\b{pattern}\b", lowered):
                found.add(key)
                lowered = re.sub(rf"\b{pattern}\b", "", lowered)

    return found, lowered
