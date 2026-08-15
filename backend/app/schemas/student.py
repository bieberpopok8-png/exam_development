from pydantic import BaseModel

class StudentUploadResponse(BaseModel):
    id: int
    question_id: int
    student_name: str
    file_path: str

    class Config:
        from_attributes = True