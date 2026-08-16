// src/lib/ai.ts

const OLLAMA_URL = "http://localhost:11434/api/chat";

const RUBRIC_PROMPT = `
You are a data extraction assistant. Look at the provided document image(s). 
Extract ALL grading criteria from the document into a JSON object. 
Output ONLY a valid JSON object using this exact format:
{
  "rubrics": [
    {
      "id": 1,
      "criterion": "the specific grading criterion",
      "points": 5
    }
  ]
}
`;

const GRADING_PROMPT = `
You are a strict, pedantic medical professor grading an exam. 
Evaluate the student's free-text answer against the provided rubric.

CRITICAL RULES:
1. 1-TO-1 MAPPING: Output exactly one grade object for EVERY rubric item.
2. SEMANTIC MATCHING: Check if the student captured the medical concept. If they miss specific qualifiers (like 'hiperdens'), award PARTIAL or 0 points.
3. EXACT QUOTES: Extract the exact verbatim quote from the student's text.

Output ONLY a valid JSON object:
{
  "grades": [
    {
      "id": 1,
      "awarded_points": 0,
      "student_quote": "exact quote or null",
      "explanation": "brief reason"
    }
  ]
}
`;

export async function extractRubricFromImages(imagesBase64: string[]) {
  const payload = {
    model: "qwen3-vl:4b-instruct",
    messages: [
      { role: "system", content: RUBRIC_PROMPT },
      { role: "user", content: "Extract rubric.", images: imagesBase64 }
    ],
    format: "json",
    stream: false,
    options: { temperature: 0.0 }
  };

  const res = await fetch(OLLAMA_URL, { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  return JSON.parse(data.message.content);
}

export async function gradeStudentAnswer(rubricJson: any[], studentText: string) {
  const payload = {
    model: "qwen3-vl:4b-instruct",
    messages: [
      { role: "system", content: GRADING_PROMPT },
      { role: "user", content: `RUBRIC:\n${JSON.stringify(rubricJson)}\n\nSTUDENT ANSWER:\n${studentText}` }
    ],
    format: "json",
    stream: false,
    options: { temperature: 0.0 }
  };

  const res = await fetch(OLLAMA_URL, { method: "POST", body: JSON.stringify(payload) });
  const data = await res.json();
  const parsed = JSON.parse(data.message.content);
  
  // Server-side math
  parsed.total_score = parsed.grades.reduce((sum: number, g: any) => sum + g.awarded_points, 0);
  return parsed;
}