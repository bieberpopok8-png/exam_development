import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Add anonymized student(s) to an exam.
// Body: { examId: string, count?: number }  — count defaults to 1 (max 100).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const examId = body?.examId
  if (!examId) return NextResponse.json({ error: "examId required" }, { status: 400 })

  const count = Math.max(1, Math.min(100, Number(body?.count) || 1))
  const existing = await db.student.count({ where: { examId } })

  const created = []
  for (let i = 0; i < count; i++) {
    const n = existing + i + 1
    created.push(
      db.student.create({
        data: {
          examId,
          order: existing + i,
          anonymizedId: `Student ${String(n).padStart(2, "0")}`,
        },
      })
    )
  }
  const students = await Promise.all(created)
  return NextResponse.json(
    count === 1 ? students[0] : students,
    { status: 201 }
  )
}
