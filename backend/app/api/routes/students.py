from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.exam import Question, StudentAnswer, DocumentStatus
from app.services.file_service import save_file, convert_file_to_base64_images, extract_text_from_document
from app.services.ocr_service import process_student_ocr
from app.schemas.student import StudentUploadResponse

router = APIRouter()

def student_background_task(file_path: str, student_id: int):
    db = SessionLocal()
    try:
        db_student = db.query(StudentAnswer).filter(StudentAnswer.id == student_id).first()
        db_student.ocr_status = DocumentStatus.PROCESSING
        db.commit()

        # HYBRID LOGIC: Check file extension
        if file_path.lower().endswith(('.docx', '.txt', '.csv')):
            # Instant text extraction, no AI needed!
            extracted_text = extract_text_from_document(file_path)
        else:
            # Vision AI path for PDFs/Images
            images = convert_file_to_base64_images(file_path)
            extracted_text = process_student_ocr(images)

        db_student.structured_data = {"raw_text": extracted_text}
        db_student.ocr_status = DocumentStatus.READY
        db.commit()
    except Exception as e:
        db_student.ocr_status = DocumentStatus.FAILED
        db.commit()
    finally:
        db.close()

@router.post("/upload", response_model=StudentUploadResponse)
async def upload_student_answer(
    background_tasks: BackgroundTasks,
    question_id: int = Form(...),
    student_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    file_path = save_file(file, folder="students")
    
    db_student = StudentAnswer(
        question_id=question_id,
        student_name=student_name,
        file_path=file_path,
        ocr_status=DocumentStatus.UPLOADED
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    background_tasks.add_task(student_background_task, file_path, db_student.id)
    return db_student