"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EXAM_COLORS, type ExamColor } from "@/lib/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"
import { Plus } from "lucide-react"

export function refreshExams() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("gradebook:refresh-exams"))
  }
}

export function AddExamDialog({
  onCreated,
  trigger,
  className,
}: {
  onCreated?: () => void
  trigger?: React.ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [color, setColor] = useState<ExamColor>("emerald")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Please give the exam a name.")
      return
    }
    setSaving(true)
    try {
      await jfetch("/api/exams", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          color,
        }),
      })
      toast.success("Exam created")
      setOpen(false)
      setName("")
      setDescription("")
      setDueDate("")
      setColor("emerald")
      onCreated?.()
      refreshExams()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create exam")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className={className}>
          {trigger ?? (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New exam
            </Button>
          )}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>New exam</DialogTitle>
          <DialogDescription>
            Create a new exam workspace. You can fill the rubric and answers later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="ex-name">Name</Label>
            <Input
              id="ex-name"
              autoFocus
              placeholder="e.g. Kimia 2 — Ujian Tengah Semester"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave()
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ex-desc">Description</Label>
            <Textarea
              id="ex-desc"
              placeholder="Short summary of what the exam covers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ex-due">Due date</Label>
            <Input
              id="ex-due"
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
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Creating…" : "Create exam"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
