import requests
import json
import re

rubric_json = [
  {"question_id": "8", "id": 1, "criterion": "CT mastoid with IV contrast", "points": 5},
  {"question_id": "8", "id": 2, "criterion": "Hypodense soft tissue", "points": 10},
  {"question_id": "8", "id": 3, "criterion": "Tympanic cavity involvement", "points": 10},
  {"question_id": "8", "id": 4, "criterion": "Cholesteatoma", "points": 15},
  {"question_id": "8", "id": 5, "criterion": "Sigmoid sinus thrombosis", "points": 15}
]

student_answer = """
Saya akan melakukan CT Scan Mastoid tanpa kontras. 
Tampak adanya massa jaringan lunak di telinga tengah. 
Terdapat erosi pada tulang-tulang pendengaran. 
Diagnosis saya adalah kolesteatoma.
"""

system_prompt = """You are an expert radiology grading assistant. 
Evaluate the student's answer against the provided rubric.

Instructions:
1. Evaluate each criterion independently.
2. Award full points if the student mentions the concept.
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
}"""

def grade_student_answer(rubric, student_text):
    url = "http://localhost:11434/api/chat"
    
    payload = {
        "model": "mistral",  # <-- USING MISTRAL
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"RUBRIC:\n{json.dumps(rubric, indent=2)}\n\nSTUDENT ANSWER:\n{student_text}"}
        ],
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 2048
        }
    }
    
    print("Sending request to Mistral...")
    response = requests.post(url, json=payload, timeout=120)
    print(f"Response status: {response.status_code}")
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    print(f"Raw content length: {len(content)} characters")
    print(f"Raw content preview: {content[:300]}...")
    
    return content

def extract_json_from_text(text):
    """Extract JSON from text."""
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass
    return None

if __name__ == "__main__":
    print("Sending student answer to Mistral for grading...")
    result = grade_student_answer(rubric_json, student_answer)
    
    print("\n--- AI GRADING OUTPUT ---")
    print(result)
    
    print("\n--- PARSED JSON ---")
    try:
        parsed = json.loads(result)
        print(json.dumps(parsed, indent=2))
        print(f"\n✅ Total Score: {parsed.get('total_score', 0)}")
    except Exception as e:
        print(f"❌ JSON Parsing Error: {e}")
        parsed = extract_json_from_text(result)
        if parsed:
            print("\n✅ Extracted JSON from text:")
            print(json.dumps(parsed, indent=2))
        else:
            print(f"\n❌ Could not parse JSON. Raw output:\n{result}")
