"use client"

import { useMemo, useState } from "react"
import type { Exam } from "@/lib/types"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AddExamDialog, refreshExams } from "./add-exam-dialog"
import { ExamCalendar } from "./exam-calendar"
import { DuplicateExamDialog } from "./duplicate-exam-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { ProgressRing } from "@/components/progress-ring"
import { useT } from "@/hooks/use-t"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  List as ListIcon,
  CalendarDays,
  Plus,
  X,
  ChevronRight,
  GraduationCap,
  Inbox,
  MoreVertical,
  Copy,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type SortKey = "newest" | "oldest" | "due-soon" | "due-late" | "name" | "progress-most" | "progress-least"

function formatDate(d: string | null) {
  if (!d) return "No due date"
  const date = new Date(d)
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function relativeDue(d: string | null) {
  if (!d) return null
  const date = new Date(d)
  const now = new Date()
  const ms = date.getTime() - now.getTime()
  const days = Math.round(ms / 86400000)
  if (days === 0) return "Due today"
  if (days === 1) return "Due tomorrow"
  if (days === -1) return "1 day overdue"
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days < 14) return `Due in ${days} days`
  return null
}

export function HomeView({ exams }: { exams: Exam[] }) {
  const { t } = useT()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("newest")
  const [view, setView] = useState<"list" | "calendar">("list")
  const openExam = useAppStore((s) => s.openExam)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = exams
    if (q) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
      case "oldest":
        sorted.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        break
      case "due-soon":
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return +new Date(a.dueDate) - +new Date(b.dueDate)
        })
        break
      case "due-late":
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return +new Date(b.dueDate) - +new Date(a.dueDate)
        })
        break
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "progress-most":
        sorted.sort(
          (a, b) =>
            (b.progress?.fraction ?? 0) - (a.progress?.fraction ?? 0)
        )
        break
      case "progress-least":
        sorted.sort(
          (a, b) =>
            (a.progress?.fraction ?? 0) - (b.progress?.fraction ?? 0)
        )
        break
    }
    return sorted
  }, [exams, query, sort])

  async function handleDelete(id: string) {
    try {
      await jfetch(`/api/exams/${id}`, { method: "DELETE" })
      toast.success("Exam deleted")
      refreshExams()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed")
    }
  }

  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Gradebook</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {/* Title row */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("home.exams")}</h1>
            <p className="text-sm text-muted-foreground">
              {exams.length} {exams.length === 1 ? t("home.exams").toLowerCase() : t("home.exams").toLowerCase()} · {t("home.subtitle")}
            </p>
          </div>
          <AddExamDialog
            onCreated={refreshExams}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> New exam
              </Button>
            }
          />
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("home.search.placeholder")}
            className="h-11 rounded-xl pl-10 pr-9 text-base shadow-sm"
            aria-label="Search exams"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {filtered.length} {filtered.length === 1 ? t("home.result") : t("home.results")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-9 w-[160px] rounded-lg" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("sort.newest")}</SelectItem>
                <SelectItem value="oldest">{t("sort.oldest")}</SelectItem>
                <SelectItem value="due-soon">{t("sort.dueSoon")}</SelectItem>
                <SelectItem value="due-late">{t("sort.dueLate")}</SelectItem>
                <SelectItem value="name">{t("sort.name")}</SelectItem>
                <SelectItem value="progress-most">{t("sort.progressMost")}</SelectItem>
                <SelectItem value="progress-least">{t("sort.progressLeast")}</SelectItem>
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as "list" | "calendar")}
              className="rounded-lg border bg-card p-0.5"
            >
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="h-8 rounded-md px-2.5 data-[state=on]:bg-muted"
              >
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="calendar"
                aria-label="Calendar view"
                className="h-8 rounded-md px-2.5 data-[state=on]:bg-muted"
              >
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          {view === "list" ? (
            filtered.length === 0 ? (
              <EmptyState query={query} hasExams={exams.length > 0} />
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 bg-card">
                {filtered.map((exam) => (
                  <ExamRow
                    key={exam.id}
                    exam={exam}
                    onOpen={() => openExam(exam.id)}
                    onDelete={() => handleDelete(exam.id)}
                  />
                ))}
              </ul>
            )
          ) : (
            <ExamCalendar exams={filtered} onOpen={(id) => openExam(id)} />
          )}
        </div>
      </main>
    </div>
  )
}

function ExamRow({
  exam,
  onOpen,
  onDelete,
}: {
  exam: Exam
  onOpen: () => void
  onDelete: () => void
}) {
  const { t } = useT()
  const rel = relativeDue(exam.dueDate)
  const overdue = rel?.includes("overdue")
  const qCount = exam._count?.questions ?? 0
  const sCount = exam._count?.students ?? 0
  const fraction = exam.progress?.fraction ?? 0
  const gradedCells = exam.progress?.gradedCells ?? 0
  const totalCells = exam.progress?.totalCells ?? 0
  const hasAny = totalCells > 0
  const [dupOpen, setDupOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function stop<T extends React.MouseEvent>(e: T) {
    e.stopPropagation()
  }

  return (
    <li
      onClick={onOpen}
      className="group flex cursor-pointer items-center gap-4 px-4 py-3.5 transition hover:bg-muted/50 focus-visible:bg-muted/50 sm:px-5"
    >
      <span
        className={cn(
          "h-9 w-1.5 shrink-0 rounded-full",
          exam.color === "slate" && "bg-slate-400",
          exam.color === "emerald" && "bg-emerald-500",
          exam.color === "amber" && "bg-amber-500",
          exam.color === "rose" && "bg-rose-500",
          exam.color === "violet" && "bg-violet-500",
          exam.color === "cyan" && "bg-cyan-500",
          exam.color === "orange" && "bg-orange-500"
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{exam.name}</h3>
          {rel && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                overdue
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              )}
            >
              {rel}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {exam.description || t("home.noDescription")}
        </p>
      </div>
      {/* Grading progress (hidden on very small screens to keep the row scannable) */}
      <div className="hidden shrink-0 items-center gap-2 xs:flex sm:flex">
        <ProgressRing value={fraction} size={34} />
        <div className="hidden text-right md:block">
          <div className="text-[11px] font-medium leading-tight tabular-nums">
            {hasAny ? `${gradedCells}/${totalCells} ${t("home.graded")}` : t("home.noStudents")}
          </div>
          <div className="text-[10px] text-muted-foreground leading-tight">
            {hasAny
              ? exam.progress?.avgScore != null
                ? `avg ${exam.progress.avgScore.toFixed(1)}/${exam.progress.maxScore || "—"} · ${Math.round(fraction * 100)}%`
                : `${Math.round(fraction * 100)}% ${t("home.complete")}`
              : t("home.addStudentsToGrade")}
          </div>
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-4 sm:flex">
        <div className="text-right">
          <div className="text-xs font-medium">{formatDate(exam.dueDate)}</div>
          <div className="text-[11px] text-muted-foreground">
            {qCount} {qCount === 1 ? t("home.question") : t("home.questions")} ·{" "}
            {sCount} {sCount === 1 ? t("home.student") : t("home.students")}
          </div>
        </div>
      </div>

      {/* Row actions menu (duplicate / delete) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={stop}
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Exam actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={stop}>
          <DropdownMenuItem onClick={() => setDupOpen(true)}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{exam.name}”, its rubric, answers, and students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DuplicateExamDialog
        exam={exam}
        open={dupOpen}
        onOpenChange={setDupOpen}
      />

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
    </li>
  )
}

function EmptyState({
  query,
  hasExams,
}: {
  query: string
  hasExams: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium">
        {query ? `No exams match “${query}”` : hasExams ? "Nothing here" : "No exams yet"}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {query
          ? "Try a different keyword, or clear the search."
          : "Create your first exam to start building a rubric and grading answers."}
      </p>
      {!query && <AddExamDialog className="mt-4" />}
    </div>
  )
}
