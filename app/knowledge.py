ALPHA = 0.15

def update_mastery(p_old: float, correct: bool):
    p_new = p_old + ALPHA * ((1 if correct else 0) - p_old)
    return max(0.05, min(0.95, p_new))