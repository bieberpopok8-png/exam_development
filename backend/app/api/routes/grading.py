from fastapi import APIRouter, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.exam import Rubric, StudentAnswer, DocumentStatus
from app.services.grading_service import grade_student_answer
from app.schemas.grading import GradingResult

router = APIRouter()

@router.post("/grade", response_model=GradingResult)
async def trigger_grading(
    student_answer_id: int = Form(...),
    db: Session = Depends(get_db)
):
    student_answer = db.query(StudentAnswer).filter(StudentAnswer.id == student_answer_id).first()
    if not student_answer:
        raise HTTPException(status_code=404, detail="Student answer not found.")

    rubric = db.query(Rubric).filter(Rubric.question_id == student_answer.question_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found.")

    # 1. Check if background OCR is finished
    if rubric.ocr_status != DocumentStatus.READY:
        raise HTTPException(status_code=409, detail=f"Rubric is still processing. Status: {rubric.ocr_status}")
    if student_answer.ocr_status != DocumentStatus.READY:
        raise HTTPException(status_code=409, detail=f"Student answer is still processing. Status: {student_answer.ocr_status}")

    # 2. Extract the text from the JSON column
    student_text = student_answer.structured_data.get("raw_text", "")
    rubric_json = rubric.structured_data

    # 3. Run the lightning-fast text-only grading
    ai_result = grade_student_answer(rubric_json, student_text)

    return {
        "student_answer_id": student_answer.id,
        "total_score": ai_result.get("total_score", 0),
        "grades": ai_result.get("grades", [])
    }