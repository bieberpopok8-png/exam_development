export type Language = "en" | "id"

export const translations = {
  // Home
  "app.name": { en: "Gradebook", id: "Gradebook" },
  "home.exams": { en: "Exams", id: "Ujian" },
  "home.subtitle": {
    en: "search, sort, and open one to grade",
    id: "cari, urutkan, dan buka untuk dinilai",
  },
  "home.search.placeholder": {
    en: "Search exams by name or description…",
    id: "Cari ujian berdasarkan nama atau deskripsi…",
  },
  "home.newExam": { en: "New exam", id: "Ujian baru" },
  "home.result": { en: "result", id: "hasil" },
  "home.results": { en: "results", id: "hasil" },
  "home.noStudents": { en: "No students", id: "Belum ada siswa" },
  "home.addStudentsToGrade": {
    en: "Add students to grade",
    id: "Tambah siswa untuk dinilai",
  },
  "home.complete": { en: "complete", id: "selesai" },
  "home.graded": { en: "graded", id: "dinilai" },
  "home.question": { en: "question", id: "soal" },
  "home.questions": { en: "questions", id: "soal" },
  "home.student": { en: "student", id: "siswa" },
  "home.students": { en: "students", id: "siswa" },
  "home.noDueDate": { en: "No due date", id: "Tanpa tenggat" },
  "home.dueToday": { en: "Due today", id: "Jatuh tempo hari ini" },
  "home.dueTomorrow": { en: "Due tomorrow", id: "Jatuh tempo besok" },
  "home.dayOverdue": { en: "day overdue", id: "hari terlambat" },
  "home.daysOverdue": { en: "days overdue", id: "hari terlambat" },
  "home.dueIn": { en: "Due in", id: "Jatuh tempo dalam" },
  "home.days": { en: "days", id: "hari" },
  "home.noDescription": { en: "No description", id: "Tanpa deskripsi" },

  // Sort
  "sort.newest": { en: "Newest first", id: "Terbaru" },
  "sort.oldest": { en: "Oldest first", id: "Terlama" },
  "sort.dueSoon": { en: "Closest due date", id: "Tenggat terdekat" },
  "sort.dueLate": { en: "Furthest due date", id: "Tenggat terjauh" },
  "sort.name": { en: "Name A–Z", id: "Nama A–Z" },
  "sort.progressMost": { en: "Progress: most graded", id: "Progres: paling banyak dinilai" },
  "sort.progressLeast": { en: "Progress: least graded", id: "Progres: paling sedikit dinilai" },

  // Calendar
  "cal.dueThisMonth": {
    en: "exam due this month",
    id: "ujian jatuh tempo bulan ini",
  },
  "cal.examsDueThisMonth": {
    en: "exams due this month",
    id: "ujian jatuh tempo bulan ini",
  },
  "cal.today": { en: "Today", id: "Hari ini" },
  "cal.noDueDate": { en: "No due date", id: "Tanpa tenggat" },
  "cal.more": { en: "more", id: "lainnya" },
  "cal.graded": { en: "graded", id: "dinilai" },
  "cal.noStudents": { en: "no students", id: "belum ada siswa" },

  // Exam view
  "exam.rubric": { en: "Rubric", id: "Rubrik" },
  "exam.answers": { en: "Answers", id: "Jawaban" },
  "exam.gradingCriteria": { en: "Grading criteria", id: "Kriteria penilaian" },
  "exam.studentAnswers": { en: "Student answers", id: "Jawaban siswa" },
  "exam.blindGrading": { en: "Blind grading — names hidden", id: "Penilaian buta — nama tersembunyi" },
  "exam.ptsTotal": { en: "pts total", id: "poin total" },
  "exam.dragToReorder": { en: "Drag the handle to reorder", id: "Seret untuk mengurutkan" },
  "exam.noQuestionsYet": { en: "No questions yet. Add the first one.", id: "Belum ada soal. Tambahkan soal pertama." },
  "exam.addQuestion": { en: "Add question", id: "Tambah soal" },
  "exam.of": { en: "of", id: "dari" },
  "exam.graded": { en: "graded", id: "dinilai" },

  // Answer view
  "answer.exportCsv": { en: "Export CSV", id: "Ekspor CSV" },
  "answer.bulkImport": { en: "Bulk import", id: "Impor massal" },
  "answer.nextUngraded": { en: "Next ungraded", id: "Berikutnya belum dinilai" },
  "answer.markAllGraded": { en: "Mark all graded", id: "Tandai semua dinilai" },
  "answer.suggestAll": { en: "Suggest all", id: "Sarankan semua" },
  "answer.suggesting": { en: "Suggesting", id: "Membuat saran" },
  "answer.answerNotes": { en: "Answer notes", id: "Catatan jawaban" },
  "answer.score": { en: "Score", id: "Nilai" },
  "answer.max": { en: "Max", id: "Maks" },
  "answer.suggest": { en: "Suggest", id: "Sarankan" },
  "answer.suggest.tooltip": {
    en: "AI-suggest a score by comparing the answer to the rubric",
    id: "AI menyarankan nilai dengan membandingkan jawaban ke rubrik",
  },
  "answer.markGraded": { en: "Mark graded", id: "Tandai dinilai" },
  "answer.graded": { en: "Graded", id: "Dinilai" },
  "answer.feedback": { en: "Feedback", id: "Umpan balik" },
  "answer.feedbackPlaceholder": {
    en: "Feedback for the student…",
    id: "Umpan balik untuk siswa…",
  },
  "answer.notesPlaceholder": {
    en: "Notes on the student's answer…",
    id: "Catatan tentang jawaban siswa…",
  },
  "answer.excerpt": { en: "Student's full answer", id: "Jawaban lengkap siswa" },
  "answer.excerptHint": {
    en: "Click a table row to highlight that answer here",
    id: "Klik baris tabel untuk menyorot jawaban di sini",
  },

  // Rubric view
  "rubric.rubricNotes": { en: "Rubric notes", id: "Catatan rubrik" },
  "rubric.maxScore": { en: "Max score", id: "Nilai maksimum" },
  "rubric.notesPlaceholder": {
    en: "Describe the grading criteria for this question…",
    id: "Jelaskan kriteria penilaian untuk soal ini…",
  },

  // File extract
  "extract.uploadRubric": { en: "Upload rubric file", id: "Unggah file rubrik" },
  "extract.uploadAnswer": { en: "Upload answer file", id: "Unggah file jawaban" },
  "extract.autoRubric": { en: "Auto-extracts criteria & points via AI", id: "Ekstrak otomatis kriteria & poin via AI" },
  "extract.autoAnswer": { en: "Auto-extracts questions & answers via AI", id: "Ekstrak otomatis soal & jawaban via AI" },
  "extract.uploading": { en: "Uploading…", id: "Mengunggah…" },
  "extract.processing": { en: "AI extracting", id: "AI mengekstrak" },
  "extract.processingRubric": { en: "AI extracting criteria…", id: "AI mengekstrak kriteria…" },
  "extract.processingAnswer": { en: "AI extracting answers…", id: "AI mengekstrak jawaban…" },
  "extract.ready": { en: "Ready", id: "Siap" },
  "extract.criteriaExtracted": { en: "criteria extracted", id: "kriteria diekstrak" },
  "extract.itemsExtracted": { en: "items extracted", id: "item diekstrak" },
  "extract.extractionFailed": { en: "Extraction failed", id: "Ekstraksi gagal" },
  "extract.retryExtraction": { en: "Retry extraction", id: "Coba ekstraksi lagi" },
  "extract.replaceFile": { en: "Replace file", id: "Ganti file" },
  "extract.replace": { en: "Replace", id: "Ganti" },
  "extract.reExtract": { en: "Re-extract", id: "Ekstrak ulang" },
  "extract.remove": { en: "Remove", id: "Hapus" },

  // Table headers
  "table.criterion": { en: "Criterion", id: "Kriteria" },
  "table.points": { en: "Points", id: "Poin" },
  "table.question": { en: "Question", id: "Soal" },
  "table.answer": { en: "Answer", id: "Jawaban" },
  "table.value": { en: "Value", id: "Nilai Max" },
  "table.grade": { en: "Grade", id: "Nilai" },

  // Student panel
  "panel.students": { en: "Students", id: "Siswa" },
  "panel.anonymized": { en: "Anonymized IDs only — names never shown", id: "ID anonim — nama tidak pernah ditampilkan" },
  "panel.addStudent": { en: "Add student", id: "Tambah siswa" },
  "panel.notGraded": { en: "Not graded", id: "Belum dinilai" },

  // Shortcuts
  "shortcuts.title": { en: "Keyboard shortcuts", id: "Pintasan keyboard" },
  "shortcuts.navigation": { en: "Navigation", id: "Navigasi" },
  "shortcuts.tabsRows": { en: "Tabs & rows", id: "Tab & baris" },

  // Dialogs
  "dialog.newExam": { en: "New exam", id: "Ujian baru" },
  "dialog.duplicateExam": { en: "Duplicate exam", id: "Duplikat ujian" },
  "dialog.name": { en: "Name", id: "Nama" },
  "dialog.description": { en: "Description", id: "Deskripsi" },
  "dialog.dueDate": { en: "Due date", id: "Tenggat" },
  "dialog.accent": { en: "Accent", id: "Warna aksen" },
  "dialog.cancel": { en: "Cancel", id: "Batal" },
  "dialog.createExam": { en: "Create exam", id: "Buat ujian" },
  "dialog.duplicate": { en: "Duplicate", id: "Duplikat" },
  "dialog.alsoCopyStudents": { en: "Also copy students", id: "Salin juga siswa" },
  "dialog.deleteExam": { en: "Delete this exam?", id: "Hapus ujian ini?" },
  "dialog.delete": { en: "Delete", id: "Hapus" },
  "dialog.editExam": { en: "Edit exam", id: "Edit ujian" },
  "dialog.saveChanges": { en: "Save changes", id: "Simpan perubahan" },
} as const

export type TranslationKey = keyof typeof translations
