"use client"

import { useEffect, useMemo, useState } from "react"
import type { Answer, ExamWithRelations, Question, Student } from "@/lib/types"
import { FlipArrow } from "./flip-arrow"
import { StudentPanel } from "./student-panel"
import { SortableQuestionList } from "./sortable-question-list"
import { BulkImportDialog } from "./bulk-import-dialog"
import { ProgressRing } from "@/components/progress-ring"
import { jfetch } from "@/hooks/use-exams"
import { useT } from "@/hooks/use-t"
import { toast } from "sonner"
import {
  FileText,
  Clock,
  ShieldCheck,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  CheckCheck,
  Upload,
  SkipForward,
  Wand2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

function formatDate(d: string | null) {
  if (!d) return "No due date"
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function AnswerView({
  exam,
  onMutate,
  onPatchQuestion,
  onPatchStudent,
  onPatchAnswer,
}: {
  exam: ExamWithRelations
  onMutate: () => void
  onPatchQuestion: (id: string, patch: Partial<Question>) => void
  onPatchStudent: (id: string, patch: Partial<Student>) => void
  onPatchAnswer: (questionId: string, studentId: string, patch: Partial<Answer>) => void
}) {
  const { t } = useT()
  const questions = useMemo(
    () => [...(exam.questions ?? [])].sort((a, b) => a.number - b.number),
    [exam.questions]
  )
  const [activeStudentIdx, setActiveStudentIdx] = useState(0)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [suggestingAll, setSuggestingAll] = useState<{ done: number; total: number } | null>(null)
  const activeStudent = exam.students[activeStudentIdx] ?? null

  // answers for the active student, keyed by questionId
  const answersByQuestion = useMemo(() => {
    const m = new Map<string, Answer>()
    if (activeStudent) {
      for (const a of exam.answers) {
        if (a.studentId === activeStudent.id) m.set(a.questionId, a)
      }
    }
    return m
  }, [exam.answers, activeStudent])

  // per-student progress
  const studentProgress = useMemo(() => {
    const map = new Map<string, { graded: number; total: number; score: number; max: number }>()
    for (const s of exam.students) {
      let graded = 0
      let score = 0
      let max = 0
      for (const q of questions) {
        const a = exam.answers.find(
          (x) => x.questionId === q.id && x.studentId === s.id
        )
        if (a?.graded) graded += 1
        if (a?.score != null) score += a.score
        max += q.maxScore ?? 0
      }
      map.set(s.id, { graded, total: questions.length, score, max })
    }
    return map
  }, [exam.answers, exam.students, questions])

  const activeProgress = activeStudent
    ? studentProgress.get(activeStudent.id)
    : null

  // exam-wide grading progress across all students × questions
  const examProgress = useMemo(() => {
    const totalCells = questions.length * exam.students.length
    let gradedCells = 0
    let scoreSum = 0
    let maxScore = 0
    let gradedStudents = 0
    for (const s of exam.students) {
      const p = studentProgress.get(s.id)
      if (p) {
        gradedCells += p.graded
        scoreSum += p.score
        maxScore += p.max
        if (p.graded > 0) gradedStudents += 1
      }
    }
    return {
      totalCells,
      gradedCells,
      fraction: totalCells ? gradedCells / totalCells : 0,
      avgScore: gradedStudents > 0 ? scoreSum / gradedStudents : null,
      maxScore,
    }
  }, [questions.length, exam.students, studentProgress])

  async function addRow() {
    try {
      await jfetch<Question>("/api/questions", {
        method: "POST",
        body: JSON.stringify({ examId: exam.id, maxScore: 20 }),
      })
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add row")
    }
  }

  async function deleteRow(id: string) {
    try {
      await jfetch(`/api/questions/${id}`, { method: "DELETE" })
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  async function addStudent() {
    try {
      await jfetch<Student>("/api/students", {
        method: "POST",
        body: JSON.stringify({ examId: exam.id }),
      })
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add student")
    }
  }

  async function addStudentsBulk(count: number) {
    try {
      await jfetch("/api/students", {
        method: "POST",
        body: JSON.stringify({ examId: exam.id, count }),
      })
      toast.success(`Added ${count} ${count === 1 ? "student" : "students"}`)
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add students")
    }
  }

  async function deleteStudent(id: string) {
    try {
      await jfetch(`/api/students/${id}`, { method: "DELETE" })
      // adjust active index if needed
      const idx = exam.students.findIndex((s) => s.id === id)
      if (idx <= activeStudentIdx) {
        setActiveStudentIdx(Math.max(0, activeStudentIdx - (idx < activeStudentIdx ? 1 : 0)))
      }
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    }
  }

  function selectStudent(id: string) {
    const idx = exam.students.findIndex((s) => s.id === id)
    if (idx >= 0) setActiveStudentIdx(idx)
  }

  function navigateStudent(dir: -1 | 1) {
    setActiveStudentIdx((i) =>
      Math.min(Math.max(0, i + dir), Math.max(0, exam.students.length - 1))
    )
  }

  function exportCsv() {
    if (questions.length === 0 || exam.students.length === 0) {
      toast.error("Nothing to export yet.")
      return
    }
    // trigger download via the API route
    const a = document.createElement("a")
    a.href = `/api/export?examId=${encodeURIComponent(exam.id)}`
    a.download = ""
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success("Exporting grades as CSV…")
  }

  async function markAllGraded() {
    if (!activeStudent || questions.length === 0) return
    // optimistic: mark all this student's answers graded + default score
    for (const q of questions) {
      const existing = exam.answers.find(
        (a) => a.questionId === q.id && a.studentId === activeStudent.id
      )
      onPatchAnswer(q.id, activeStudent.id, {
        graded: true,
        score: existing?.score ?? q.maxScore ?? null,
      })
    }
    try {
      await jfetch("/api/answers/mark-all", {
        method: "POST",
        body: JSON.stringify({
          examId: exam.id,
          studentId: activeStudent.id,
          graded: true,
        }),
      })
      toast.success(`Marked all ${activeStudent.anonymizedId} answers graded`)
      onMutate()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark graded")
      onMutate() // revert to server truth
    }
  }

  // Run AI suggest-score for all of the active student's ungraded answers,
  // one at a time (sequential to avoid hammering the LLM). Shows progress.
  async function suggestAll() {
    if (!activeStudent || questions.length === 0) return
    const toSuggest = questions.filter((q) => {
      const a = exam.answers.find(
        (x) => x.questionId === q.id && x.studentId === activeStudent.id
      )
      return !a?.graded
    })
    if (toSuggest.length === 0) {
      toast.info(`${activeStudent.anonymizedId} is already fully graded`)
      return
    }
    setSuggestingAll({ done: 0, total: toSuggest.length })
    let done = 0
    for (const q of toSuggest) {
      try {
        const res = await jfetch<{ score: number; feedback: string; maxScore: number }>(
          "/api/suggest-score",
          {
            method: "POST",
            body: JSON.stringify({ questionId: q.id, studentId: activeStudent.id }),
          }
        )
        // persist the suggestion to the Answer record (upsert)
        await jfetch("/api/answers", {
          method: "POST",
          body: JSON.stringify({
            questionId: q.id,
            studentId: activeStudent.id,
            patch: {
              score: res.score,
              feedback: res.feedback,
              graded: true,
              aiGraded: true,
            },
          }),
        })
        onPatchAnswer(q.id, activeStudent.id, {
          score: res.score,
          feedback: res.feedback,
          graded: true,
          aiGraded: true,
        })
        done++
        setSuggestingAll({ done, total: toSuggest.length })
      } catch (e) {
        toast.error(
          `Q${q.number}: ${e instanceof Error ? e.message : "suggestion failed"}`
        )
      }
    }
    setSuggestingAll(null)
    if (done > 0) {
      toast.success(`AI suggested scores for ${done}/${toSuggest.length} answers`)
    }
    onMutate()
  }

  // Jump to the next student (wrapping around) who has ungraded answers.
  function nextUngraded() {
    if (exam.students.length === 0 || questions.length === 0) return
    const n = exam.students.length
    for (let step = 1; step <= n; step++) {
      const idx = (activeStudentIdx + step) % n
      const s = exam.students[idx]
      const p = studentProgress.get(s.id)
      if (!p || p.graded < p.total) {
        setActiveStudentIdx(idx)
        toast.info(`Jumped to ${s.anonymizedId} (ungraded)`)
        return
      }
    }
    toast.success("All students are fully graded! 🎉")
  }

  // Keyboard: J = next student, K = prev student, 1-9 = jump to student N
  // (ignored while typing in inputs/textareas/selects or with modifier keys)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t) {
        const tag = t.tagName
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        )
          return
      }
      if (e.key === "j" || e.key === "J") {
        e.preventDefault()
        navigateStudent(1)
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault()
        navigateStudent(-1)
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault()
        nextUngraded()
      } else if (/^[1-9]$/.test(e.key)) {
        // jump to student N (1-indexed) if it exists
        const idx = parseInt(e.key, 10) - 1
        if (idx >= 0 && idx < exam.students.length) {
          e.preventDefault()
          setActiveStudentIdx(idx)
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [exam.students.length, activeStudentIdx])

  return (
    <>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <main className="scroll-thin flex-1 overflow-y-auto">
          {/* Exam header */}
          <div className="border-b border-border/70 bg-card/50 px-6 py-5">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Answers
                <span className="text-muted-foreground/50">·</span>
                <Clock className="h-3 w-3" />
                {formatDate(exam.dueDate)}
              </div>
              <div className="mt-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight">
                    {exam.name}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <ShieldCheck className="h-3 w-3" />
                      {t("exam.blindGrading")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {exam.students.length} {exam.students.length === 1 ? t("home.student") : t("home.students")}
                    </span>
                    {examProgress.totalCells > 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"
                        title={`${examProgress.gradedCells}/${examProgress.totalCells} answers graded across all students`}
                      >
                        <ProgressRing
                          value={examProgress.fraction}
                          size={12}
                          stroke={2}
                          showCheck={false}
                        />
                        {examProgress.gradedCells}/{examProgress.totalCells} graded
                        {examProgress.avgScore != null && (
                          <span className="text-muted-foreground/70">
                            · avg {examProgress.avgScore.toFixed(1)}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => setBulkOpen(true)}
                    disabled={questions.length === 0}
                    title="Upload multiple answer files and auto-match to students"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("answer.bulkImport")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={exportCsv}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("answer.exportCsv")}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Active student bar */}
          {activeStudent && (
            <div className="sticky top-0 z-10 mx-auto flex max-w-3xl items-center justify-between gap-3 border-b border-border/70 bg-background/90 px-6 py-2.5 backdrop-blur">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateStudent(-1)}
                  disabled={activeStudentIdx === 0}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-muted disabled:opacity-30"
                  aria-label="Previous student"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {String(activeStudentIdx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-xs font-medium leading-tight">
                      {activeStudent.anonymizedId}
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      {activeStudentIdx + 1} of {exam.students.length}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigateStudent(1)}
                  disabled={activeStudentIdx >= exam.students.length - 1}
                  className="rounded-md p-1 text-muted-foreground transition hover:bg-muted disabled:opacity-30"
                  aria-label="Next student"
                  title="Next student (J)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <kbd className="hidden rounded border border-border bg-muted/60 px-1 py-0.5 text-[9px] font-medium text-muted-foreground lg:inline">
                  1-9 · J/K · N
                </kbd>
              </div>
              {activeProgress && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    {activeProgress.graded === activeProgress.total ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                    {activeProgress.graded}/{activeProgress.total} graded
                  </span>
                  <span className="font-medium tabular-nums">
                    {activeProgress.score}
                    <span className="text-muted-foreground">/{activeProgress.max}</span>
                  </span>
                  {/* mini progress bar */}
                  <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${
                          activeProgress.total
                            ? (activeProgress.graded / activeProgress.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                    onClick={nextUngraded}
                    title="Jump to the next student with ungraded answers (wraps around)"
                  >
                    <SkipForward className="h-3 w-3" />
                    <span className="hidden md:inline">{t("answer.nextUngraded")}</span>
                  </Button>
                  {activeProgress.graded < activeProgress.total && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[11px] disabled:opacity-60"
                      onClick={suggestAll}
                      disabled={!!suggestingAll}
                      title="AI-suggest scores for all of this student's ungraded answers (compares each to the rubric)"
                    >
                      {suggestingAll ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">
                        {suggestingAll
                          ? `${t("answer.suggesting")} ${suggestingAll.done}/${suggestingAll.total}…`
                          : t("answer.suggestAll")}
                      </span>
                    </Button>
                  )}
                  {activeProgress.graded < activeProgress.total && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={markAllGraded}
                      title="Mark all of this student's answers as graded (defaults empty scores to max)"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">{t("answer.markAllGraded")}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rows */}
          <div className="mx-auto max-w-3xl px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">
                {t("exam.studentAnswers")}
                <span className="ml-2 text-muted-foreground">
                  ({questions.length})
                </span>
              </h2>
              {questions.length > 1 && (
                <span className="text-[11px] text-muted-foreground">
                  Drag the handle to reorder
                </span>
              )}
            </div>

            {exam.students.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No students yet. Add one from the panel on the right.
                </p>
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No answer rows yet.
                </p>
                <button
                  onClick={addRow}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  + Add question
                </button>
              </div>
            ) : (
              <SortableQuestionList
                examId={exam.id}
                questions={questions}
                activeStudent={activeStudent}
                answersByQuestion={answersByQuestion}
                onPatchQuestion={onPatchQuestion}
                onPatchAnswer={onPatchAnswer}
                onDeleteQuestion={deleteRow}
                onAddRow={addRow}
                onReordered={(orderedIds) => {
                  orderedIds.forEach((id, i) =>
                    onPatchQuestion(id, { number: i + 1 })
                  )
                }}
              />
            )}
          </div>
        </main>

        <StudentPanel
          students={exam.students}
          activeId={activeStudent?.id ?? null}
          progress={studentProgress}
          onSelect={selectStudent}
          onAdd={addStudent}
          onAddBulk={addStudentsBulk}
          onDelete={deleteStudent}
          onPatch={onPatchStudent}
        />
      </div>

      <FlipArrow side="left" />

      <BulkImportDialog
        exam={exam}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onImported={onMutate}
      />
    </>
  )
}
