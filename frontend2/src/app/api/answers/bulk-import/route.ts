import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const maxDuration = 60

interface IncomingFile {
  studentId: string
  fileName: string
  fileType: string
  fileData: string // base64 data url
}

// Bulk-import answer files for one question across many students.
// Body: { examId, questionId, files: IncomingFile[] }
// Each file is upserted onto the (questionId, studentId) Answer record.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { examId, questionId, files } = body ?? {}
  if (!examId || !questionId || !Array.isArray(files)) {
    return NextResponse.json(
      { error: "examId, questionId and files[] are required" },
      { status: 400 }
    )
  }

  // verify the question belongs to this exam
  const question = await db.question.findFirst({
    where: { id: questionId, examId },
    select: { id: true },
  })
  if (!question) {
    return NextResponse.json(
      { error: "Question not found in this exam" },
      { status: 404 }
    )
  }

  // validate all studentIds belong to this exam
  const examStudents = await db.student.findMany({
    where: { examId },
    select: { id: true },
  })
  const validStudentIds = new Set(examStudents.map((s) => s.id))
  const incoming = files as IncomingFile[]
  const invalid = incoming.filter((f) => !validStudentIds.has(f.studentId))
  if (invalid.length) {
    return NextResponse.json(
      { error: `Unknown studentId: ${invalid[0].studentId}` },
      { status: 400 }
    )
  }

  let created = 0
  let updated = 0
  for (const f of incoming) {
    const existing = await db.answer.findUnique({
      where: { questionId_studentId: { questionId, studentId: f.studentId } },
    })
    if (existing) {
      await db.answer.update({
        where: { id: existing.id },
        data: {
          fileName: f.fileName,
          fileType: f.fileType,
          fileData: f.fileData,
        },
      })
      updated++
    } else {
      await db.answer.create({
        data: {
          questionId,
          studentId: f.studentId,
          fileName: f.fileName,
          fileType: f.fileType,
          fileData: f.fileData,
        },
      })
      created++
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    updated,
    total: incoming.length,
  })
}
