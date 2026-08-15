import requests
import json
import re
from fastapi import HTTPException

OLLAMA_URL = "http://localhost:11434/api/chat"

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

def extract_json_from_text(text: str) -> dict:
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError("No JSON found in text")

def grade_student_answer(rubric_json: list, student_text: str) -> dict:
    predicted_tokens = (len(rubric_json) * 60) + 200

    payload = {
        "model": "qwen3:4b", # Fast text-only model
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
    
    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    
    try:
        parsed_json = extract_json_from_text(content)
    except Exception:
        raise HTTPException(status_code=500, detail="AI did not return valid JSON.")
    
    # Server-side math
    grades = parsed_json.get("grades", [])
    total_score = sum(item.get("awarded_points", 0) for item in grades)
    parsed_json["total_score"] = total_score
        
    return parsed_json