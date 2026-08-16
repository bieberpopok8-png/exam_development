import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Create a new question row for an exam.
// Body: { examId, maxScore?, rubricNotes? } OR { examId, reorder: string[] }
// (reorder = ordered list of question ids — renumbers them 1..N)
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const examId = body?.examId
  if (!examId) return NextResponse.json({ error: "examId required" }, { status: 400 })

  // Reorder mode
  if (Array.isArray(body?.reorder)) {
    const orderedIds = body.reorder as string[]
    // verify all belong to this exam
    const owned = await db.question.findMany({
      where: { examId },
      select: { id: true },
    })
    const ownedSet = new Set(owned.map((q) => q.id))
    if (orderedIds.length !== owned.length || !orderedIds.every((id) => ownedSet.has(id))) {
      return NextResponse.json(
        { error: "reorder list must contain exactly this exam's question ids" },
        { status: 400 }
      )
    }
    await db.$transaction(
      orderedIds.map((id, i) =>
        db.question.update({ where: { id }, data: { number: i + 1 } })
      )
    )
    return NextResponse.json({ ok: true, reordered: orderedIds.length })
  }

  const count = await db.question.count({ where: { examId } })
  const q = await db.question.create({
    data: {
      examId,
      number: count + 1,
      maxScore: body?.maxScore ?? 20,
      rubricNotes: body?.rubricNotes ?? "",
    },
  })
  return NextResponse.json(q, { status: 201 })
}
