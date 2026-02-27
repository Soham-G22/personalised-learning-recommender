from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["learning_recommender"]

users_col = db["users"]
attempts_col = db["quiz_attempts"]
knowledge_col = db["knowledge_state"]
content_col = db["content"]
audit_col = db["audit_logs"]