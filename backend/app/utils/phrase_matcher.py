import re

from app.core.phrases import PHRASES


def extract_phrases(text: str) -> tuple[set[str], str]:
    r"""
    Find multi-word and punctuated skills in `text`.

    Returns the canonical skill names found, plus the text with those surface
    forms removed so the caller's tokeniser cannot double-count their parts.

    Surface forms are escaped before matching: several of them contain regex
    metacharacters ("c++"), which as a raw pattern is either a syntax error or
    silently matches the wrong thing. The boundaries are lookarounds rather
    than \b for the same reason — \b after a "+" asserts that a word
    character follows, so "\bc\+\+\b" never matches "c++" at all.
    """
    found: set[str] = set()
    lowered = text.lower()

    for skill, surface_forms in PHRASES.items():
        for form in surface_forms:
            pattern = rf"(?<!\w){re.escape(form)}(?!\w)"
            if re.search(pattern, lowered):
                found.add(skill)
                lowered = re.sub(pattern, " ", lowered)

    return found, lowered
