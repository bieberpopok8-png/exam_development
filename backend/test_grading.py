import requests
import json

# 1. The structured JSON Rubric we just proved we can create
rubric_json = [
  {"question_id": "8", "id": 1, "criterion": "CT mastoid with IV contrast", "points": 5},
  {"question_id": "8", "id": 2, "criterion": "Hypodense soft tissue", "points": 10},
  {"question_id": "8", "id": 3, "criterion": "Tympanic cavity involvement", "points": 10},
  {"question_id": "8", "id": 4, "criterion": "Cholesteatoma", "points": 15},
  {"question_id": "8", "id": 5, "criterion": "Sigmoid sinus thrombosis", "points": 15}
]

# 2. A fake student answer (has some right, some wrong, some missing)
student_answer = """
Saya akan melakukan CT Scan Mastoid tanpa kontras. 
Tampak adanya massa jaringan lunak di telinga tengah. 
Terdapat erosi pada tulang-tulang pendengaran. 
Diagnosis saya adalah kolesteatoma.
"""

# 3. The strict prompt for grading
system_prompt = """
You are an expert radiology grading assistant. 
Evaluate the student's answer against the provided rubric.

Instructions:
1. Evaluate each criterion independently.
2. Award full points if the student mentions the concept (even using synonyms like "erosion of auditory ossicles" for "ossicular destruction").
3. Award 0 points if the student completely misses or gets it wrong.
4. Extract the EXACT quote from the student's text that matches the criterion. If missing, set student_quote to null.
5. Calculate the total score.

Output ONLY a valid JSON object using this exact format:
{
  "grades": [
    {
      "id": 1,
      "awarded_points": 0,
      "student_quote": "exact quote from student or null",
      "explanation": "brief reason in Indonesian why points were given or not"
    }
  ],
  "total_score": 0
}
"""

def grade_student_answer(rubric, student_text):
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "qwen3:8b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"RUBRIC:\n{json.dumps(rubric, indent=2)}\n\nSTUDENT ANSWER:\n{student_text}"}
        ],
        "format": "json",
        "stream": False,
        "options": {
            "num_predict": 2048
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    return response.json()["message"]["content"]

if __name__ == "__main__":
    print("Sending student answer to Qwen 3 8B for grading...")
    result = grade_student_answer(rubric_json, student_answer)
    
    print("\n--- AI GRADING OUTPUT ---")
    print(result)
    
    print("\n--- PARSED JSON ---")
    try:
        parsed = json.loads(result)
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"JSON Parsing Error: {e}")