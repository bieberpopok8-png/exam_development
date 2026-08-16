import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

// Duplicate an exam's rubric (questions + rubric files/notes/maxScore) into a
// new exam. Optionally also clone students (without their answers — fresh
// grading). Body: { name?, description?, dueDate?, color?, includeStudents? }
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const src = await db.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { number: "asc" } },
      students: { orderBy: { order: "asc" } },
    },
  })
  if (!src) {
    return NextResponse.json({ error: "Source exam not found" }, { status: 404 })
  }

  const name = (body?.name ?? `${src.name} (copy)`).toString().trim() || `${src.name} (copy)`
  const description = (body?.description ?? src.description).toString()
  const dueDate = body?.dueDate ? new Date(body.dueDate) : null
  const color = (body?.color ?? src.color).toString()
  const includeStudents = body?.includeStudents === true

  const created = await db.exam.create({
    data: { name, description, dueDate, color },
  })

  // Clone questions (rubric side only — no answers carry over)
  for (const q of src.questions) {
    await db.question.create({
      data: {
        examId: created.id,
        number: q.number,
        rubricFileName: q.rubricFileName,
        rubricFileType: q.rubricFileType,
        rubricFileData: q.rubricFileData,
        rubricNotes: q.rubricNotes,
        rubricParsed: q.rubricParsed,
        maxScore: q.maxScore,
      },
    })
  }

  // Optionally clone students (anonymized IDs only, fresh answers)
  if (includeStudents) {
    for (const s of src.students) {
      await db.student.create({
        data: {
          examId: created.id,
          anonymizedId: s.anonymizedId,
          order: s.order,
        },
      })
    }
  }

  return NextResponse.json(
    { id: created.id, name: created.name, questionsCloned: src.questions.length, studentsCloned: includeStudents ? src.students.length : 0 },
    { status: 201 }
  )
}
