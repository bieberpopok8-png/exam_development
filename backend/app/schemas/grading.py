from pydantic import BaseModel

class GradeItem(BaseModel):
    id: int
    awarded_points: int
    student_quote: str | None
    explanation: str

class GradingResult(BaseModel):
    student_answer_id: int
    total_score: int
    grades: list[GradeItem]

    class Config:
        from_attributes = True