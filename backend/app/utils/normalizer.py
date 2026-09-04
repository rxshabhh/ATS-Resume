"""
Fold surface variants onto the canonical skill names used by the vocabulary.

Only spellings that spaCy's lemmatiser actually produces are listed. Anything
not mapped here passes through untouched and is then either matched against the
vocabulary or discarded, so this table does not need to be exhaustive — it only
needs to be correct.
"""

NORMALIZE_MAP = {
    "datum": "data",   # spaCy lemmatises the noun "data" to its Latin singular
    "apis": "api",
    "aw": "aws",       # "AWS" is occasionally lemmatised as a plural
    "postgres": "postgresql",
    "k8s": "kubernetes",
}


def normalize(tokens: set[str]) -> set[str]:
    return {NORMALIZE_MAP.get(t, t) for t in tokens}
