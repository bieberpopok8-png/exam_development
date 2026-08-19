import requests
import json
from fastapi import HTTPException
from app.core.config import settings
from app.services.utils import extract_json_from_text

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

# --- AI PROCESSING FUNCTIONS ---

def process_rubric_ocr(images_base64: list[str]) -> list:
    """Uses Vision AI to extract rubric JSON from images (PDF/Image uploads)."""
    payload = {
        "model": settings.OLLAMA_VISION_MODEL,
        "messages": [
            {"role": "system", "content": RUBRIC_PROMPT},
            {"role": "user", "content": "Please extract the rubric criteria from these document images.", "images": images_base64}
        ],
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout
    response = requests.post(settings.OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    parsed = extract_json_from_text(content)
    return parsed.get("rubrics", [])

def structure_rubric_text(raw_text: str) -> list:
    """Uses fast text-only AI to structure rubric JSON from raw text (DOCX/TXT uploads)."""
    payload = {
        "model": settings.OLLAMA_TEXT_MODEL,
        "messages": [
            {"role": "system", "content": RUBRIC_PROMPT},
            {"role": "user", "content": raw_text}
        ],
        "format": "json",
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout
    response = requests.post(settings.OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    content = response.json()["message"]["content"]
    parsed = extract_json_from_text(content)
    return parsed.get("rubrics", [])

def process_student_ocr(images_base64: list[str]) -> str:
    """Uses Vision AI to extract raw text from student answer images (PDF/Image uploads)."""
    payload = {
        "model": settings.OLLAMA_VISION_MODEL,
        "messages": [
            {"role": "system", "content": STUDENT_OCR_PROMPT},
            {"role": "user", "content": "Extract all text from these images.", "images": images_base64}
        ],
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    # FIXED: Added timeout
    response = requests.post(settings.OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    
    return response.json()["message"]["content"]