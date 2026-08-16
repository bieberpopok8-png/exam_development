import { db } from "@/lib/db"

const EXAM_COLORS = ["emerald", "amber", "rose", "violet", "cyan", "orange"]

export async function seedDatabase() {
  const count = await db.exam.count()
  if (count > 0) return false

  const now = new Date()
  const day = (n: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + n)
    return d
  }

  const exams = [
    {
      name: "Kimia 2 — Ujian Tengah Semester",
      description: "Stoikiometri, larutan, dan termokimia.",
      dueDate: day(3),
      color: "emerald",
      rubricNotes:
        "Hitung mol dari 36 g air (H₂O). Tunjukkan langkah perhitungan.",
      maxScore: 20,
    },
    {
      name: "Fisika 1 — Kuis Dinamika",
      description: "Hukum Newton dan aplikasi pada sistem benda.",
      dueDate: day(7),
      color: "amber",
      rubricNotes: "Soal gaya normal pada bidang miring tanpa gesekan.",
      maxScore: 25,
    },
    {
      name: "Matematika Diskrit",
      description: "Logika, himpunan, dan teori graf dasar.",
      dueDate: day(-2),
      color: "rose",
      rubricNotes: "Buktikan de Morgan: ¬(p∧q) ≡ ¬p∨¬q.",
      maxScore: 20,
    },
    {
      name: "Biologi Sel",
      description: "Struktur dan fungsi organel sel eukariotik.",
      dueDate: day(12),
      color: "cyan",
      rubricNotes: "Jelaskan fungsi mitokondria dan ribosom.",
      maxScore: 15,
    },
    {
      name: "Pemrograman Dasar",
      description: "Loop, fungsi, dan struktur data sederhana.",
      dueDate: day(1),
      color: "violet",
      rubricNotes: "Implementasikan fungsi factorial(n) secara rekursif.",
      maxScore: 20,
    },
  ]

  for (let i = 0; i < exams.length; i++) {
    const e = exams[i]
    const { rubricNotes: _rn, maxScore: _ms, ...examFields } = e
    void _rn
    void _ms
    const exam = await db.exam.create({ data: examFields })
    const q = await db.question.create({
      data: { examId: exam.id, number: 1, maxScore: e.maxScore, rubricNotes: e.rubricNotes },
    })
    // a few anonymized students, each with their own answer
    const n = 3 + (i % 2)
    for (let s = 0; s < n; s++) {
      const student = await db.student.create({
        data: {
          examId: exam.id,
          anonymizedId: `Student ${String(s + 1).padStart(2, "0")}`,
          order: s,
        },
      })
      // varied scoring state: first student fully graded, second partial, rest ungraded
      const fullyGraded = s === 0
      const partial = s === 1
      await db.answer.create({
        data: {
          questionId: q.id,
          studentId: student.id,
          notes: fullyGraded
            ? "Langkah perhitungan lengkap dan benar."
            : partial
            ? "Sebagian langkah benar, ada kesalahan di konversi satuan."
            : "",
          score: fullyGraded ? e.maxScore : partial ? e.maxScore * 0.6 : null,
          feedback: fullyGraded
            ? "Kerja bagus, sangat rapi."
            : partial
            ? "Perhatikan kembali konversi mol ke gram."
            : "",
          graded: fullyGraded || partial,
        },
      })
    }
  }
  void EXAM_COLORS
  return true
}
