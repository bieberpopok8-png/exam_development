from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

# Enum for tracking background OCR/Processing status
class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    
    questions = relationship("Question", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    
    # Nullable: Professor can upload questions/rubrics before officially creating an Exam
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True) 
    
    # NOT Nullable: We need this to match the AI's output ("1", "2", "8")
    question_number = Column(Integer, nullable=False, index=True) 
    
    # Nullable: Professor can add the prompt text later
    prompt_text = Column(String, nullable=True) 
    
    exam = relationship("Exam", back_populates="questions")
    rubric = relationship("Rubric", uselist=False, back_populates="question")
    student_answers = relationship("StudentAnswer", back_populates="question")

class Rubric(Base):
    __tablename__ = "rubrics"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    file_path = Column(String) # Stores where the original PDF/Image is saved
    structured_data = Column(JSON) # Stores the AI-generated {id, criterion, points} JSON
    ocr_status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    
    question = relationship("Question", back_populates="rubric")

class StudentAnswer(Base):
    __tablename__ = "student_answers"
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    student_name = Column(String) # e.g., "Student 01"
    file_path = Column(String) # Path to the uploaded PDF/Image
    structured_data = Column(JSON) # Stores the AI-extracted text/JSON
    
    # OCR Status for tracking background processing
    ocr_status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    
    question = relationship("Question", back_populates="student_answers")