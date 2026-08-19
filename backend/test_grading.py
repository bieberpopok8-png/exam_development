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

# SIMPLER PROMPT - NO SYSTEM MESSAGE, JUST DIRECT INSTRUCTION
def grade_student_answer(rubric, student_text):
    url = "http://localhost:11434/api/generate"  # Using generate API, not chat
    
    prompt = f"""Grade this student answer against the rubric. Output ONLY valid JSON.

Rubric:
{json.dumps(rubric, indent=2)}

Student answer:
{student_text}

Output JSON format:
{{"grades": [{{"id": 1, "awarded_points": 0, "student_quote": "quote or null", "explanation": "reason"}}], "total_score": 0}}

IMPORTANT: Include ALL 5 criteria in the grades array. Do not add any text outside the JSON."""
    
    payload = {
        "model": "qwen3-vl:4b-instruct",
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "num_predict": 2048
        }
    }
    
    print("Sending request to qwen3:3b (generate API)...")
    response = requests.post(url, json=payload, timeout=120)
    print(f"Response status: {response.status_code}")
    response.raise_for_status()
    
    content = response.json().get("response", "")
    print(f"Raw content length: {len(content)} characters")
    print(f"Raw content preview: {content[:300]}...")
    
    return content

def extract_json_from_text(text):
    """Extract the FIRST complete JSON object from text."""
    start = text.find('{')
    if start == -1:
        return None
    
    brace_count = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                try:
                    return json.loads(text[start:i+1])
                except:
                    return None
    return None

if __name__ == "__main__":
    print("Sending student answer to qwen3:3b for grading...")
    result = grade_student_answer(rubric_json, student_answer)
    
    print("\n--- AI GRADING OUTPUT ---")
    print(result[:500] + "..." if len(result) > 500 else result)
    
    print("\n--- PARSED JSON ---")
    parsed = extract_json_from_text(result)
    
    if parsed:
        print("✅ SUCCESS! JSON parsed:")
        print(json.dumps(parsed, indent=2))
        
        if "grades" in parsed:
            total = sum(g.get("awarded_points", 0) for g in parsed["grades"])
            print(f"\n✅ Total Score (calculated): {total}")
            print(f"✅ Number of criteria graded: {len(parsed['grades'])}")
    else:
        print("❌ Could not parse JSON from response")
        print(f"\nRaw output was:\n{result}")
