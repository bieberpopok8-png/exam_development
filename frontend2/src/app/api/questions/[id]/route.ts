import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  const allowed = [
    "rubricFileName",
    "rubricFileType",
    "rubricFileData",
    "rubricNotes",
    "rubricParsed",
    "rubricExtract",
    "rubricStatus",
    "maxScore",
    "number",
  ]
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k]
  }
  const q = await db.question.update({ where: { id }, data })
  return NextResponse.json(q)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const q = await db.question.delete({ where: { id } })
  // renumber remaining
  const rest = await db.question.findMany({
    where: { examId: q.examId },
    orderBy: { number: "asc" },
  })
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].number !== i + 1) {
      await db.question.update({ where: { id: rest[i].id }, data: { number: i + 1 } })
    }
  }
  return NextResponse.json({ ok: true })
}
