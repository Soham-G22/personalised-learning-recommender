from fastapi import FastAPI
from app.db import attempts_col, knowledge_col
from app.models import QuizAttempt
from app.knowledge import update_mastery
from app.recommender import recommend_for_user

app = FastAPI()


@app.post("/quiz_attempt")
def submit_attempt(attempt: QuizAttempt):
    # store attempt
    attempts_col.insert_one(attempt.dict())

    # fetch knowledge state
    state = knowledge_col.find_one({"user_id": attempt.user_id})

    if state is None:
        kc_mastery = {attempt.kc: 0.5}
    else:
        kc_mastery = state["kc_mastery"]

    old_p = kc_mastery.get(attempt.kc, 0.5)
    new_p = update_mastery(old_p, attempt.correct)
    kc_mastery[attempt.kc] = new_p

    # update db
    knowledge_col.update_one(
        {"user_id": attempt.user_id},
        {"$set": {"kc_mastery": kc_mastery}},
        upsert=True
    )

    return {"status": "ok", "new_mastery": new_p}


@app.get("/recommendations/{user_id}")
def get_recommendations(user_id: str):
    state = knowledge_col.find_one({"user_id": user_id})

    if not state:
        return {"message": "No data for this user"}

    kc_mastery = state["kc_mastery"]
    recs = recommend_for_user(kc_mastery)

    return {"recommendations": recs}


@app.get("/knowledge_state/{user_id}")
def get_state(user_id: str):
    state = knowledge_col.find_one({"user_id": user_id})
    if not state:
        return {"message": "No data"}

    return state["kc_mastery"]