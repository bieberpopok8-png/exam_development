import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const exam = await db.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { number: "asc" } },
      students: { orderBy: { order: "asc" } },
    },
  })
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Answers belong to (question, student); fetch them via the question ids
  // and merge into the payload so the client gets a flat answers array.
  const questionIds = exam.questions.map((q) => q.id)
  const answers = questionIds.length
    ? await db.answer.findMany({ where: { questionId: { in: questionIds } } })
    : []

  return NextResponse.json({ ...exam, answers })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  if (typeof body.name === "string") data.name = body.name
  if (typeof body.description === "string") data.description = body.description
  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null
  }
  if (typeof body.color === "string") data.color = body.color
  const exam = await db.exam.update({ where: { id }, data })
  return NextResponse.json(exam)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  await db.exam.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
