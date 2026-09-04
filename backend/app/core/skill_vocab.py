"""
The set of skills the deterministic scorer will recognise.

Derived from the weights table so the two cannot drift apart. A term outside
this set is ignored entirely: the scorer only claims to measure skills it has
been told about, which is what makes its output explainable.
"""

from app.core.skill_weights import SKILL_WEIGHTS

VALID_SKILLS = frozenset(SKILL_WEIGHTS)
