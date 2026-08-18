# Backend Documentation — Radiology Exam Grader API

This document describes the FastAPI backend in `exam_development/backend`: what it does, how requests flow through it, its data model, and every external dependency it relies on.

> **Scope note:** this backend is a self-contained system with its own Postgres database. It is *not* currently called by `frontend2` (which is a separate Next.js app with its own Prisma-managed database and its own `/api/parse` route that talks directly to Ollama). Treat this backend as an independent service unless/until something is wired to call it.

---

## 1. What it does

An API for semi-automated grading of free-text radiology exam answers:

1. A professor uploads a **rubric** (grading criteria) for a question — as a PDF, image, or DOCX/TXT/CSV.
2. The system uploads **student answers** to that same question — again as PDF, image, or DOCX/TXT/CSV.
3. In the background, both documents are converted into structured data: the rubric into a list of `{criterion, points}` items, and the student answer into raw text.
4. A grading endpoint compares the structured rubric against the student's extracted text, using a local LLM (via Ollama) to award points per-criterion, and returns a total score plus per-item quotes and explanations.

All AI work happens through a **local Ollama instance** — there is no cloud LLM API call anywhere in this backend.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Web framework | FastAPI (`fastapi==0.136.1`) |
| ASGI server | Uvicorn (`uvicorn==0.46.0`) |
| ORM | SQLAlchemy 2.0 (`SQLAlchemy==2.0.49`), using the modern `DeclarativeBase` style |
| Database | PostgreSQL, via `psycopg2-binary==2.9.12` |
| Config/env | `pydantic-settings==2.14.0` |
| Validation/serialization | Pydantic v2 (`pydantic==2.13.3`) |
| PDF rendering | PyMuPDF / `fitz` (`pymupdf==1.28.0`) — rasterizes PDF pages to PNG for vision-model input |
| DOCX text extraction | `python-docx==1.2.0` |
| LLM runtime | Ollama, called over HTTP (`requests==2.32.5`), models `qwen3-vl:4b-instruct` (vision) and `qwen3:4b` (text) |
| File uploads | FastAPI's `UploadFile`/`File`/`Form`, `python-multipart` |

`requirements.txt` is a full `pip freeze` (160 packages) generated on Windows — it's UTF-16-encoded with CRLF line endings. `pip install -r requirements.txt` handles this transparently; command-line tools like `grep`/`cat` will show garbled output unless you convert it first (e.g. `iconv -f UTF-16 -t UTF-8`).

---

## 3. Project layout

```
backend/
├── app/
│   ├── main.py                  # FastAPI app instance, CORS, router registration
│   ├── database.py               # SQLAlchemy engine/session setup
│   ├── core/
│   │   └── config.py              # Settings (reads DATABASE_URL from .env)
│   ├── models/
│   │   └── exam.py                # SQLAlchemy ORM models (Exam, Question, Rubric, StudentAnswer)
│   ├── schemas/
│   │   ├── rubric.py               # Pydantic response schema for rubrics
│   │   ├── student.py              # Pydantic response schema for student uploads
│   │   └── grading.py              # Pydantic response schema for grading results
│   ├── api/routes/
│   │   ├── rubrics.py              # POST /api/rubrics/upload
│   │   ├── students.py             # POST /api/students/upload
│   │   └── grading.py              # POST /api/grading/grade
│   └── services/
│       ├── file_service.py         # Save uploads, PDF→image conversion, DOCX/TXT/CSV text extraction
│       ├── ocr_service.py          # Ollama calls for rubric extraction + student OCR
│       └── grading_service.py      # Ollama call for grading
├── requirements.txt
├── test_grading.py                 # Manual dev script (not pytest), exercises grading against a running server
└── test_rubric.py                  # Manual dev script, exercises rubric extraction
```

There is no `alembic/` or migrations folder — schema is created directly via `Base.metadata.create_all()`. There is no `uploads/` folder committed, no `.env.example`, and no Dockerfile/compose file in the repo.

---

## 4. Data model

Defined in `app/models/exam.py`, using SQLAlchemy 2.0's `DeclarativeBase`.

### `DocumentStatus` (str enum)
Tracks the lifecycle of any uploaded document as it's processed in the background:
`UPLOADED → PROCESSING → READY` (or `→ FAILED`).

### `Exam`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `title` | String, indexed | |

- `questions`: one-to-many → `Question`

### `Question`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `exam_id` | Integer FK → `exams.id`, **nullable** | Nullable because a professor can create questions/rubrics before an `Exam` exists |
| `question_number` | Integer, **not nullable**, indexed | Must match the AI-extracted question numbering |
| `prompt_text` | String, nullable | The question text itself, added later |

- `exam`: many-to-one → `Exam`
- `rubric`: one-to-one → `Rubric` (`uselist=False`)
- `student_answers`: one-to-many → `StudentAnswer`

### `Rubric`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `question_id` | Integer FK → `questions.id` | One rubric per question (enforced at the application level, not a DB unique constraint) |
| `file_path` | String | Path to the uploaded rubric file on disk |
| `structured_data` | JSON | AI-extracted `[{id, criterion, points}]` |
| `ocr_status` | Enum(`DocumentStatus`) | Defaults to `UPLOADED` |

### `StudentAnswer`
| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | |
| `question_id` | Integer FK → `questions.id` | |
| `student_name` | String | e.g. `"Student 01"` |
| `file_path` | String | Path to the uploaded answer file |
| `structured_data` | JSON | Stores `{"raw_text": "..."}` after OCR |
| `ocr_status` | Enum(`DocumentStatus`) | Defaults to `UPLOADED` |

**Note:** `Rubric.question_id` and `StudentAnswer.question_id` have no `unique=True` or DB-level constraint — uniqueness (e.g. "one rubric per question") is only enforced by the route logic (see §6.1), not by the schema itself.

---

## 5. Configuration & startup (`main.py`, `database.py`, `core/config.py`)

- `Settings` (Pydantic `BaseSettings`) requires exactly one env var: `DATABASE_URL`, read from a `.env` file in `backend/` (via `pydantic-settings`'s `env_file` config). There's no default — startup fails immediately if `DATABASE_URL` is unset.
- `database.py` creates a synchronous SQLAlchemy `engine` and `SessionLocal` sessionmaker from that URL, and defines the `Base` declarative class every model inherits from.
- `get_db()` is the FastAPI dependency used by request-scoped routes — yields a session and always closes it in a `finally` block.
- On import, `main.py` calls `Base.metadata.create_all(bind=engine)` — **tables are created automatically on startup** if they don't exist. There's no migration system, so schema changes to existing tables (e.g. adding a column) won't apply automatically to an already-created database; you'd need to drop/recreate or hand-write the ALTER.
- CORS is wide open: `allow_origins=["*"]`, `allow_credentials=True`, all methods/headers allowed. (These two settings together are actually incompatible per the CORS spec for credentialed requests — browsers will reject an actual credentialed cross-origin call under this config even though FastAPI lets you set it. It's a no-op today only because nothing sends credentials cross-origin yet.)
- Three routers are mounted:
  - `rubrics.router` → prefix `/api/rubrics`
  - `students.router` → prefix `/api/students`
  - `grading.router` → prefix `/api/grading`
- `GET /` is a simple healthcheck returning `{"status": "success", "message": "Welcome to the Radiology Grader API!"}`.

---

## 6. API endpoints

### 6.1 `POST /api/rubrics/upload`

**Form data:** `question_id: int`, `file: UploadFile`

Flow:
1. Looks up the `Question` by `question_id`; 404s if not found.
2. Saves the uploaded file to disk via `save_file(file, folder="rubrics")` (see §7.1).
3. If a `Rubric` already exists for this `question_id`, it's **overwritten in place** (new `file_path`, status reset to `UPLOADED`, `structured_data` cleared to `None`) — this is how "re-upload a rubric" is implemented. If none exists, a new `Rubric` row is created.
4. Commits, refreshes, then schedules `rubric_background_task(file_path, rubric_id)` as a FastAPI `BackgroundTask` — meaning it runs *after* the HTTP response is sent, in the same process.
5. Returns the `Rubric` row immediately (status will still show `UPLOADED` or `PROCESSING` at this point — the client needs to poll or re-fetch to see `READY`/`FAILED`).

**Background task** (`rubric_background_task`, runs in its own DB session):
1. Sets status to `PROCESSING`, commits.
2. Branches on file extension:
   - `.docx` / `.txt` / `.csv` → `extract_text_from_document()` pulls raw text instantly (no AI), then `structure_rubric_text()` sends that text to the **fast text-only model** (`qwen3:4b`) to turn it into `{criterion, points}` JSON.
   - anything else (`.pdf`, `.png`, `.jpg`, `.jpeg`) → `convert_file_to_base64_images()` rasterizes the file to PNG images, then `process_rubric_ocr()` sends the images to the **vision model** (`qwen3-vl:4b-instruct`) to extract the same JSON directly from the images.
3. On success: `structured_data` set, status → `READY`.
4. On any exception: status → `FAILED` (see known issue in §9).

### 6.2 `POST /api/students/upload`

**Form data:** `question_id: int`, `student_name: str`, `file: UploadFile`

Flow: same overall shape as rubrics, except a `StudentAnswer` row is always **created new** (no overwrite/reuse check — a student can be uploaded multiple times for the same question, producing multiple rows).

**Background task** (`student_background_task`): same file-type branching as rubrics, but simpler — output is always raw text:
- `.docx`/`.txt`/`.csv` → `extract_text_from_document()` directly, no AI call at all.
- else → vision model via `process_student_ocr()`, which returns raw extracted text (not JSON — no `format: "json"` in that Ollama call).

Result is stored as `structured_data = {"raw_text": extracted_text}`.

### 6.3 `POST /api/grading/grade`

**Form data:** `student_answer_id: int`

Flow:
1. Looks up the `StudentAnswer`; 404s if not found.
2. Looks up the `Rubric` for that answer's `question_id`; 404s if not found.
3. Guards: if either the rubric or the student answer isn't `READY` yet, returns **409 Conflict** with the current status in the message. (This means the client is responsible for polling upload status before calling grade — there's no server-side wait/blocking.)
4. Pulls `student_answer.structured_data["raw_text"]` and `rubric.structured_data` (the criteria list).
5. Calls `grade_student_answer()` (see §7.3), which hits the **text-only model** with both the rubric and the student's answer text, asking for a per-criterion score.
6. Returns `{student_answer_id, total_score, grades}` matching `GradingResult`.

---

## 7. Services (business logic)

### 7.1 `file_service.py`

- **`save_file(file, folder)`** — validates extension against an allow-list (`.pdf .png .jpg .jpeg .docx .txt .csv`), writes to `uploads/{folder}/{filename}` (spaces replaced with underscores), returns the path. **No uniqueness is added to the filename** — a second upload with the same original filename silently overwrites the first file on disk (the DB row is separate and unaffected, but the file it points to gets clobbered). `uploads/` is created with `os.makedirs(..., exist_ok=True)` if missing, so no manual setup is needed beyond having write permission.
- **`convert_file_to_base64_images(file_path, target_dpi=150)`** — for PDFs, opens with PyMuPDF and rasterizes every page to a PNG at 150 DPI, base64-encoding each; for a single image file, just base64-encodes it directly. Raises `HTTPException(400)` if no images resulted.
- **`extract_text_from_document(file_path)`** — DOCX via `python-docx` (joins all paragraph text with newlines), TXT/CSV via plain UTF-8 read. Raises `HTTPException(400)` if the extracted text is empty/whitespace-only.

### 7.2 `ocr_service.py`

Talks to Ollama at `http://localhost:11434/api/chat` (hardcoded, not configurable via env).

- **`extract_json_from_text(text)`** — pulls a JSON object out of an LLM response using the regex `\{.*\}` with `re.DOTALL`. This is a **greedy** match spanning from the first `{` to the *last* `}` in the entire string — see known issue in §9.
- **`process_rubric_ocr(images_base64)`** — vision-model call (`qwen3-vl:4b-instruct`), `format: "json"`, temperature `0.1`, system prompt instructs it to extract *every* rubric criterion as `{question_id, id, criterion, points}`. Returns `parsed["rubrics"]` (empty list if key missing).
- **`structure_rubric_text(raw_text)`** — same rubric-extraction prompt but sent as plain text to the **text-only** model (`qwen3:4b`) instead of images — used for the DOCX/TXT/CSV fast path.
- **`process_student_ocr(images_base64)`** — vision-model call with a plain OCR system prompt ("output only the exact raw text"); no `format: "json"` here, so this returns the model's raw text response directly (no JSON parsing).

### 7.3 `grading_service.py`

- **`grade_student_answer(rubric_json, student_text)`** — text-only model (`qwen3:4b`) call.
  - `num_predict` (max output tokens) is dynamically sized as `(len(rubric_json) * 60) + 200` — scales the token budget to the number of rubric criteria so grading many criteria doesn't get truncated.
  - `num_ctx` fixed at 4096, `temperature` 0.1.
  - System prompt asks for full/zero points per criterion (not partial credit), a verbatim quote or `null`, and a short (max-5-word, Indonesian-language) explanation per item.
  - Parses the response with the same greedy-regex `extract_json_from_text` helper (a separate copy of the one in `ocr_service.py`).
  - If JSON parsing fails, raises `HTTPException(500, "AI did not return valid JSON.")`.
  - **Total score is computed server-side** (`sum(item["awarded_points"] for item in grades)`) rather than trusting whatever total the model might state — this is a deliberate correctness choice, since LLMs are unreliable at arithmetic.

---

## 8. Request/response schemas (Pydantic)

- **`RubricResponse`** (`schemas/rubric.py`): `id, question_id, structured_data: list[RubricItem], file_path`, with `RubricItem = {id, criterion, points}`. `from_attributes = True` lets it serialize directly from the SQLAlchemy `Rubric` ORM object.
- **`StudentUploadResponse`** (`schemas/student.py`): `id, question_id, student_name, file_path`. Also `from_attributes = True`.
- **`GradingResult`** (`schemas/grading.py`): `student_answer_id, total_score, grades: list[GradeItem]`, with `GradeItem = {id, awarded_points, student_quote: str | None, explanation}`.

---

## 9. Known issues / things to be aware of

These don't block getting the server running, but are worth knowing about:

1. **Greedy JSON-extraction regex** (`ocr_service.py` and `grading_service.py`, both have their own copy of `extract_json_from_text`): `re.search(r'\{.*\}', text, re.DOTALL)` matches from the *first* `{` to the *last* `}` in the whole response. If the model ever emits two concatenated JSON objects, or any trailing `{`/`}` characters after the real JSON block, parsing breaks. `frontend2`'s worklog documents hitting and fixing this exact failure mode in its own (separate) parsing code — this backend's two copies remain unfixed.
2. **Silent file overwrite on upload** (`file_service.save_file`): filenames aren't made unique (no UUID/timestamp/ID prefix), so two uploads sharing an original filename overwrite each other on disk, even though they get distinct DB rows.
3. **Background task exception handling assumes the initial query succeeded**: in both `rubric_background_task` and `student_background_task`, if `db.query(...).first()` returns `None` (e.g. the row was deleted mid-flight), the very next line (`db_rubric.ocr_status = ...`) throws `AttributeError` — which is then *also* thrown again in the `except` block trying to do the same thing, since the variable is still `None`. Net effect: the task dies with an unhandled exception in the background thread pool, and the row's status is left at whatever it was (never gets set to `FAILED`).
4. **No timeout on Ollama calls**: every `requests.post(OLLAMA_URL, ...)` call across `ocr_service.py` and `grading_service.py` has no `timeout=`. If Ollama hangs (model still loading, out of memory, etc.), the request — or background task — hangs indefinitely.
5. **CORS + credentials combination**: `allow_origins=["*"]` with `allow_credentials=True` is spec-invalid for credentialed cross-origin requests; browsers will reject it if you ever start sending cookies/auth headers cross-origin.
6. **No uniqueness constraint on `Rubric.question_id`** at the DB level — "one rubric per question" is only true because the upload route checks for an existing row first; a direct DB insert or a race condition could create duplicates.
7. **`import fitz`** in `file_service.py` triggers a deprecation warning on the installed PyMuPDF version (`1.28.0`) — recommended replacement is `import pymupdf`, same API.
8. **`requirements.txt` is UTF-16 with CRLF**, and is a full 160-package environment dump rather than a hand-scoped list — pip handles it, but shell tools and some Docker build patterns won't without an encoding conversion step first.

---

## 10. External dependencies you must provide yourself

None of these are included in the repo — they're expected to already exist in your environment:

- A running **PostgreSQL** instance, reachable at the URL you put in `backend/.env` as `DATABASE_URL`.
- A running **Ollama** instance at `http://localhost:11434`, with both `qwen3-vl:4b-instruct` and `qwen3:4b` pulled (`ollama pull <name>`) — the code does not check for their presence and will fail with a request error if either tag is missing.
- An `uploads/rubrics` and `uploads/students` directory under wherever the process's working directory is — created automatically on first upload if missing, but the process needs filesystem write permission there.
