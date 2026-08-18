import requests
import json
from fastapi import HTTPException

OLLAMA_URL = "http://localhost:11434/api/chat"

# --- PROMPTS ---

RUBRIC_PROMPT = """
You are a data extraction assistant. Look at the provided document image(s) or text. 
Extract ALL grading criteria from the document into a JSON object. 
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
    }
  ]
}
"""

STUDENT_OCR_PROMPT = """
You are an expert OCR engine. Read the text from the provided document image(s). 
Output ONLY the exact raw text you see. Do not add any conversational filler.
"""

# --- HELPER FUNCTIONS ---

def extract_json_from_text(text: str) -> dict:
    """
    FIXED: Finds the FIRST valid JSON object in a string and parses it.
    Uses balanced brace matching instead of greedy regex to handle
    cases where the AI returns multiple concatenated JSON objects.
    """
    start = text.find('{')
    while start != -1:
        # Find matching closing brace by tracking depth
        depth = 0
        for i in range(start, len(text)):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    # Found a complete, balanced JSON object
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        # This block wasn't valid JSON, try next '{'
                        break
        start = text.find('{', start + 1)
    raise ValueError("No valid JSON found in text")

# --- AI PROCESSING FUNCTIONS ---

def process_rubric_ocr(images_base64: list[str]) -> list:
    """Uses Vision AI to extract rubric JSON from images (PDF/Image uploads)."""
    payload = {
        "model": "qwen3-vl:4b-instruct",
        "messages": [
            {"role": "system", "content": RUBRIC_PROMPT},
            {"role": "user", "content": "Please extract the rubric criteria from these document images.", "images": images_base64}
        ],
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout to prevent infinite hangs
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    parsed = extract_json_from_text(content)
    return parsed.get("rubrics", [])

def structure_rubric_text(raw_text: str) -> list:
    """Uses fast text-only AI to structure rubric JSON from raw text (DOCX/TXT uploads)."""
    payload = {
        "model": "qwen3:4b",
        "messages": [
            {"role": "system", "content": RUBRIC_PROMPT},
            {"role": "user", "content": raw_text}
        ],
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    parsed = extract_json_from_text(content)
    return parsed.get("rubrics", [])

def process_student_ocr(images_base64: list[str]) -> str:
    """Uses Vision AI to extract raw text from student answer images (PDF/Image uploads)."""
    payload = {
        "model": "qwen3-vl:4b-instruct",
        "messages": [
            {"role": "system", "content": STUDENT_OCR_PROMPT},
            {"role": "user", "content": "Extract all text from these images.", "images": images_base64}
        ],
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    return response.json()["message"]["content"]