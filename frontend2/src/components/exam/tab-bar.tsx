"use client"

import { useState } from "react"
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useExams } from "@/hooks/use-exams"
import { X, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { ShortcutsHelp } from "./shortcuts-help"
import type { Exam } from "@/lib/types"

function Tab({ exam, active }: { exam: Exam; active: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exam.id })
  const setActiveTab = useAppStore((s) => s.setActiveTab)
  const closeTab = useAppStore((s) => s.closeTab)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setActiveTab(exam.id)}
      className={cn(
        "group relative flex h-9 cursor-pointer select-none items-center gap-2 rounded-t-lg border border-b-0 px-3 text-xs transition",
        isDragging && "chrome-tab-dragging",
        active
          ? "border-border bg-card text-foreground"
          : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/70"
      )}
    >
      {/* accent top stripe */}
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 rounded-t",
          active
            ? exam.color === "slate"
              ? "bg-slate-400"
              : exam.color === "emerald"
              ? "bg-emerald-500"
              : exam.color === "amber"
              ? "bg-amber-500"
              : exam.color === "rose"
              ? "bg-rose-500"
              : exam.color === "violet"
              ? "bg-violet-500"
              : exam.color === "cyan"
              ? "bg-cyan-500"
              : "bg-orange-500"
            : "bg-transparent group-hover:bg-muted-foreground/30"
        )}
      />
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          exam.color === "slate" && "bg-slate-400",
          exam.color === "emerald" && "bg-emerald-500",
          exam.color === "amber" && "bg-amber-500",
          exam.color === "rose" && "bg-rose-500",
          exam.color === "violet" && "bg-violet-500",
          exam.color === "cyan" && "bg-cyan-500",
          exam.color === "orange" && "bg-orange-500"
        )}
      />
      <span className="max-w-[180px] truncate font-medium">{exam.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          closeTab(exam.id)
        }}
        className="ml-0.5 rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-foreground/10 hover:text-foreground group-hover:opacity-100"
        aria-label="Close tab"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function TabBar() {
  const { openTabs, activeTabId, reorderTabs } = useAppStore()
  const { exams } = useExams()
  const goHome = useAppStore((s) => s.goHome)
  const [confirmingCloseAll, setConfirmingCloseAll] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const openExams = openTabs
    .map((id) => exams.find((e) => e.id === id))
    .filter((e): e is Exam => Boolean(e))

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = openTabs.indexOf(active.id as string)
    const newIndex = openTabs.indexOf(over.id as string)
    if (oldIndex < 0 || newIndex < 0) return
    reorderTabs(arrayMove(openTabs, oldIndex, newIndex))
  }

  return (
    <div className="flex items-end gap-1 border-b border-border bg-muted/30 px-3 pt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={goHome}
        className="mb-0.5 mr-1 h-8 gap-1.5 text-muted-foreground hover:text-foreground"
      >
        <GraduationCap className="h-4 w-4" />
        <span className="hidden sm:inline">Gradebook</span>
      </Button>

      <div className="scroll-thin flex flex-1 items-end gap-1 overflow-x-auto pb-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={openTabs}
            strategy={horizontalListSortingStrategy}
          >
            {openExams.map((exam) => (
              <Tab key={exam.id} exam={exam} active={exam.id === activeTabId} />
            ))}
          </SortableContext>
        </DndContext>
        {openExams.length === 0 && (
          <div className="px-2 py-2 text-xs text-muted-foreground">
            No open exams — pick one from the home screen.
          </div>
        )}
      </div>

      <div className="mb-0.5 flex items-center gap-1">
        {openExams.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (confirmingCloseAll) {
                openTabs.forEach((id) => useAppStore.getState().closeTab(id))
                setConfirmingCloseAll(false)
              } else {
                setConfirmingCloseAll(true)
                setTimeout(() => setConfirmingCloseAll(false), 2500)
              }
            }}
          >
            {confirmingCloseAll ? "Close all?" : "Close all"}
          </Button>
        )}
        {openExams.length > 0 && <ShortcutsHelp />}
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  )
}
