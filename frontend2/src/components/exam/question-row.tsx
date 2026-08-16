"use client"

import { useRef, useState } from "react"
import type { Answer, Question } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { jfetch } from "@/hooks/use-exams"
import { FileExtractArea } from "./extract-table"
import { useT } from "@/hooks/use-t"
import {
  Trash2,
  Loader2,
  Sparkles,
  Check,
  Wand2,
} from "lucide-react"

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface RubricRowProps {
  question: Question
  onChange: (patch: Partial<Question>) => void
  onDelete: () => void
  onAddNext?: () => void
  gradedCount?: number
  studentCount?: number
  scores?: number[] // graded scores for this question (for distribution)
}

interface AnswerRowProps {
  question: Question
  answer: Answer | null // per-student answer; null = no answer yet
  studentId: string
  onAnswerChange: (patch: Partial<Answer>) => void
  onDelete: () => void
  onAddNext?: () => void
}

export function RubricRow({
  question,
  onChange,
  onDelete,
  onAddNext,
  gradedCount = 0,
  studentCount = 0,
  scores = [],
}: RubricRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

  // Patch a subset of Question fields to both the server and the parent (optimistic).
  async function patchQuestion(patch: Partial<Question>) {
    onChange(patch)
    try {
      await jfetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      })
    } catch {
      /* rollback handled by caller if needed */
    }
  }

  // Run the LLM extraction for this row's rubric file. Called automatically
  // after upload (with the freshly-read file data passed in) and manually on
  // retry (reads from the persisted question prop).
  async function runExtraction(fileOverride?: { name: string; type: string; data: string }) {
    const fName = fileOverride?.name ?? question.rubricFileName ?? ""
    const fType = fileOverride?.type ?? question.rubricFileType ?? ""
    const fData = fileOverride?.data ?? question.rubricFileData ?? ""
    if (!fName || !fData) {
      toast.error("No file to extract from")
      return
    }
    setExtractError(null)
    await patchQuestion({ rubricStatus: "processing" })
    try {
      const res = await jfetch<{ items: { criterion: string; points: number | null }[] }>(
        "/api/parse",
        {
          method: "POST",
          body: JSON.stringify({
            kind: "rubric",
            fileName: fName,
            fileType: fType,
            fileData: fData,
            context: question.rubricNotes,
          }),
        }
      )
      await patchQuestion({
        rubricExtract: JSON.stringify({ items: res.items }),
        rubricStatus: "ready",
      })
      toast.success(`Extracted ${res.items.length} criteria`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Extraction failed"
      setExtractError(msg)
      await patchQuestion({ rubricStatus: "failed" })
      toast.error(msg)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File too large (max 3 MB).")
      return
    }
    setExtractError(null)
    // uploading state
    await patchQuestion({ rubricStatus: "uploading" })
    try {
      const data = await fileToDataUrl(file)
      await patchQuestion({
        rubricFileName: file.name,
        rubricFileType: file.type,
        rubricFileData: data,
      })
      // auto-trigger extraction, passing the freshly-read data directly
      // (the question prop hasn't updated yet at this point in the closure)
      void runExtraction({ name: file.name, type: file.type, data })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
      await patchQuestion({ rubricStatus: "empty" })
    }
  }

  async function removeFile() {
    setExtractError(null)
    await patchQuestion({
      rubricFileName: null,
      rubricFileType: null,
      rubricFileData: null,
      rubricExtract: "",
      rubricStatus: "empty",
    })
  }

  async function updateNotes(value: string) {
    const prev = question.rubricNotes
    onChange({ rubricNotes: value })
    try {
      await jfetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        body: JSON.stringify({ rubricNotes: value }),
      })
    } catch (e) {
      onChange({ rubricNotes: prev })
      toast.error(e instanceof Error ? e.message : "Save failed — reverted")
    }
  }

  async function updateMaxScore(value: string) {
    const v = value === "" ? null : Number(value)
    const prev = question.maxScore
    onChange({ maxScore: v })
    try {
      await jfetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        body: JSON.stringify({ maxScore: v }),
      })
    } catch (e) {
      onChange({ maxScore: prev })
      toast.error(e instanceof Error ? e.message : "Save failed — reverted")
    }
  }

  return (
    <RowShell
      number={question.number}
      onDelete={onDelete}
      onAddNext={onAddNext}
      badgeTone="primary"
      rightMeta={
        studentCount > 0 ? (
          <div className="flex flex-col items-center gap-0.5" title={`${gradedCount} of ${studentCount} students graded on this question`}>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
                gradedCount === studentCount
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : gradedCount > 0
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {gradedCount === studentCount && gradedCount > 0 ? (
                <Check className="h-2.5 w-2.5" />
              ) : null}
              {gradedCount}/{studentCount}
            </span>
            {scores.length > 0 && question.maxScore ? (
              <ScoreDistribution
                scores={scores}
                maxScore={question.maxScore}
              />
            ) : null}
          </div>
        ) : undefined
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn("rounded-lg transition", dragOver && "ring-2 ring-primary/40")}
      >
        <FileExtractArea
          status={question.rubricStatus}
          fileName={question.rubricFileName}
          fileType={question.rubricFileType}
          fileData={question.rubricFileData}
          extractJson={question.rubricExtract}
          kind="rubric"
          error={extractError ?? undefined}
          onPick={() => fileInputRef.current?.click()}
          onReplace={() => fileInputRef.current?.click()}
          onRemove={removeFile}
          onRetry={runExtraction}
        />
      </div>

      <div className="mt-3 grid gap-3">
        <div className="grid gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Rubric notes
          </label>
          <Textarea
            value={question.rubricNotes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Describe the grading criteria for this question…"
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Max score
          </label>
          <Input
            type="number"
            value={question.maxScore ?? ""}
            onChange={(e) => updateMaxScore(e.target.value)}
            placeholder="20"
            className="text-sm sm:w-32"
          />
        </div>
      </div>
    </RowShell>
  )
}

export function AnswerRow({
  question,
  answer,
  studentId,
  onAnswerChange,
  onDelete,
  onAddNext,
}: AnswerRowProps) {
  const { t } = useT()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<number | null>(null)

  // Derive view state from the answer record (or defaults when none exists yet)
  const fileName = answer?.fileName ?? null
  const fileData = answer?.fileData ?? null
  const fileType = answer?.fileType ?? null
  const notes = answer?.notes ?? ""
  const score = answer?.score ?? null
  const feedback = answer?.feedback ?? ""
  const graded = answer?.graded ?? false
  const extractStatus = answer?.extractStatus ?? "empty"
  const extractJson = answer?.extract ?? ""

  async function upsertAnswer(patch: Partial<Answer>) {
    // capture previous values for rollback on failure
    const prev = answer
      ? { ...answer }
      : null
    onAnswerChange(patch)
    try {
      await jfetch("/api/answers", {
        method: "POST",
        body: JSON.stringify({ questionId: question.id, studentId, patch }),
      })
    } catch (e) {
      // rollback to previous state and notify
      if (prev) {
        onAnswerChange(prev)
      } else {
        // no prior answer — clear the patches we just applied
        onAnswerChange({
          fileName: null,
          fileType: null,
          fileData: null,
          notes: "",
          parsed: "",
          extract: "",
          extractStatus: "empty",
          score: null,
          feedback: "",
          graded: false,
          aiGraded: false,
        })
      }
      toast.error(e instanceof Error ? e.message : "Save failed — reverted")
    }
  }

  // Run the LLM extraction for this answer file. fileOverride is passed from
  // handleFiles (the prop hasn't updated yet); retry reads from the prop.
  async function runExtraction(fileOverride?: { name: string; type: string; data: string }) {
    const fName = fileOverride?.name ?? fileName ?? ""
    const fType = fileOverride?.type ?? fileType ?? ""
    const fData = fileOverride?.data ?? fileData ?? ""
    if (!fName || !fData) {
      toast.error("No file to extract from")
      return
    }
    setExtractError(null)
    await upsertAnswer({ extractStatus: "processing" })
    try {
      const res = await jfetch<{ items: { question: string; answer: string }[] }>(
        "/api/parse",
        {
          method: "POST",
          body: JSON.stringify({
            kind: "answer",
            fileName: fName,
            fileType: fType,
            fileData: fData,
            context: notes,
          }),
        }
      )
      await upsertAnswer({
        extract: JSON.stringify({ items: res.items }),
        extractStatus: "ready",
      })
      toast.success(`Extracted ${res.items.length} items`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Extraction failed"
      setExtractError(msg)
      await upsertAnswer({ extractStatus: "failed" })
      toast.error(msg)
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File too large (max 3 MB).")
      return
    }
    setExtractError(null)
    await upsertAnswer({ extractStatus: "uploading" })
    try {
      const data = await fileToDataUrl(file)
      await upsertAnswer({
        fileName: file.name,
        fileType: file.type,
        fileData: data,
      })
      // auto-trigger extraction, passing the freshly-read data directly
      void runExtraction({ name: file.name, type: file.type, data })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
      await upsertAnswer({ extractStatus: "empty" })
    }
  }

  async function removeFile() {
    setExtractError(null)
    await upsertAnswer({
      fileName: null,
      fileType: null,
      fileData: null,
      extract: "",
      extractStatus: "empty",
    })
  }

  // Update a single answer item's grade in the extract JSON and persist.
  async function handleGradeChange(index: number, grade: string) {
    try {
      const parsed = extractJson ? JSON.parse(extractJson) as { items: { question: string; answer: string; grade: string }[] } : { items: [] }
      const items = [...(parsed.items ?? [])]
      if (items[index]) {
        items[index] = { ...items[index], grade }
        const nextExtract = JSON.stringify({ items })
        await upsertAnswer({ extract: nextExtract })
      }
    } catch {
      /* ignore parse errors */
    }
  }

  async function updateScore(value: string) {
    const v = value === "" ? null : Number(value)
    await upsertAnswer({ score: v })
  }

  async function suggestScore() {
    setSuggesting(true)
    try {
      const res = await jfetch<{ score: number; feedback: string; maxScore: number }>(
        "/api/suggest-score",
        {
          method: "POST",
          body: JSON.stringify({ questionId: question.id, studentId }),
        }
      )
      // apply the suggestion optimistically (the user can still edit)
      await upsertAnswer({
        score: res.score,
        feedback: res.feedback,
        graded: true,
        aiGraded: true,
      })
      toast.success(`Suggested ${res.score}/${res.maxScore}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suggestion failed")
    } finally {
      setSuggesting(false)
    }
  }

  return (
    <RowShell
      number={question.number}
      onDelete={onDelete}
      onAddNext={onAddNext}
      badgeTone={graded ? "emerald" : "primary"}
      rightMeta={
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            / {question.maxScore ?? "—"}
          </span>
          {answer?.aiGraded && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1 py-px text-[8px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
              title="Score was set by AI — review before finalizing"
            >
              <Sparkles className="h-2 w-2" />
              AI
            </span>
          )}
        </div>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn("rounded-lg transition", dragOver && "ring-2 ring-primary/40")}
      >
        <FileExtractArea
          status={extractStatus}
          fileName={fileName}
          fileType={fileType}
          fileData={fileData}
          extractJson={extractJson}
          kind="answer"
          error={extractError ?? undefined}
          onPick={() => fileInputRef.current?.click()}
          onReplace={() => fileInputRef.current?.click()}
          onRemove={removeFile}
          onRetry={runExtraction}
          onGradeChange={handleGradeChange}
          onRowSelect={setSelectedRow}
          selectedRow={selectedRow}
        />
      </div>

      {/* Excerpt: student's full answer text with row-click highlighting */}
      {(() => {
        const parsed = extractJson ? (() => {
          try { return JSON.parse(extractJson) as { items: { question: string; answer: string; grade: string }[] } } catch { return null }
        })() : null
        const items = parsed?.items ?? []
        const fullText = items.map((it) => it.answer).filter(Boolean).join("\n\n")
        const highlightText = selectedRow != null && items[selectedRow]?.answer
          ? items[selectedRow].answer
          : null
        if (!fullText) return null
        return (
          <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50/50 p-3 dark:border-slate-600 dark:bg-slate-800/20">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("answer.excerpt")}
              </label>
              <span className="text-[10px] text-muted-foreground/70">
                {t("answer.excerptHint")}
              </span>
            </div>
            <div className="scroll-thin max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground">
              {highlightText && fullText.includes(highlightText) ? (
                <HighlightedText text={fullText} highlight={highlightText} />
              ) : (
                fullText
              )}
            </div>
          </div>
        )
      })()}

      <div className="mt-3 grid gap-3">
        <div className="grid gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("answer.answerNotes")}
          </label>
          <Textarea
            value={notes}
            onChange={(e) => upsertAnswer({ notes: e.target.value })}
            placeholder={t("answer.notesPlaceholder")}
            rows={3}
            className="text-sm"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
          <div className="grid gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("answer.score")}
            </label>
            <Input
              type="number"
              value={score ?? ""}
              onChange={(e) => updateScore(e.target.value)}
              placeholder="—"
              className="text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t("answer.max")}
            </label>
            <Input
              type="number"
              value={question.maxScore ?? ""}
              onChange={() => {
                /* max lives on the question; editable on rubric view */
              }}
              placeholder="20"
              disabled
              className="cursor-not-allowed text-sm opacity-70"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={suggestScore}
              disabled={suggesting}
              title={t("answer.suggest.tooltip")}
            >
              {suggesting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{t("answer.suggest")}</span>
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              variant={graded ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => upsertAnswer({ graded: !graded })}
            >
              <Check className="h-3.5 w-3.5" />
              {graded ? t("answer.graded") : t("answer.markGraded")}
            </Button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("answer.feedback")}
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => upsertAnswer({ feedback: e.target.value })}
            placeholder={t("answer.feedbackPlaceholder")}
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </RowShell>
  )
}

function RowShell({
  number,
  onDelete,
  onAddNext,
  badgeTone,
  rightMeta,
  children,
}: {
  number: number
  onDelete: () => void
  onAddNext?: () => void
  badgeTone: "primary" | "emerald"
  rightMeta?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="group/row rounded-xl border border-border/70 bg-card p-4 transition hover:border-border focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
              badgeTone === "emerald"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-primary/10 text-primary"
            )}
          >
            {number}
          </div>
          {rightMeta}
        </div>
        <div className="min-w-0 flex-1">{children}</div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-rose-100 hover:text-rose-600 focus-visible:opacity-100 group-hover/row:opacity-100 dark:hover:bg-rose-950/40"
            aria-label="Delete row"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {onAddNext && (
        <div className="mt-3 border-t border-dashed border-border pt-3">
          <button
            onClick={onAddNext}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-base leading-none">
              +
            </span>
            Add question
          </button>
        </div>
      )}
    </div>
  )
}

// Tiny score-distribution bar: shows each graded score as a vertical tick
// positioned along a 0..maxScore axis. Gives a quick visual sense of the
// spread (clustered high? bimodal? everyone failed?).
function ScoreDistribution({
  scores,
  maxScore,
}: {
  scores: number[]
  maxScore: number
}) {
  if (!maxScore || scores.length === 0) return null
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length
  const avgPct = (avg / maxScore) * 100
  return (
    <div
      className="relative h-1.5 w-12 overflow-hidden rounded-full bg-muted"
      title={`avg ${avg.toFixed(1)}/${maxScore} · ${scores.length} graded`}
    >
      {/* average marker */}
      <div
        className="absolute top-0 h-full bg-primary/40"
        style={{ width: `${avgPct}%` }}
      />
      {/* individual score ticks */}
      {scores.map((s, i) => {
        const pct = (s / maxScore) * 100
        return (
          <div
            key={i}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-foreground/70"
            style={{ left: `${pct}%` }}
          />
        )
      })}
    </div>
  )
}

// Renders text with a highlighted substring. The highlight uses a warm amber
// background so it stands out clearly against the surrounding text.
function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight) return <>{text}</>
  const idx = text.indexOf(highlight)
  if (idx < 0) return <>{text}</>
  const before = text.slice(0, idx)
  const after = text.slice(idx + highlight.length)
  return (
    <>
      {before}
      <mark className="rounded bg-amber-200 px-0.5 py-px text-foreground dark:bg-amber-500/40">
        {highlight}
      </mark>
      {after}
    </>
  )
}
