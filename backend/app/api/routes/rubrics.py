import os
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.exam import Question, Rubric, DocumentStatus
from app.services.file_service import save_file, convert_file_to_base64_images, extract_text_from_document
from app.services.ocr_service import process_rubric_ocr, structure_rubric_text
from app.schemas.rubric import RubricResponse
from app.core.config import settings

router = APIRouter()

def rubric_background_task(file_path: str, rubric_id: int):
    db = SessionLocal()
    db_rubric = None
    try:
        db_rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
        # FIXED: Early exit if rubric doesn't exist
        if not db_rubric:
            return

        db_rubric.ocr_status = DocumentStatus.PROCESSING
        db.commit()

        # HYBRID LOGIC: Check file extension
        if file_path.lower().endswith(('.docx', '.txt', '.csv')):
            # Instant text extraction -> Fast text AI structuring
            raw_text = extract_text_from_document(file_path)
            structured_json = structure_rubric_text(raw_text)
        else:
            # Vision AI path for PDFs/Images
            images = convert_file_to_base64_images(file_path)
            structured_json = process_rubric_ocr(images)

        db_rubric.structured_data = structured_json
        db_rubric.ocr_status = DocumentStatus.READY
        db.commit()
    except Exception as e:
        # FIXED: Only update status if db_rubric was successfully fetched
        if db_rubric:
            db_rubric.ocr_status = DocumentStatus.FAILED
            db.commit()
        # Log the error (optional)
        print(f"Background task failed for rubric {rubric_id}: {str(e)}")
    finally:
        db.close()

@router.post("/upload", response_model=RubricResponse)
async def upload_rubric(
    background_tasks: BackgroundTasks,
    question_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # FIXED: Clean up old file if rubric already exists
    existing_rubric = db.query(Rubric).filter(Rubric.question_id == question_id).first()
    if existing_rubric and existing_rubric.file_path:
        if os.path.exists(existing_rubric.file_path):
            os.remove(existing_rubric.file_path)

    file_path = save_file(file, folder="rubrics")

    if existing_rubric:
        existing_rubric.file_path = file_path
        existing_rubric.ocr_status = DocumentStatus.UPLOADED
        existing_rubric.structured_data = None
    else:
        existing_rubric = Rubric(question_id=question_id, file_path=file_path, ocr_status=DocumentStatus.UPLOADED)
        db.add(existing_rubric)

    db.commit()
    db.refresh(existing_rubric)

    background_tasks.add_task(rubric_background_task, file_path, existing_rubric.id)
    return existing_rubric

@router.get("/status/{rubric_id}")
async def get_rubric_status(rubric_id: int, db: Session = Depends(get_db)):
    """Check the processing status of a rubric."""
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found.")
    
    return {
        "id": rubric.id,
        "status": rubric.ocr_status,
        "is_ready": rubric.ocr_status == DocumentStatus.READY,
        "has_structure": rubric.structured_data is not None
    }

@router.get("/{rubric_id}")
async def get_rubric(rubric_id: int, db: Session = Depends(get_db)):
    """Get full rubric data including structured criteria."""
    rubric = db.query(Rubric).filter(Rubric.id == rubric_id).first()
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found.")
    
    return rubric