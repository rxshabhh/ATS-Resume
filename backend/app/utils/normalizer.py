NORMALIZE_MAP = {
    "datum": "data",
    "aw": "aws",
    "apis": "api",
    "principle": "principles",
    "ci": "ci/cd",
    "cd": "ci/cd"
}

def normalize(tokens):
    return set(NORMALIZE_MAP.get(t, t) for t in tokens)
