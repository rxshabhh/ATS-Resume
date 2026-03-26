from app.core.skill_weights import SKILL_WEIGHTS

def match_keywords(jd_keywords, resume_keywords):
    matched = jd_keywords & resume_keywords
    missing = jd_keywords - resume_keywords

    total_weight = 0
    matched_weight = 0

    for skill in jd_keywords:
        weight = SKILL_WEIGHTS.get(skill, 1.0)
        total_weight += weight
        if skill in matched:
            matched_weight += weight

    score = round((matched_weight / total_weight) * 100, 2) if total_weight else 0

    return matched, missing, score
