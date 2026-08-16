"use client"

import type { ExamWithRelations, Question } from "@/lib/types"
import { Sidebar } from "./sidebar"
import { FlipArrow } from "./flip-arrow"
import { SortableQuestionList } from "./sortable-question-list"
import { jfetch } from "@/hooks/use-exams"
import { useT } from "@/hooks/use-t"
import { toast } from "sonner"
import { useMemo } from "react"
import { ClipboardCheck, Clock, ListChecks, Layers } from "lucide-react"

function formatDate(d: string | null) {
  if (!d) return "No due date"
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function RubricView({
  exam,
  onMutate,
  onPatchQuestion,
}: {
  exam: ExamWithRelations
  onMutate: () => void
  onPatchQuestion: (id: string, patch: Partial<Question>) => void
}) {
  const { t } = useT()
  const questions = useMemo(
    () => [...(exam.questions ?? [])].sort((a, b) => a.number - b.number),
    [exam.questions]
  )

  const totalMax = questions.reduce((sum, q) => sum + (q.maxScore ?? 0), 0)

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

  function handleReordered(orderedIds: string[]) {
    // optimistic: patch local question numbers
    orderedIds.forEach((id, i) => onPatchQuestion(id, { number: i + 1 }))
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar exam={exam} />

        <main className="scroll-thin flex-1 overflow-y-auto">
          {/* Exam header */}
          <div className="border-b border-border/70 bg-card/50 px-6 py-5">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {t("exam.rubric")}
                <span className="text-muted-foreground/50">·</span>
                <Clock className="h-3 w-3" />
                {formatDate(exam.dueDate)}
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                {exam.name}
              </h1>
              {exam.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {exam.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                  <ListChecks className="h-3 w-3" />
                  {questions.length} {questions.length === 1 ? t("home.question") : t("home.questions")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                  <Layers className="h-3 w-3" />
                  {totalMax} {t("exam.ptsTotal")}
                </span>
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="mx-auto max-w-3xl px-6 py-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-medium">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                {t("exam.gradingCriteria")}
                <span className="text-muted-foreground">
                  ({questions.length})
                </span>
              </h2>
              {questions.length > 1 && (
                <span className="text-[11px] text-muted-foreground">
                  {t("exam.dragToReorder")}
                </span>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("exam.noQuestionsYet")}
                </p>
                <button
                  onClick={addRow}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  + {t("exam.addQuestion")}
                </button>
              </div>
            ) : (
              <SortableQuestionList
                examId={exam.id}
                questions={questions}
                activeStudent={null}
                answersByQuestion={new Map()}
                allAnswers={exam.answers}
                studentCount={exam.students.length}
                onPatchQuestion={onPatchQuestion}
                onPatchAnswer={() => {}}
                onDeleteQuestion={deleteRow}
                onAddRow={addRow}
                onReordered={handleReordered}
              />
            )}
          </div>
        </main>
      </div>

      <FlipArrow side="right" />
    </>
  )
}
