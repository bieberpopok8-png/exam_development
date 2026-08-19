# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
delegated: User chose to use FastAPI backend with Ollama for AI processing, PostgreSQL for storage

## Users
Professors who need to grade student answers to radiology questions using a rubric, and Students who submit their answers to be graded automatically.

## Product Purpose
An API for semi-automated grading of free-text radiology exam answers: extracts rubric criteria and student answers from uploaded files (PDF, image, DOCX/TXT/CSV), then uses a local vision/text model (Ollama with qwen3-vl:4b-instruct and qwen3:4b) to grade answers against the rubric without cloud API calls.

## Positioning
The product provides semi-automated grading of free-text radiology answers using local LLM processing via Ollama, ensuring data privacy and eliminating dependency on external cloud AI services while maintaining accuracy through structured rubric-based evaluation.

## Operating Context
Professors upload rubrics (PDF, image, DOCX/TXT/CSV) for a question; the system uploads student answers to that same question; both documents are converted into structured data in the background; a grading endpoint compares the structured rubric against the student's extracted text using a local LLM to award points per-criterion, and returns a total score plus per-item quotes and explanations.

## Capabilities and Constraints
- Must provide REST API endpoints for uploading rubrics, student answers, and triggering grading
- Must use local Ollama instance with qwen3-vl:4b-instruct (vision) and qwen3:4b (text) models; no cloud LLM calls
- Must support PDF, PNG, JPG, DOCX, TXT, CSV uploads for both rubrics and student answers
- Must store data in a PostgreSQL database using SQLAlchemy ORM with autoschema creation on startup
- All AI work happens through a local Ollama instance — there is no cloud LLM API call anywhere in this backend
- Tables are created automatically on startup if they don't exist (no migration system)

## Brand Commitments
[None explicitly stated - no name, voice, assets, personality, or identity constraints were provided as binding.]

## Evidence on Hand
- Backend documentation in BACKEND_DOCUMENTATION.md describes the FastAPI system in detail
- File upload service validates extensions against allow-list (.pdf .png .jpg .jpeg .docx .txt .csv)
- Ollama integration for both vision (qwen3-vl:4b-instruct) and text (qwen3:4b) models
- PostgreSQL database with SQLAlchemy ORM models for Exam, Question, Rubric, StudentAnswer
- Automatic schema creation via Base.metadata.create_all() on startup

## Product Principles
1. Privacy-first AI processing: All grading happens locally via Ollama, ensuring no data leaves the user's environment
2. Format flexibility: Support multiple document types (PDF, images, DOCX, TXT, CSV) for both rubrics and student answers
3. Structured grading workflow: Extract structured data from documents before applying AI grading for consistency and accuracy
4. Professor-in-the-loop: System provides per-criterion scores with quotes and explanations, allowing manual review and override
5. Self-contained system: Backend operates independently with its own Postgres database, not relying on external services