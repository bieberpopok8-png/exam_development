import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { seedDatabase } from "@/lib/seed"

export const dynamic = "force-dynamic"

export async function GET() {
  // ensure seeded on first run
  try {
    await seedDatabase()
  } catch (e) {
    console.error("seed error", e)
  }
  const exams = await db.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true, students: true } },
      questions: { select: { id: true, maxScore: true } },
    },
  })

  // Collect all question ids across exams to fetch graded-answer counts in one query.
  const allQuestionIds = exams.flatMap((e) => e.questions.map((q) => q.id))
  const gradedAgg = allQuestionIds.length
    ? await db.answer.groupBy({
        by: ["questionId"],
        where: { questionId: { in: allQuestionIds }, graded: true },
        _count: { _all: true },
      })
    : []
  const gradedByQuestion = new Map(
    gradedAgg.map((g) => [g.questionId, g._count._all])
  )

  // total answer records per question (to know how many student-answers exist)
  const totalAgg = allQuestionIds.length
    ? await db.answer.groupBy({
        by: ["questionId"],
        where: { questionId: { in: allQuestionIds } },
        _count: { _all: true },
      })
    : []
  const totalByQuestion = new Map(
    totalAgg.map((g) => [g.questionId, g._count._all])
  )

  // sum of scores per question (for average-score computation)
  const sumAgg = allQuestionIds.length
    ? await db.answer.groupBy({
        by: ["questionId"],
        where: { questionId: { in: allQuestionIds }, score: { not: null } },
        _sum: { score: true },
      })
    : []
  const sumByQuestion = new Map(
    sumAgg.map((g) => [g.questionId, g._sum.score ?? 0])
  )

  // distinct studentIds that have >=1 graded answer, across all exams
  const gradedStudentAgg = allQuestionIds.length
    ? await db.answer.groupBy({
        by: ["studentId"],
        where: { questionId: { in: allQuestionIds }, graded: true },
      })
    : []
  const gradedStudentIds = new Set(gradedStudentAgg.map((g) => g.studentId))

  // fetch all students for these exams so we can count graded-students per exam
  const allExamIds = exams.map((e) => e.id)
  const allStudents = allExamIds.length
    ? await db.student.findMany({
        where: { examId: { in: allExamIds } },
        select: { id: true, examId: true },
      })
    : []
  const studentsByExam = new Map<string, Set<string>>()
  for (const s of allStudents) {
    let set = studentsByExam.get(s.examId)
    if (!set) {
      set = new Set()
      studentsByExam.set(s.examId, set)
    }
    set.add(s.id)
  }
  // For each exam, count students with >=1 graded answer
  const gradedStudentCountByExam = new Map<string, number>()
  for (const e of exams) {
    const examStudents = studentsByExam.get(e.id) ?? new Set<string>()
    let cnt = 0
    for (const sid of examStudents) {
      if (gradedStudentIds.has(sid)) cnt++
    }
    gradedStudentCountByExam.set(e.id, cnt)
  }

  const withProgress = exams.map((e) => {
    const qIds = e.questions.map((q) => q.id)
    const studentCount = e._count.students
    const totalCells = qIds.length * studentCount
    let gradedCells = 0
    let answeredCells = 0
    let maxScore = 0
    let scoreSum = 0
    for (const q of e.questions) {
      gradedCells += gradedByQuestion.get(q.id) ?? 0
      answeredCells += totalByQuestion.get(q.id) ?? 0
      maxScore += q.maxScore ?? 0
      scoreSum += sumByQuestion.get(q.id) ?? 0
    }
    // exact count of students with >=1 graded answer for this exam
    const scoredStudents = gradedStudentCountByExam.get(e.id) ?? 0
    const avgScore = scoredStudents > 0 ? scoreSum / scoredStudents : null
    // strip the helper `questions` select before returning
    const { questions: _q, ...rest } = e
    void _q
    return {
      ...rest,
      progress: {
        gradedCells,
        totalCells,
        answeredCells,
        maxScore,
        avgScore,
        // fraction of student-question cells that are graded, 0..1
        fraction: totalCells ? gradedCells / totalCells : 0,
      },
    }
  })

  return NextResponse.json(withProgress)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = (body?.name ?? "").toString().trim()
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }
  const description = (body?.description ?? "").toString()
  const dueDate = body?.dueDate ? new Date(body.dueDate) : null
  const color = (body?.color ?? "slate").toString()

  const exam = await db.exam.create({
    data: { name, description, dueDate, color },
  })

  // first starter row
  await db.question.create({
    data: { examId: exam.id, number: 1, maxScore: 20 },
  })

  return NextResponse.json(exam, { status: 201 })
}
