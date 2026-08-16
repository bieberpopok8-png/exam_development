"use client"

import { cn } from "@/lib/utils"
import {
  Eye,
  Pencil,
  Users,
  ListChecks,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react"
import { useState, useMemo } from "react"
import { EditExamDialog } from "./edit-exam-dialog"
import type { ExamWithRelations } from "@/lib/types"
import { refreshExams } from "@/components/home/add-exam-dialog"
import { ProgressRing } from "@/components/progress-ring"

export function Sidebar({ exam }: { exam: ExamWithRelations }) {
  const [editOpen, setEditOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const stats = useMemo(() => {
    const qCount = exam.questions.length
    const sCount = exam.students.length
    const totalCells = qCount * sCount
    const gradedCells = exam.answers.filter((a) => a.graded).length
    const maxScore = exam.questions.reduce((s, q) => s + (q.maxScore ?? 0), 0)
    const gradedAnswers = exam.answers.filter((a) => a.graded && a.score != null)
    const avgScore = gradedAnswers.length
      ? gradedAnswers.reduce((s, a) => s + (a.score ?? 0), 0) / gradedAnswers.length
      : null
    return {
      qCount, sCount, totalCells, gradedCells, maxScore,
      fraction: totalCells ? gradedCells / totalCells : 0,
      avgScore,
    }
  }, [exam])

  const tools = [
    { icon: Eye, label: "View", onClick: () => setViewOpen((v) => !v), active: viewOpen },
    { icon: Pencil, label: "Edit", onClick: () => setEditOpen(true) },
  ]

  return (
    <>
      <aside className="flex shrink-0 flex-col items-center gap-1 self-start border border-border/70 bg-sidebar p-1.5 rounded-xl mt-3 ml-3">
        {tools.map((t) => (
          <button
            key={t.label}
            onClick={t.onClick}
            title={t.label}
            aria-label={t.label}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              t.active && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
          </button>
        ))}
      </aside>

      <EditExamDialog
        exam={exam}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refreshExams}
      />

      {viewOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setViewOpen(false)}
            aria-hidden
          />
          <div className="absolute left-16 top-16 z-40 w-64 rounded-xl border border-border bg-popover p-3 text-xs shadow-lg">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="font-medium">Overview</p>
              <button
                onClick={() => setViewOpen(false)}
                className="rounded p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close overview"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              <ProgressRing value={stats.fraction} size={48} stroke={4} />
              <div className="min-w-0">
                <div className="text-sm font-semibold tabular-nums">
                  {stats.totalCells ? `${Math.round(stats.fraction * 100)}%` : "—"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {stats.totalCells
                    ? `${stats.gradedCells} of ${stats.totalCells} graded`
                    : "No students yet"}
                </div>
              </div>
            </div>

            <dl className="mt-2.5 grid grid-cols-2 gap-1.5">
              <Stat icon={ListChecks} label="Questions" value={String(stats.qCount)} />
              <Stat icon={Users} label="Students" value={String(stats.sCount)} />
              <Stat icon={CheckCircle2} label="Graded" value={`${stats.gradedCells}/${stats.totalCells}`} />
              <Stat icon={Clock} label="Max pts" value={String(stats.maxScore)} />
            </dl>

            {stats.avgScore != null && (
              <div className="mt-2.5 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. score</span>
                  <span className="font-medium tabular-nums">
                    {stats.avgScore.toFixed(1)} / {stats.maxScore || "—"}
                  </span>
                </div>
              </div>
            )}

            <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">
              Tip: drag tabs to reorder · ⌘→ to grade answers
            </p>
          </div>
        </>
      )}
    </>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-medium tabular-nums">{value}</div>
      </div>
    </div>
  )
}
