"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Answer, Question, Student } from "@/lib/types"
import { RubricRow, AnswerRow } from "./question-row"
import { cn } from "@/lib/utils"
import { jfetch } from "@/hooks/use-exams"
import { toast } from "sonner"
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react"

interface RubricItem {
  mode: "rubric"
  question: Question
  onChange: (patch: Partial<Question>) => void
  onDelete: () => void
  gradedCount?: number
  studentCount?: number
  scores?: number[]
}

interface AnswerItem {
  mode: "answer"
  question: Question
  answer: Answer | null
  studentId: string
  onAnswerChange: (patch: Partial<Answer>) => void
  onDelete: () => void
}

type Item = (RubricItem | AnswerItem) & { id: string; onAddNext?: () => void }

function SortableItem({
  item,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  item: Item
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "z-20 opacity-80"
      )}
    >
      {/* drag handle (sm+) — only visible on hover, doesn't interfere with inputs */}
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-1 top-4 z-10 hidden h-7 w-5 cursor-grab items-center justify-center rounded text-muted-foreground/40 opacity-0 transition hover:text-muted-foreground group-hover/row:opacity-100 active:cursor-grabbing sm:flex"
        aria-label="Drag to reorder"
        title="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {/* mobile up/down reorder (sm:hidden) */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-0.5 sm:hidden">
        <button
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-card/90 text-muted-foreground shadow-sm ring-1 ring-border/70 transition hover:bg-muted disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-card/90 text-muted-foreground shadow-sm ring-1 ring-border/70 transition hover:bg-muted disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {item.mode === "rubric" ? (
        <RubricRow
          question={item.question}
          onChange={item.onChange}
          onDelete={item.onDelete}
          onAddNext={item.onAddNext}
          gradedCount={item.gradedCount}
          studentCount={item.studentCount}
          scores={item.scores}
        />
      ) : (
        <AnswerRow
          question={item.question}
          answer={item.answer}
          studentId={item.studentId}
          onAnswerChange={item.onAnswerChange}
          onDelete={item.onDelete}
          onAddNext={item.onAddNext}
        />
      )}
    </div>
  )
}

export function SortableQuestionList({
  examId,
  questions,
  activeStudent,
  answersByQuestion,
  allAnswers,
  studentCount,
  onPatchQuestion,
  onPatchAnswer,
  onDeleteQuestion,
  onAddRow,
  onReordered,
}: {
  examId: string
  questions: Question[]
  activeStudent: Student | null
  answersByQuestion: Map<string, Answer>
  allAnswers?: Answer[]
  studentCount?: number
  onPatchQuestion: (id: string, patch: Partial<Question>) => void
  onPatchAnswer: (questionId: string, studentId: string, patch: Partial<Answer>) => void
  onDeleteQuestion: (id: string) => void
  onAddRow: () => void
  onReordered: (orderedIds: string[]) => void
}) {
  const ordered = useMemo(
    () => [...questions].sort((a, b) => a.number - b.number),
    [questions]
  )
  const [localOrder, setLocalOrder] = useState<string[] | null>(null)

  // display order: local override during/after drag, else by number
  const displayQuestions = localOrder
    ? localOrder
        .map((id, i) => {
          const q = ordered.find((x) => x.id === id)
          return q ? { ...q, number: i + 1 } : null
        })
        .filter((x): x is Question => x !== null)
    : ordered

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = displayQuestions.map((q) => q.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    if (oldIndex < 0 || newIndex < 0) return
    await applyReorder(arrayMove(ids, oldIndex, newIndex))
  }

  // shared reorder path used by both drag-end and mobile up/down buttons
  async function applyReorder(next: string[]) {
    setLocalOrder(next)
    onReordered(next)
    try {
      await jfetch("/api/questions", {
        method: "POST",
        body: JSON.stringify({ examId, reorder: next }),
      })
    } catch (e) {
      toast.error("Reorder failed — reverting")
      setLocalOrder(null)
    }
  }

  function moveItem(id: string, dir: -1 | 1) {
    const ids = displayQuestions.map((q) => q.id)
    const i = ids.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= ids.length) return
    void applyReorder(arrayMove(ids, i, j))
  }

  // graded count + scores per question (for rubric mode's per-question status chip)
  const gradedByQuestion = useMemo(() => {
    const counts = new Map<string, number>()
    const scores = new Map<string, number[]>()
    if (allAnswers) {
      for (const a of allAnswers) {
        if (a.graded) {
          counts.set(a.questionId, (counts.get(a.questionId) ?? 0) + 1)
          if (a.score != null) {
            const arr = scores.get(a.questionId) ?? []
            arr.push(a.score)
            scores.set(a.questionId, arr)
          }
        }
      }
    }
    return { counts, scores }
  }, [allAnswers])

  const items: Item[] = displayQuestions.map((q, i) => {
    if (activeStudent) {
      return {
        id: q.id,
        mode: "answer" as const,
        question: q,
        answer: answersByQuestion.get(q.id) ?? null,
        studentId: activeStudent.id,
        onAnswerChange: (patch: Partial<Answer>) =>
          onPatchAnswer(q.id, activeStudent.id, patch),
        onDelete: () => onDeleteQuestion(q.id),
        onAddNext: i === displayQuestions.length - 1 ? onAddRow : undefined,
      }
    }
    return {
      id: q.id,
      mode: "rubric" as const,
      question: q,
      onChange: (patch: Partial<Question>) => onPatchQuestion(q.id, patch),
      onDelete: () => onDeleteQuestion(q.id),
      onAddNext: i === displayQuestions.length - 1 ? onAddRow : undefined,
      gradedCount: gradedByQuestion.counts.get(q.id) ?? 0,
      studentCount: studentCount ?? 0,
      scores: gradedByQuestion.scores.get(q.id) ?? [],
    }
  })

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item, i) => (
            <SortableItem
              key={item.id}
              item={item}
              canMoveUp={i > 0}
              canMoveDown={i < items.length - 1}
              onMoveUp={() => moveItem(item.id, -1)}
              onMoveDown={() => moveItem(item.id, 1)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
