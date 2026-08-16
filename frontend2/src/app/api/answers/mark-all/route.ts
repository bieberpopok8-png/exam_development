import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Mark all of a student's answers (for one exam) as graded.
// Body: { examId, studentId, graded?: boolean (default true) }
// Optionally sets score = maxScore for any ungraded answer with no score.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { examId, studentId, graded } = body ?? {}
  if (!examId || !studentId) {
    return NextResponse.json(
      { error: "examId and studentId required" },
      { status: 400 }
    )
  }
  const wantGraded = graded !== false

  // Get this exam's questions (for maxScore) and existing answers for the student
  const questions = await db.question.findMany({
    where: { examId },
    select: { id: true, maxScore: true },
  })
  const qIds = questions.map((q) => q.id)
  const maxByQ = new Map(questions.map((q) => [q.id, q.maxScore ?? 0]))

  const existing = await db.answer.findMany({
    where: { studentId, questionId: { in: qIds } },
  })

  // Update existing answers
  await db.$transaction(
    existing.map((a) =>
      db.answer.update({
        where: { id: a.id },
        data: {
          graded: wantGraded,
          // when marking graded and score is empty, default to max
          ...(wantGraded && a.score == null
            ? { score: maxByQ.get(a.questionId) ?? null }
            : {}),
        },
      })
    )
  )

  // Create missing answers (for questions the student has no answer row for yet)
  const existingQ = new Set(existing.map((a) => a.questionId))
  const missing = qIds.filter((id) => !existingQ.has(id))
  if (missing.length) {
    await db.answer.createMany({
      data: missing.map((qid) => ({
        questionId: qid,
        studentId,
        graded: wantGraded,
        score: wantGraded ? maxByQ.get(qid) ?? null : null,
      })),
    })
  }

  return NextResponse.json({
    ok: true,
    marked: existing.length + missing.length,
    graded: wantGraded,
  })
}
