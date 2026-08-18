import requests
import json
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
    """
    FIXED: Finds the FIRST valid JSON object in a string and parses it.
    Uses balanced brace matching instead of greedy regex to handle
    cases where the AI returns multiple concatenated JSON objects.
    """
    start = text.find('{')
    while start != -1:
        depth = 0
        for i in range(start, len(text)):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        break
        start = text.find('{', start + 1)
    raise ValueError("No valid JSON found in text")

def grade_student_answer(rubric_json: list, student_text: str) -> dict:
    predicted_tokens = (len(rubric_json) * 60) + 200

    payload = {
        "model": "qwen3:4b",
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
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
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