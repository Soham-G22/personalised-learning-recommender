from app.db import content_col

content_col.insert_many([
    {"title": "Newton Law Basics", "kc": "newton"},
    {"title": "Force and Motion AR", "kc": "newton"},
    {"title": "Acceleration Practice", "kc": "acceleration"}
])

print("Inserted sample content")
def recommend_for_user(kc_mastery: dict):
    # find weakest KC
    weakest_kc = min(kc_mastery, key=lambda k: kc_mastery[k])
    mastery = kc_mastery[weakest_kc]

    # fetch content targeting that KC
    contents = list(content_col.find({"kc": weakest_kc}))

    recommendations = []
    for c in contents:
        reason = f"Targets weak skill '{weakest_kc}' (mastery={round(mastery,2)})"
        recommendations.append({
            "content_id": str(c["_id"]),
            "title": c["title"],
            "reason": reason
            
        })
        

    return recommendations[:3]