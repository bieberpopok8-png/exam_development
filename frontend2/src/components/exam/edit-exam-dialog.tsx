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
import { EXAM_COLORS, type ExamColor, type ExamWithRelations } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"

export function EditExamDialog({
  exam,
  open,
  onOpenChange,
  onSaved,
}: {
  exam: ExamWithRelations
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved?: () => void
}) {
  const [name, setName] = useState(exam.name)
  const [description, setDescription] = useState(exam.description)
  const [dueDate, setDueDate] = useState(
    exam.dueDate ? new Date(exam.dueDate).toISOString().slice(0, 10) : ""
  )
  const [color, setColor] = useState<ExamColor>(exam.color)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(exam.name)
      setDescription(exam.description)
      setDueDate(
        exam.dueDate ? new Date(exam.dueDate).toISOString().slice(0, 10) : ""
      )
      setColor(exam.color)
    }
  }, [open, exam])

  async function handleSave() {
    setSaving(true)
    try {
      await jfetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          color,
        }),
      })
      toast.success("Exam updated")
      onSaved?.()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit exam</DialogTitle>
          <DialogDescription>
            Update the exam details. Rubric and answers stay intact.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="ed-name">Name</Label>
            <Input
              id="ed-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ed-desc">Description</Label>
            <Textarea
              id="ed-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ed-due">Due date</Label>
            <Input
              id="ed-due"
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
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
