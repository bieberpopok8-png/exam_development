"use client"

import { useMemo, useState } from "react"
import type { Exam } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/progress-ring"
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ExamCalendar({
  exams,
  onOpen,
}: {
  exams: Exam[]
  onOpen: (id: string) => void
}) {
  const [cursor, setCursor] = useState(() => new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const examsByDay = useMemo(() => {
    const map = new Map<string, Exam[]>()
    for (const e of exams) {
      if (!e.dueDate) continue
      const key = format(new Date(e.dueDate), "yyyy-MM-dd")
      const arr = map.get(key) ?? []
      arr.push(e)
      map.set(key, arr)
    }
    return map
  }, [exams])

  const monthExams = exams.filter(
    (e) =>
      e.dueDate && isSameMonth(new Date(e.dueDate), cursor)
  )

  return (
    <div className="rounded-xl border border-border/70 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            {format(cursor, "MMMM yyyy")}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {monthExams.length} exam{monthExams.length === 1 ? "" : "s"} due this month
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setCursor(new Date())}
          >
            Today
          </Button>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor((c) => subMonths(c, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border/70 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayExams = examsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, cursor)
          const today = isToday(day)
          return (
            <div
              key={key}
              className={cn(
                "min-h-[92px] border-b border-r border-border/50 p-1.5 align-top sm:min-h-[112px]",
                !inMonth && "bg-muted/30",
                today && "bg-accent/30"
              )}
            >
              <div
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                  today
                    ? "bg-primary text-primary-foreground font-semibold"
                    : inMonth
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-1">
                {dayExams.slice(0, 3).map((e) => {
                  const frac = e.progress?.fraction ?? 0
                  const hasStudents = (e.progress?.totalCells ?? 0) > 0
                  return (
                    <button
                      key={e.id}
                      onClick={() => onOpen(e.id)}
                      title={`${e.name}${hasStudents ? ` · ${Math.round(frac * 100)}% graded` : " · no students"}`}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] font-medium transition hover:ring-1 hover:ring-foreground/20",
                        e.color === "slate" && "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                        e.color === "emerald" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
                        e.color === "amber" && "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
                        e.color === "rose" && "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
                        e.color === "violet" && "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
                        e.color === "cyan" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
                        e.color === "orange" && "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                      )}
                    >
                      <ProgressRing
                        value={frac}
                        size={22}
                        stroke={2.5}
                        showCheck={false}
                        className="shrink-0"
                      />
                      <span className="truncate">{e.name}</span>
                    </button>
                  )
                })}
                {dayExams.length > 3 && (
                  <div className="px-1.5 text-[10px] text-muted-foreground">
                    +{dayExams.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* No-due-date exams */}
      {exams.some((e) => !e.dueDate) && (
        <div className="border-t border-border/70 px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <Inbox className="h-3 w-3" />
            No due date
          </p>
          <div className="flex flex-wrap gap-1.5">
            {exams
              .filter((e) => !e.dueDate)
              .map((e) => {
                const frac = e.progress?.fraction ?? 0
                return (
                  <button
                    key={e.id}
                    onClick={() => onOpen(e.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[11px] font-medium transition hover:bg-muted"
                  >
                    <ProgressRing value={frac} size={18} stroke={2.5} showCheck={false} />
                    {e.name}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
