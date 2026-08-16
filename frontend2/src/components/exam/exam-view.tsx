"use client"

import { useAppStore } from "@/lib/store"
import { TabBar } from "./tab-bar"
import { RubricView } from "./rubric-view"
import { AnswerView } from "./answer-view"
import { useExam } from "@/hooks/use-exams"
import type { Answer, Question, Student } from "@/lib/types"
import { Inbox } from "lucide-react"
import { useEffect } from "react"

export function ExamView({ openTabIds }: { openTabIds: string[] }) {
  void openTabIds
  const activeTabId = useAppStore((s) => s.activeTabId)
  const subView = useAppStore((s) => (s.activeTabId ? s.subViews[s.activeTabId] ?? "rubric" : "rubric"))
  const flipView = useAppStore((s) => s.flipView)
  const goHome = useAppStore((s) => s.goHome)
  const { exam, loading, refresh, setExam } = useExam(activeTabId)

  function patchQuestion(id: string, patch: Partial<Question>) {
    setExam((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === id ? { ...q, ...patch } : q
            ),
          }
        : prev
    )
  }

  function patchStudent(id: string, patch: Partial<Student>) {
    setExam((prev) =>
      prev
        ? {
            ...prev,
            students: prev.students.map((s) =>
              s.id === id ? { ...s, ...patch } : s
            ),
          }
        : prev
    )
  }

  function patchAnswer(questionId: string, studentId: string, patch: Partial<Answer>) {
    setExam((prev) => {
      if (!prev) return prev
      const existing = prev.answers.find(
        (a) => a.questionId === questionId && a.studentId === studentId
      )
      let answers: Answer[]
      if (existing) {
        answers = prev.answers.map((a) =>
          a.id === existing.id ? { ...a, ...patch } : a
        )
      } else {
        answers = [
          ...prev.answers,
          {
            id: `temp-${questionId}-${studentId}`,
            questionId,
            studentId,
            fileName: null,
            fileType: null,
            fileData: null,
            notes: "",
            parsed: "",
            score: null,
            feedback: "",
            graded: false,
            aiGraded: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...patch,
          },
        ]
      }
      return { ...prev, answers }
    })
  }

  // Keyboard shortcut: Cmd/Ctrl + ArrowRight / ArrowLeft flips Rubric<->Answer.
  // ArrowRight from Rubric → Answer; ArrowLeft from Answer → Rubric.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === "ArrowRight" && subView === "rubric") {
        e.preventDefault()
        flipView()
      } else if (e.key === "ArrowLeft" && subView === "answer") {
        e.preventDefault()
        flipView()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [subView, flipView])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TabBar />

      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {loading && !exam ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
              Loading exam…
            </span>
          </div>
        ) : !exam ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No exam open</p>
              <p className="text-xs text-muted-foreground">
                This tab’s exam may have been deleted. Go home to pick another.
              </p>
            </div>
            <button
              onClick={goHome}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Back to home
            </button>
          </div>
        ) : subView === "rubric" ? (
          <RubricView
            exam={exam}
            onMutate={refresh}
            onPatchQuestion={patchQuestion}
          />
        ) : (
          <AnswerView
            exam={exam}
            onMutate={refresh}
            onPatchQuestion={patchQuestion}
            onPatchStudent={patchStudent}
            onPatchAnswer={patchAnswer}
          />
        )}
      </div>
    </div>
  )
}
