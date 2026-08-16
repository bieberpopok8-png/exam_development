import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// Upsert an Answer record by (questionId, studentId).
// Body: { questionId, studentId, patch: { fileName?, fileType?, fileData?, notes?, parsed?, score?, feedback?, graded? } }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { questionId, studentId, patch } = body ?? {}
  if (!questionId || !studentId) {
    return NextResponse.json(
      { error: "questionId and studentId required" },
      { status: 400 }
    )
  }
  const data: Record<string, unknown> = {}
  const allowed = [
    "fileName",
    "fileType",
    "fileData",
    "notes",
    "parsed",
    "extract",
    "extractStatus",
    "score",
    "feedback",
    "graded",
    "aiGraded",
  ]
  const p = patch ?? {}
  for (const k of allowed) {
    if (p[k] !== undefined) data[k] = p[k]
  }

  const answer = await db.answer.upsert({
    where: { questionId_studentId: { questionId, studentId } },
    create: { questionId, studentId, ...data },
    update: data,
  })
  return NextResponse.json(answer)
}
