import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return ""
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

// GET /api/export?examId=...  → CSV of per-student grades
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const examId = url.searchParams.get("examId")
  if (!examId) {
    return NextResponse.json({ error: "examId required" }, { status: 400 })
  }

  const exam = await db.exam.findUnique({
    where: { id: examId },
    include: {
      questions: { orderBy: { number: "asc" } },
      students: { orderBy: { order: "asc" } },
    },
  })
  if (!exam) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const questionIds = exam.questions.map((q) => q.id)
  const answers = questionIds.length
    ? await db.answer.findMany({ where: { questionId: { in: questionIds } } })
    : []

  const header = [
    "Student ID",
    ...exam.questions.map((q) => `Q${q.number} (/${q.maxScore ?? ""})`),
    "Total",
    "Max",
    "Graded",
  ]

  const rows: string[] = [header.map(csvEscape).join(",")]

  for (const s of exam.students) {
    let total = 0
    let max = 0
    let allGraded = exam.questions.length > 0
    const cells: string[] = [s.anonymizedId]
    for (const q of exam.questions) {
      const a = answers.find(
        (x) => x.questionId === q.id && x.studentId === s.id
      )
      const score = a?.score ?? null
      if (score != null) total += score
      max += q.maxScore ?? 0
      if (!a?.graded) allGraded = false
      cells.push(score != null ? String(score) : "")
    }
    cells.push(String(total))
    cells.push(String(max))
    cells.push(allGraded ? "yes" : "partial")
    rows.push(cells.map(csvEscape).join(","))
  }

  const csv = rows.join("\n")
  const safeName = exam.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}-grades.csv"`,
    },
  })
}
