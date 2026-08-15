from pydantic import BaseModel

class RubricItem(BaseModel):
    id: int
    criterion: str
    points: int

class RubricResponse(BaseModel):
    id: int
    question_id: int
    structured_data: list[RubricItem]
    file_path: str

    class Config:
        from_attributes = True