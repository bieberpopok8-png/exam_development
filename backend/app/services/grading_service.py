import requests
import json
from fastapi import HTTPException
from app.core.config import settings
from app.services.utils import extract_json_from_text

SYSTEM_PROMPT = """
You are a fast grading API. Compare the RUBRIC to the STUDENT ANSWER text.
- Award FULL points for correct concepts. 0 points for missing/wrong.
- Keep explanation VERY short (max 5 words in Indonesian).

Output ONLY a JSON object:
{
  "grades": [
    {"id": 1, "awarded_points": 0, "student_quote": "quote or null", "explanation": "reason"}
  ]
}
"""

def grade_student_answer(rubric_json: list, student_text: str) -> dict:
    predicted_tokens = (len(rubric_json) * 60) + 200

    payload = {
        "model": settings.OLLAMA_TEXT_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"RUBRIC:\n{json.dumps(rubric_json, indent=2)}\n\nSTUDENT ANSWER:\n{student_text}\n\nGrade the student's answer."}
        ],
        "format": "json",
        "stream": False,
        "options": {
            "num_ctx": 4096,
            "num_predict": predicted_tokens,
            "temperature": 0.1
        }
    }
    
    # FIXED: Added timeout to prevent infinite hangs
    response = requests.post(settings.OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    
    try:
        parsed_json = extract_json_from_text(content)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"AI did not return valid JSON: {str(e)}")
    
    # Server-side math - don't trust AI's arithmetic
    grades = parsed_json.get("grades", [])
    total_score = sum(item.get("awarded_points", 0) for item in grades)
    parsed_json["total_score"] = total_score
        
    return parsed_json