"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EXAM_COLORS, type ExamColor, type Exam } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"
import { refreshExams } from "./add-exam-dialog"
import { Copy, Loader2 } from "lucide-react"

export function DuplicateExamDialog({
  exam,
  open,
  onOpenChange,
}: {
  exam: Exam
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [name, setName] = useState(`${exam.name} (copy)`)
  const [description, setDescription] = useState(exam.description)
  const [dueDate, setDueDate] = useState(
    exam.dueDate ? new Date(exam.dueDate).toISOString().slice(0, 10) : ""
  )
  const [color, setColor] = useState<ExamColor>(exam.color)
  const [includeStudents, setIncludeStudents] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(`${exam.name} (copy)`)
      setDescription(exam.description)
      setDueDate(
        exam.dueDate ? new Date(exam.dueDate).toISOString().slice(0, 10) : ""
      )
      setColor(exam.color)
      setIncludeStudents(false)
    }
  }, [open, exam])

  async function handleDuplicate() {
    if (!name.trim()) {
      toast.error("Please give the new exam a name.")
      return
    }
    setSaving(true)
    try {
      const res = await jfetch<{ id: string; questionsCloned: number; studentsCloned: number }>(
        `/api/exams/${exam.id}/duplicate`,
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            color,
            includeStudents,
          }),
        }
      )
      toast.success(
        `Duplicated exam · ${res.questionsCloned} question${
          res.questionsCloned === 1 ? "" : "s"
        }${includeStudents ? ` · ${res.studentsCloned} students` : ""}`
      )
      refreshExams()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to duplicate exam")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate exam
          </DialogTitle>
          <DialogDescription>
            Clone the rubric (questions, files, notes, max scores) into a new exam. Answers never carry over.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="dup-name">Name</Label>
            <Input
              id="dup-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dup-desc">Description</Label>
            <Textarea
              id="dup-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dup-due">Due date</Label>
            <Input
              id="dup-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Accent</Label>
            <div className="flex flex-wrap gap-2">
              {EXAM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-background transition",
                    c === "slate" && "bg-slate-400",
                    c === "emerald" && "bg-emerald-500",
                    c === "amber" && "bg-amber-500",
                    c === "rose" && "bg-rose-500",
                    c === "violet" && "bg-violet-500",
                    c === "cyan" && "bg-cyan-500",
                    c === "orange" && "bg-orange-500",
                    color === c ? "ring-foreground" : "ring-transparent"
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <label
            htmlFor="dup-students"
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border/70 bg-muted/30 px-3 py-2.5 transition hover:bg-muted/50"
          >
            <Checkbox
              id="dup-students"
              checked={includeStudents}
              onCheckedChange={(v) => setIncludeStudents(v === true)}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <div className="text-xs font-medium">Also copy students</div>
              <div className="text-[11px] text-muted-foreground">
                Clones anonymized IDs ({exam._count?.students ?? 0}) with fresh, empty answers.
              </div>
            </div>
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={saving} className="gap-1.5">
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {saving ? "Duplicating…" : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
