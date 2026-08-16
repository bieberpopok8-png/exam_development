"use client"

import { useState } from "react"
import type { Student } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Users,
  UserPlus,
  Trash2,
  ChevronLeft,
  ShieldCheck,
  Hash,
  CheckCircle2,
  Circle,
  UsersRound,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/progress-ring"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Progress = { graded: number; total: number; score: number; max: number }

export function StudentPanel({
  students,
  activeId,
  progress,
  onSelect,
  onAdd,
  onAddBulk,
  onDelete,
  onPatch,
}: {
  students: Student[]
  activeId: string | null
  progress?: Map<string, Progress>
  onSelect: (id: string) => void
  onAdd: () => void
  onAddBulk: (count: number) => void
  onDelete: (id: string) => void
  onPatch: (id: string, patch: Partial<Student>) => void
}) {
  void onPatch
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [bulkCount, setBulkCount] = useState(5)
  const [bulkOpen, setBulkOpen] = useState(false)
  // Keep the panel expanded while the bulk-add popover is open, even if the
  // pointer leaves the panel strip (the popover renders in a portal outside).
  const open = hovered || pinned || bulkOpen

  return (
    <>
      {/* Expanding edge handle — a thin strip the user hovers to open */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative z-30 shrink-0 border-l border-border/70 bg-sidebar transition-all duration-300 ease-out",
          open ? "w-72" : "w-7"
        )}
        aria-label="Student panel"
      >
        {/* Collapsed label */}
        {!open && (
          <div className="flex h-full flex-col items-center justify-start gap-3 pt-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
              <Users className="h-3.5 w-3.5" />
            </div>
            <button
              onClick={() => setPinned(true)}
              className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
            >
              Students · {students.length}
            </button>
            {/* Quick-add button — always visible even when collapsed */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Add student"
              title="Add student"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Expanded content */}
        {open && (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold">Students</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {students.length}
                </span>
              </div>
              <button
                onClick={() => setPinned((p) => !p)}
                className={cn(
                  "rounded p-1 text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  pinned && "bg-muted text-foreground"
                )}
                title={pinned ? "Unpin (auto-collapse)" : "Pin open"}
                aria-label="Toggle pin"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Blind grading banner */}
            <div className="mx-3 mt-2 flex items-center gap-1.5 rounded-md bg-amber-100/70 px-2 py-1.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              Anonymized IDs only — names never shown
            </div>

            {/* Student list */}
            <div className="scroll-thin mt-2 flex-1 overflow-y-auto px-2 pb-2">
              {students.length === 0 && (
                <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium">No students yet</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Add one below, or use bulk-add for a whole class.
                  </p>
                </div>
              )}
              <ul className="space-y-1">
                {students.map((s, i) => {
                  const p = progress?.get(s.id)
                  const done = p && p.total > 0 && p.graded === p.total
                  return (
                    <li
                      key={s.id}
                      onMouseEnter={(e) => {
                        e.currentTarget
                          .querySelector("[data-del]")
                          ?.classList.remove("opacity-0")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget
                          .querySelector("[data-del]")
                          ?.classList.add("opacity-0")
                      }}
                      className={cn(
                        "group/student flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition",
                        activeId === s.id
                          ? "bg-primary/10 ring-1 ring-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => onSelect(s.id)}
                    >
                      {p && p.total > 0 ? (
                        <ProgressRing
                          value={p.total ? p.graded / p.total : 0}
                          size={28}
                          stroke={2.5}
                          className="shrink-0"
                        />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <Hash className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="truncate text-xs font-medium">
                            {s.anonymizedId}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {done ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
                          )}
                          {p
                            ? `${p.score}/${p.max} · ${p.graded}/${p.total} graded`
                            : "Not graded"}
                        </div>
                      </div>
                      <button
                        data-del
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(s.id)
                        }}
                        className="rounded p-1 text-muted-foreground opacity-0 transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        aria-label={`Remove ${s.anonymizedId}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Add students */}
            <div className="border-t border-border/70 p-2">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={onAdd}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add student
                </Button>
                <Popover
                  open={bulkOpen}
                  onOpenChange={setBulkOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 px-2 text-xs"
                      title="Add multiple students"
                    >
                      <UsersRound className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    side="top"
                    className="w-56 p-3"
                  >
                    <p className="mb-2 text-xs font-medium">Add multiple students</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={bulkCount}
                        onChange={(e) => setBulkCount(Number(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer accent-primary"
                        aria-label="Number of students to add"
                      />
                      <span className="w-8 text-center text-xs font-semibold tabular-nums">
                        {bulkCount}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Adds {bulkCount} anonymized {bulkCount === 1 ? "student" : "students"} (Student {String(students.length + 1).padStart(2, "0")}
                      {bulkCount > 1 ? `–${String(students.length + bulkCount).padStart(2, "0")}` : ""}).
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 w-full gap-1.5 text-xs"
                      onClick={() => {
                        onAddBulk(bulkCount)
                        setBulkOpen(false)
                      }}
                    >
                      <UsersRound className="h-3.5 w-3.5" />
                      Add {bulkCount} {bulkCount === 1 ? "student" : "students"}
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
