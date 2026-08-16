import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}
  if (typeof body.score === "number") data.score = body.score
  if (typeof body.anonymizedId === "string") data.anonymizedId = body.anonymizedId
  const s = await db.student.update({ where: { id }, data })
  return NextResponse.json(s)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const s = await db.student.delete({ where: { id } })
  // renumber order
  const rest = await db.student.findMany({
    where: { examId: s.examId },
    orderBy: { order: "asc" },
  })
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].order !== i) {
      await db.student.update({ where: { id: rest[i].id }, data: { order: i } })
    }
  }
  return NextResponse.json({ ok: true })
}
