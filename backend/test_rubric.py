import requests
import json

fake_rubric_text = """
Question 8 (25-year-old male, ear infection)
a. Describe the CT.
b. Give the diagnosis.

Rubric:
- CT mastoid with IV contrast: 5 points
- Hypodense soft tissue: 10 points
- Tympanic cavity involvement: 10 points
- Cholesteatoma: 15 points
- Sigmoid sinus thrombosis: 15 points
Total: 100 points
"""

system_prompt = """
You are a data extraction assistant. Extract ALL grading criteria from the provided text into a JSON object. 
You must extract every single item, not just the first one.
Do not output any other text. 

Output ONLY a valid JSON object using this exact format:
{
  "rubrics": [
    {
      "question_id": "the question number if available, else null",
      "id": 1,
      "criterion": "the specific grading criterion",
      "points": 5
    },
    {
      "question_id": "the question number if available, else null",
      "id": 2,
      "criterion": "the next criterion",
      "points": 10
    }
  ]
}
"""

def convert_rubric_to_json(raw_text):
    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": raw_text}
        ],
        "format": "json",
        "stream": False,
        "options": {
            "num_predict": 2048
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    ai_message = response.json()["message"]["content"]
    return ai_message

if __name__ == "__main__":
    print("Sending rubric to Mistral...")
    result = convert_rubric_to_json(fake_rubric_text)
    
    print("\n--- AI RAW OUTPUT ---")
    print(result)
    
    print("\n--- PARSED JSON ---")
    try:
        parsed_json = json.loads(result)
        # Extract the array from the "rubrics" key
        rubric_array = parsed_json.get("rubrics", [])
        print(json.dumps(rubric_array, indent=2))
        print(f"\nSuccessfully extracted {len(rubric_array)} criteria!")
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
