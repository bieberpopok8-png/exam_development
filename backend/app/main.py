from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import rubrics, students, grading
from app.database import engine, Base
from app.models import exam

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Radiology Exam Grader API")

# FIXED: Proper CORS configuration
# For development with frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rubrics.router, prefix="/api/rubrics", tags=["Rubrics"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(grading.router, prefix="/api/grading", tags=["Grading"])

@app.get("/")
def read_root():
    return {"status": "success", "message": "Welcome to the Radiology Grader API!"}