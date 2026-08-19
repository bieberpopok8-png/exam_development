# Updated BACKEND_DOCUMENTATION.md

```markdown
# Backend Documentation — Radiology Exam Grader API

This document describes the FastAPI backend in `exam_development/backend`: what it does, how requests flow through it, its data model, and every external dependency it relies on.

> **Scope note:** this backend is a self-contained system with its own database. It uses SQLite for development and testing, and can be configured for PostgreSQL in production.

---

## 1. What it does

An API for semi-automated grading of free-text radiology exam answers:

1. A professor uploads a **rubric** (grading criteria) for a question — as a PDF, image, or DOCX/TXT/CSV.
2. The system uploads **student answers** to that same question — again as PDF, image, or DOCX/TXT/CSV.
3. In the background, both documents are converted into structured data: the rubric into a list of `{criterion, points}` items, and the student answer into raw text.
4. A grading endpoint compares the structured rubric against the student's extracted text, using a local LLM (via Ollama) to award points per-criterion, and returns a total score plus per-item quotes and explanations.

All AI work happens through a **local Ollama instance** — there is no cloud LLM API call anywhere in this backend.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Web framework | FastAPI (`fastapi==0.136.1`) |
| ASGI server | Uvicorn (`uvicorn==0.46.0`) |
| ORM | SQLAlchemy 2.0 (`SQLAlchemy==2.0.49`) |
| Database | SQLite (development) / PostgreSQL (production) |
| Config/env | `pydantic-settings==2.14.0` |
| Validation/serialization | Pydantic v2 (`pydantic==2.13.3`) |
| PDF rendering | PyMuPDF (`pymupdf==1.28.0`) |
| DOCX text extraction | `python-docx==1.2.0` |
| LLM runtime | Ollama (local) |
| File uploads | FastAPI's `UploadFile`/`File`/`Form` |

### AI Models

| Model | Purpose | Size |
|-------|---------|------|
| `qwen3-vl:4b-instruct` | **Unified model** for both Vision OCR and Text Grading | 3.3 GB |

**Why a single model?**
- The VL model handles both OCR (PDFs/images) and text grading
- No need to download and maintain separate models
- Reduces total disk space required to 3.3 GB
- Clean JSON output with proper prompting
- More accurate grading (closer to human grading) than text-only models

---

## 3. Project Layout

```
backend/
├── app/
│   ├── main.py                  # FastAPI app instance, CORS, router registration
│   ├── database.py              # SQLAlchemy engine/session setup
│   ├── core/
│   │   └── config.py            # Settings (DATABASE_URL, Ollama config)
│   ├── models/
│   │   └── exam.py              # SQLAlchemy ORM models
│   ├── schemas/
│   │   ├── rubric.py            # Pydantic response schemas
│   │   ├── student.py           # Pydantic response schemas
│   │   └── grading.py           # Pydantic response schemas
│   ├── api/routes/
│   │   ├── rubrics.py           # POST /api/rubrics/upload
│   │   ├── students.py          # POST /api/students/upload
│   │   └── grading.py           # POST /api/grading/grade
│   └── services/
│       ├── file_service.py      # File upload, conversion, text extraction
│       ├── ocr_service.py       # Ollama vision calls for OCR
│       ├── grading_service.py   # Ollama text calls for grading
│       └── utils.py             # Shared utilities (JSON extraction, etc.)
├── uploads/
│   ├── rubrics/                 # Uploaded rubric files
│   └── students/                # Uploaded student answer files
├── requirements.txt             # Minimal dependencies (11 packages)
├── test_rubric.py               # Manual test for rubric extraction
├── test_grading.py              # Manual test for grading
└── .env                         # Environment variables
```

---

## 4. Data Model

Defined in `app/models/exam.py` using SQLAlchemy 2.0's `DeclarativeBase`.

### `DocumentStatus` (str enum)
`UPLOADED → PROCESSING → READY` (or `→ FAILED`)

### `Exam`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `title` | String, indexed | |

- `questions`: one-to-many → `Question`

### `Question`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `exam_id` | Integer FK → `exams.id`, nullable | |
| `question_number` | Integer, not nullable, indexed | |
| `prompt_text` | String, nullable | |

- `exam`: many-to-one → `Exam`
- `rubric`: one-to-one → `Rubric` (`uselist=False`)
- `student_answers`: one-to-many → `StudentAnswer`

### `Rubric`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `question_id` | Integer FK → `questions.id`, unique | One rubric per question |
| `file_path` | String | Path to uploaded file |
| `structured_data` | JSON | `[{id, criterion, points}]` |
| `ocr_status` | Enum(`DocumentStatus`) | Defaults to `UPLOADED` |

### `StudentAnswer`

| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer PK | |
| `question_id` | Integer FK → `questions.id` | |
| `student_name` | String | |
| `file_path` | String | Path to uploaded file |
| `structured_data` | JSON | `{"raw_text": "..."}` |
| `ocr_status` | Enum(`DocumentStatus`) | Defaults to `UPLOADED` |

---

## 5. Configuration

### Environment Variables (`.env`)

```env
DATABASE_URL=sqlite:///./exam_grader.db  # or postgresql://...
OLLAMA_URL=http://localhost:11434/api/chat
OLLAMA_VISION_MODEL=qwen3-vl:4b-instruct
OLLAMA_TEXT_MODEL=qwen3-vl:4b-instruct   # Same model for both!
UPLOAD_DIR=uploads
```

### Database

The application supports both SQLite (development) and PostgreSQL (production). Tables are created automatically on startup via `Base.metadata.create_all()`.

---

## 6. API Endpoints

### `POST /api/rubrics/upload`

**Form data:** `question_id: int`, `file: UploadFile`

Uploads a rubric file and processes it in the background.

### `POST /api/students/upload`

**Form data:** `question_id: int`, `student_name: str`, `file: UploadFile`

Uploads a student answer file and extracts text in the background.

### `POST /api/grading/grade`

**Form data:** `student_answer_id: int`

Grades a student answer against its rubric.

### `GET /`

Health check endpoint.

---

## 7. Services (Business Logic)

### 7.1 `file_service.py`

| Function | Description |
|----------|-------------|
| `save_file(file, folder)` | Validates file extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.docx`, `.txt`, `.csv`). Saves with **UUID prefix** to prevent overwrites. |
| `convert_file_to_base64_images(file_path, target_dpi=150)` | Converts PDFs to PNG images at 150 DPI using PyMuPDF. Returns base64-encoded images for Vision AI. |
| `extract_text_from_document(file_path)` | Extracts text from DOCX (via `python-docx`) or TXT/CSV (via UTF-8 read). |
| `clean_filename(filename)` | Sanitizes filenames by removing problematic characters. |

---

### 7.2 `ocr_service.py`

Communicates with Ollama at `http://localhost:11434/api/chat` (configurable via `config.py`).

**Model Used:**
| Model | Purpose |
|-------|---------|
| `qwen3-vl:4b-instruct` | **Unified model** - handles both Vision OCR and text-based rubric structuring |

**Functions:**

| Function | Description |
|----------|-------------|
| `process_rubric_ocr(images_base64)` | Sends images to `qwen3-vl:4b-instruct` with `format: "json"`. Extracts rubric criteria as `[{question_id, id, criterion, points}]`. Timeout: 120s. |
| `structure_rubric_text(raw_text)` | Sends raw text to `qwen3-vl:4b-instruct` to structure rubric JSON. Used for DOCX/TXT/CSV fast path. Timeout: 120s. |
| `process_student_ocr(images_base64)` | Sends images to `qwen3-vl:4b-instruct` with plain OCR prompt. Returns raw extracted text (no JSON). Timeout: 120s. |

**JSON Extraction:** Uses `extract_json_from_text()` from `utils.py` — balanced brace matching that finds the first valid JSON object, handling multiple JSON objects or extra text.

---

### 7.3 `grading_service.py`

| Function | Description |
|----------|-------------|
| `grade_student_answer(rubric_json, student_text)` | Sends rubric + student text to `qwen3-vl:4b-instruct` for grading. Returns per-criterion scores with quotes and explanations. |

**Configuration:**

| Setting | Value |
|---------|-------|
| Model | `qwen3-vl:4b-instruct` |
| Temperature | `0.1` |
| Context window | `4096` |
| Max output tokens | `(len(rubric_json) * 60) + 200` |
| Timeout | `120` seconds |

**System Prompt Instructions:**
- Award full or zero points per criterion (no partial credit)
- Extract verbatim quote from student text, or `null` if missing
- Provide short explanation (max 5 words, in Indonesian)
- **CRITICAL:** Output ONLY valid JSON, no thinking or extra text

**Output Parsing:**
- Uses `extract_json_from_text()` from `utils.py`
- Fails with `HTTPException(500)` if JSON parsing fails

**Total Score Calculation:**
- **Computed server-side:** `sum(item["awarded_points"] for item in grades)`
- Not trusted from AI output (LLMs are unreliable at arithmetic)

**Why `qwen3-vl:4b-instruct`?**
- Single model for both OCR and grading (3.3 GB total)
- No need for separate text model
- More accurate grading (closer to human grading)
- Clean JSON output with proper prompting
- Eliminates "thinking mode" issues with proper system prompts

---

### 7.4 `utils.py`

Shared utility functions used across services:

| Function | Description |
|----------|-------------|
| `extract_json_from_text(text)` | Finds the FIRST valid JSON object using balanced brace matching. Handles multiple JSON objects or extra text. **Fixed: No longer uses greedy regex.** |
| `clean_filename(filename)` | Removes problematic characters (spaces, special characters) from filenames. |

---

## 8. Request/Response Schemas (Pydantic)

| Schema | File | Fields |
|--------|------|--------|
| `RubricResponse` | `schemas/rubric.py` | `id`, `question_id`, `structured_data: list[RubricItem]`, `file_path` |
| `RubricItem` | `schemas/rubric.py` | `id`, `criterion`, `points` |
| `StudentUploadResponse` | `schemas/student.py` | `id`, `question_id`, `student_name`, `file_path` |
| `GradingResult` | `schemas/grading.py` | `student_answer_id`, `total_score`, `grades: list[GradeItem]` |
| `GradeItem` | `schemas/grading.py` | `id`, `awarded_points`, `student_quote: str | None`, `explanation` |

All schemas use `from_attributes = True` for direct serialization from SQLAlchemy ORM objects.

---

## 9. Known Issues (All Fixed)

| Issue | Status | Fix |
|-------|--------|-----|
| Greedy JSON-extraction regex | ✅ **FIXED** | Replaced with balanced brace matching in `utils.py` |
| Silent file overwrite on upload | ✅ **FIXED** | Added UUID prefix (`a1b2c3d4_filename.pdf`) |
| Background task exception handling | ✅ **FIXED** | Added proper null checks before accessing variables |
| No timeout on Ollama calls | ✅ **FIXED** | Added `timeout=120` to all `requests.post()` calls |
| CORS + credentials mismatch | ✅ **FIXED** | Configured properly for development (`allow_origins=["http://localhost:3000"]`) |
| No uniqueness constraint on `Rubric.question_id` | ✅ **FIXED** | Added `unique=True` to the column definition |
| `import fitz` deprecation | ✅ **FIXED** | Changed to `import pymupdf` |
| Requirements.txt bloat (160 packages) | ✅ **FIXED** | Reduced to 11 essential packages |
| qwen3 thinking mode | ✅ **FIXED** | Proper prompting to force clean JSON output |
| Multiple models (disk space) | ✅ **FIXED** | Unified to single model: `qwen3-vl:4b-instruct` |

---

## 10. External Dependencies

None of these are included in the repo — they're expected to already exist in your environment.

### Required Services

| Service | Purpose | Default Location |
|---------|---------|------------------|
| **Ollama** | Local LLM runtime | `http://localhost:11434` |

### Required AI Models

Pull this model before running the application:

```bash
# Pull the unified Vision-Language model
ollama pull qwen3-vl:4b-instruct
```

**Note:** If the `ollama` command is not in your PATH, use the full path:

```bash
# Windows (typical installation)
& "C:\Users\ASUS\AppData\Local\Programs\Ollama\ollama.exe" pull qwen3-vl:4b-instruct
```

### Database Options

| Option | Usage |
|--------|-------|
| **SQLite** | Development (no setup needed) `sqlite:///./exam_grader.db` |
| **PostgreSQL** | Production `postgresql://user:pass@localhost:5432/exam_grader` |

### File System Requirements

- `uploads/rubrics/` — created automatically on first upload
- `uploads/students/` — created automatically on first upload
- Write permissions required in the `backend/` directory

### Minimum Requirements.txt (11 Packages)

```txt
fastapi==0.136.1
uvicorn==0.46.0
sqlalchemy==2.0.49
pydantic==2.13.3
pydantic-settings==2.14.0
python-dotenv==1.2.2
requests==2.32.5
pymupdf==1.28.0
python-docx==1.2.0
ollama==0.6.2
```

---

## Quick Start Checklist

- [ ] Python 3.12+ installed
- [ ] Ollama installed and running (`http://localhost:11434`)
- [ ] `qwen3-vl:4b-instruct` model pulled (`ollama pull qwen3-vl:4b-instruct`)
- [ ] Database configured (SQLite or PostgreSQL)
- [ ] `.env` file created with `DATABASE_URL` and model settings
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Server running (`uvicorn app.main:app --reload`)
- [ ] Tests passing (`python test_rubric.py`, `python test_grading.py`)
```

---