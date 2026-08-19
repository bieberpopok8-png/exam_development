import json
import re
from typing import Dict, Any

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """
    Finds the FIRST valid JSON object in a string using balanced brace matching.
    Handles cases where AI returns multiple JSON objects or extra text.
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
                    # Found a complete JSON object
                    try:
                        return json.loads(text[start:i + 1])
                    except json.JSONDecodeError:
                        break
        # Try next opening brace
        start = text.find('{', start + 1)
    
    raise ValueError("No valid JSON found in text")

def clean_filename(filename: str) -> str:
    """Remove problematic characters from filename."""
    return re.sub(r'[^\w\-_.]', '_', filename)