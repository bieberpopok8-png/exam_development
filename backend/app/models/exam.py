from sqlalchemy import Column, Integer, String, JSON, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
import enum

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
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=True)
    question_number = Column(Integer, nullable=False, index=True)
    prompt_text = Column(String, nullable=True)
    
    exam = relationship("Exam", back_populates="questions")
    rubric = relationship("Rubric", back_populates="question", uselist=False)
    student_answers = relationship("StudentAnswer", back_populates="question")

class Rubric(Base):
    __tablename__ = "rubrics"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), unique=True, nullable=False)
    file_path = Column(String, nullable=False)
    structured_data = Column(JSON, nullable=True)
    ocr_status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    
    question = relationship("Question", back_populates="rubric")

class StudentAnswer(Base):
    __tablename__ = "student_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    student_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    structured_data = Column(JSON, nullable=True)
    ocr_status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    
    question = relationship("Question", back_populates="student_answers")