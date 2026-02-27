from pydantic import BaseModel

class QuizAttempt(BaseModel):
    user_id: str
    kc: str
    correct: bool
    

class Recommendation(BaseModel):
    content_id: str
    title: str
    reason: str