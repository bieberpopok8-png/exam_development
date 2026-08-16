"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExamWithRelations, Question } from "@/lib/types"

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// Try to extract a student number from a filename.
// Matches "01", "student01", "Student 01", "01_answer", "jawaban-01", etc.
// Prefers the LAST 1–3 digit run so "exam_2024_01.pdf" → 01 (not 2024),
// and "01_final_02.pdf" → 02. Falls back to the first run if the last is
// out of a plausible student range (>999) but an earlier one isn't.
function guessStudentNumber(fileName: string): number | null {
  const base = fileName.replace(/\.[^.]+$/, "").toLowerCase()
  const runs = base.match(/\d{1,4}/g)
  if (!runs || runs.length === 0) return null
  // try runs from right to left, prefer a plausible one (1..999)
  for (let i = runs.length - 1; i >= 0; i--) {
    const n = parseInt(runs[i], 10)
    if (n >= 1 && n <= 999) return n
  }
  return null
}

interface StagedFile {
  id: string
  file: File
  fileName: string
  fileType: string
  fileData: string
  guessedNumber: number | null
  assignedStudentId: string | null
}

export function BulkImportDialog({
  exam,
  open,
  onOpenChange,
  onImported,
}: {
  exam: ExamWithRelations
  open: boolean
  onOpenChange: (v: boolean) => void
  onImported: () => void
}) {
  const [questionId, setQuestionId] = useState<string>("")
  const [staged, setStaged] = useState<StagedFile[]>([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const questions = useMemo(
    () => [...exam.questions].sort((a, b) => a.number - b.number),
    [exam.questions]
  )

  useEffect(() => {
    if (open) {
      setQuestionId(questions[0]?.id ?? "")
      setStaged([])
    }
  }, [open, exam.id])

  const studentByNumber = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of exam.students) {
      // anonymizedId is "Student 01" → number 1
      const match = s.anonymizedId.match(/(\d+)/)
      if (match) m.set(parseInt(match[1], 10), s.id)
    }
    return m
  }, [exam.students])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const next: StagedFile[] = []
    for (const file of Array.from(files)) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error(`"${file.name}" is too large (max 3 MB) — skipped`)
        continue
      }
      try {
        const data = await fileToDataUrl(file)
        const guessed = guessStudentNumber(file.name)
        next.push({
          id: `${file.name}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          fileName: file.name,
          fileType: file.type,
          fileData: data,
          guessedNumber: guessed,
          assignedStudentId:
            guessed != null ? studentByNumber.get(guessed) ?? null : null,
        })
      } catch {
        toast.error(`Failed to read "${file.name}"`)
      }
    }
    setStaged((prev) => [...prev, ...next])
  }

  function removeStaged(id: string) {
    setStaged((prev) => prev.filter((f) => f.id !== id))
  }

  function assign(id: string, studentId: string | null) {
    setStaged((prev) =>
      prev.map((f) => (f.id === id ? { ...f, assignedStudentId: studentId } : f))
    )
  }

  const ready = staged.filter((f) => f.assignedStudentId)
  const unassigned = staged.filter((f) => !f.assignedStudentId)
  const canImport =
    !!questionId && ready.length > 0 && !importing

  async function doImport() {
    if (!questionId || ready.length === 0) return
    setImporting(true)
    try {
      const res = await jfetch<{ created: number; updated: number; total: number }>(
        "/api/answers/bulk-import",
        {
          method: "POST",
          body: JSON.stringify({
            examId: exam.id,
            questionId,
            files: ready.map((f) => ({
              studentId: f.assignedStudentId!,
              fileName: f.fileName,
              fileType: f.fileType,
              fileData: f.fileData,
            })),
          }),
        }
      )
      toast.success(
        `Imported ${res.total} answer file${res.total === 1 ? "" : "s"} (${res.created} new, ${res.updated} updated)`
      )
      onImported()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed")
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk import answers
          </DialogTitle>
          <DialogDescription>
            Upload multiple answer files at once. Filenames with a number
            (e.g. <code>01.pdf</code>, <code>student_02.jpg</code>) are auto-matched to
            Student 01, 02, … You can adjust any mapping before importing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="bi-question">Question</Label>
            <Select value={questionId} onValueChange={setQuestionId}>
              <SelectTrigger id="bi-question" className="w-full">
                <SelectValue placeholder="Pick a question" />
              </SelectTrigger>
              <SelectContent>
                {questions.map((q: Question) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{q.number}
                    {q.rubricNotes ? ` · ${q.rubricNotes.slice(0, 40)}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void handleFiles(e.dataTransfer.files)
            }}
            className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                void handleFiles(e.target.files)
                e.target.value = ""
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 text-center"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
                <Upload className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">
                Choose files or drag them here
              </span>
              <span className="text-[10px] text-muted-foreground">
                Images & PDFs · max 3 MB each
              </span>
            </button>
          </div>

          {/* Staged files */}
          {staged.length > 0 && (
            <div className="scroll-thin max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border/70 bg-card p-2">
              {ready.length > 0 && (
                <p className="px-1 text-[10px] font-medium uppercase tracking-wide text-emerald-600">
                  {ready.length} matched
                </p>
              )}
              {ready.map((f) => (
                <StagedRow
                  key={f.id}
                  f={f}
                  students={exam.students}
                  matched
                  onAssign={assign}
                  onRemove={removeStaged}
                />
              ))}
              {unassigned.length > 0 && (
                <p className="mt-2 px-1 text-[10px] font-medium uppercase tracking-wide text-amber-600">
                  {unassigned.length} need a student
                </p>
              )}
              {unassigned.map((f) => (
                <StagedRow
                  key={f.id}
                  f={f}
                  students={exam.students}
                  matched={false}
                  onAssign={assign}
                  onRemove={removeStaged}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={doImport} disabled={!canImport} className="gap-1.5">
            {importing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {importing
              ? "Importing…"
              : `Import ${ready.length || ""} answer${ready.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function StagedRow({
  f,
  students,
  matched,
  onAssign,
  onRemove,
}: {
  f: StagedFile
  students: { id: string; anonymizedId: string }[]
  matched: boolean
  onAssign: (id: string, studentId: string | null) => void
  onRemove: (id: string) => void
}) {
  const isPdf =
    f.fileType.includes("pdf") || f.fileName.toLowerCase().endsWith(".pdf")
  const isImage = f.fileType.startsWith("image/")
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-2 py-1.5">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          isImage
            ? "bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
            : "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
        )}
      >
        {isPdf ? <FileText className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium">{f.fileName}</span>
          {matched ? (
            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-3 w-3 shrink-0 text-amber-600" />
          )}
        </div>
        {f.guessedNumber != null && (
          <span className="text-[10px] text-muted-foreground">
            guessed #{f.guessedNumber}
          </span>
        )}
      </div>
      <Select
        value={f.assignedStudentId ?? "__none__"}
        onValueChange={(v) => onAssign(f.id, v === "__none__" ? null : v)}
      >
        <SelectTrigger className="h-7 w-[120px] text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— none —</SelectItem>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.anonymizedId}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <button
        onClick={() => onRemove(f.id)}
        className="rounded p-1 text-muted-foreground transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
        aria-label="Remove file"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
