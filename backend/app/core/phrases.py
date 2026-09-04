"""
Multi-word and punctuated skills, with the surface forms that denote them.

These are matched literally against the raw text and removed from it before
spaCy runs. That ordering matters twice over:

  * "machine learning" would otherwise be lemmatised into the unrelated tokens
    "machine" and "learning";
  * spaCy's token path keeps only alphabetic tokens, so a skill containing
    punctuation ("c++", "ci/cd") can *only* ever be found here.

Patterns are plain strings, escaped by the matcher — do not write regex here.
"""

PHRASES: dict[str, list[str]] = {
    "fastapi": ["fastapi", "fast api"],
    "django": ["django"],
    "rest api": ["rest api", "restful api", "rest apis", "restful apis"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration", "continuous deployment"],
    "machine learning": ["machine learning"],
    "deep learning": ["deep learning"],
    "data science": ["data science"],
    "system design": ["system design"],
    "microservices": ["microservices", "microservice", "micro service"],
    "cloud computing": ["cloud computing"],
    "aws": ["aws", "amazon web services"],
    "docker": ["docker", "containerization", "containerisation"],
    "kubernetes": ["kubernetes", "k8s"],
    "c++": ["c++"],
    "postgresql": ["postgresql", "postgres"],
}
