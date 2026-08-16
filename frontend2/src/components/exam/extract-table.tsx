"use client"

import { cn } from "@/lib/utils"
import type { RubricExtract, AnswerExtract } from "@/lib/types"
import { FileText, AlertCircle, CheckCircle2, Loader2, ChevronDown, ChevronRight, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useT } from "@/hooks/use-t"

type ExtractStatus = "empty" | "uploading" | "processing" | "ready" | "failed"

function parseExtract<T>(json: string): T | null {
  if (!json) return null
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Renders the file-extraction area for a row with 5 distinct states:
 * empty → uploading → processing → ready (collapsed table) → failed (retry).
 *
 * - `status` drives the visual state.
 * - `fileName` / `onReplace` / `onRemove` for file management.
 * - `extractJson` is the structured JSON string from the LLM.
 * - `kind` determines the table columns (rubric: criterion/points, answer: question/answer).
 * - `onRetry` re-triggers extraction.
 * - `error` shows the failure message.
 */
export function FileExtractArea({
  status,
  fileName,
  fileType,
  fileData,
  extractJson,
  kind,
  error,
  onPick,
  onReplace,
  onRemove,
  onRetry,
  onGradeChange,
  onRowSelect,
  selectedRow,
}: {
  status: ExtractStatus
  fileName: string | null
  fileType: string | null
  fileData: string | null
  extractJson: string
  kind: "rubric" | "answer"
  error?: string
  onPick: () => void
  onReplace: () => void
  onRemove: () => void
  onRetry: () => void
  onGradeChange?: (index: number, grade: string) => void
  onRowSelect?: (index: number | null) => void
  selectedRow?: number | null
}) {
  const [expanded, setExpanded] = useState(false)

  // --- Empty state: no file at all ---
  if (!fileName && !fileData) {
    return (
      <button
        onClick={onPick}
        className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-left transition hover:border-primary/40 hover:bg-primary/5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-medium">
            Upload {kind === "rubric" ? "rubric" : "answer"} file
          </p>
          <p className="text-[11px] text-muted-foreground">
            Auto-extracts {kind === "rubric" ? "criteria & points" : "questions & answers"} via AI
          </p>
        </div>
      </button>
    )
  }

  // --- Uploading state ---
  if (status === "uploading") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div>
          <p className="text-xs font-medium">Uploading…</p>
          <p className="text-[11px] text-muted-foreground">{fileName}</p>
        </div>
      </div>
    )
  }

  // --- Processing state ---
  if (status === "processing") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
            AI extracting {kind === "rubric" ? "criteria" : "answers"}…
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{fileName}</p>
        </div>
        <button
          onClick={onRemove}
          className="rounded p-1 text-muted-foreground transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
          aria-label="Cancel"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  // --- Failed state ---
  if (status === "failed") {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/40 dark:bg-rose-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
              Extraction failed
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {error || "Could not extract content from this file."}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-rose-700"
          >
            <RotateCcw className="h-3 w-3" />
            Retry extraction
          </button>
          <button
            onClick={onReplace}
            className="text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            Replace file
          </button>
          <button
            onClick={onRemove}
            className="text-[11px] text-muted-foreground transition hover:text-rose-600"
          >
            Remove
          </button>
        </div>
      </div>
    )
  }

  // --- Ready state: collapsed summary, expandable table ---
  const extract =
    kind === "rubric"
      ? parseExtract<RubricExtract>(extractJson)
      : parseExtract<AnswerExtract>(extractJson)
  const itemCount = extract?.items?.length ?? 0

  return (
    <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/10">
      {/* Summary row (click to expand/collapse) */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <FileThumb fileName={fileName} fileType={fileType} fileData={fileData} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span className="truncate text-xs font-medium">{fileName}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {itemCount > 0
              ? `${itemCount} ${kind === "rubric" ? "criteria" : "items"} extracted`
              : "No items extracted"}
          </p>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Ready
        </span>
      </button>

      {/* Expandable table */}
      {expanded && extract && itemCount > 0 && (
        <div className="border-t border-emerald-200/50 dark:border-emerald-900/30">
          {kind === "rubric" ? (
            <RubricTable items={(extract as RubricExtract).items} />
          ) : (
            <AnswerTable
              items={(extract as AnswerExtract).items}
              onGradeChange={onGradeChange}
              onRowSelect={onRowSelect}
              selectedRow={selectedRow ?? null}
            />
          )}
        </div>
      )}

      {/* Actions under the summary */}
      <div className="flex items-center gap-2 border-t border-emerald-200/50 px-3 py-1.5 dark:border-emerald-900/30">
        <button
          onClick={onReplace}
          className="text-[10px] text-muted-foreground transition hover:text-foreground"
        >
          Replace
        </button>
        <span className="text-muted-foreground/30">·</span>
        <button
          onClick={onRetry}
          className="text-[10px] text-muted-foreground transition hover:text-foreground"
        >
          Re-extract
        </button>
        <span className="text-muted-foreground/30">·</span>
        <button
          onClick={onRemove}
          className="text-[10px] text-muted-foreground transition hover:text-rose-600"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function FileThumb({
  fileName,
  fileType,
  fileData,
}: {
  fileName: string | null
  fileType: string | null
  fileData: string | null
}) {
  if (fileData && fileType?.startsWith("image/")) {
    return (
      <img
        src={fileData}
        alt={fileName ?? "upload"}
        className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-border"
      />
    )
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
      <FileText className="h-4 w-4" />
    </div>
  )
}

function RubricTable({ items }: { items: { criterion: string; points: number | null }[] }) {
  const { t } = useT()
  return (
    <div className="scroll-thin max-h-64 overflow-y-auto rounded-b-lg border border-slate-300 dark:border-slate-600">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="w-8 border border-slate-400 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">#</th>
            <th className="border border-slate-400 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.criterion")}</th>
            <th className="w-20 border border-slate-400 px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.points")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="transition hover:bg-muted/40 even:bg-slate-50 dark:even:bg-slate-800/30">
              <td className="border border-slate-300 px-2 py-1.5 text-muted-foreground tabular-nums dark:border-slate-600">{i + 1}</td>
              <td className="border border-slate-300 px-3 py-1.5 dark:border-slate-600">{it.criterion || "—"}</td>
              <td className="border border-slate-300 px-3 py-1.5 text-right font-medium tabular-nums dark:border-slate-600">
                {it.points != null ? it.points : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnswerTable({
  items,
  onGradeChange,
  onRowSelect,
  selectedRow,
}: {
  items: { question: string; answer: string; grade: string; value?: number | null }[]
  onGradeChange?: (index: number, grade: string) => void
  onRowSelect?: (index: number | null) => void
  selectedRow: number | null
}) {
  const { t } = useT()
  return (
    <div className="scroll-thin max-h-64 overflow-y-auto rounded-b-lg border border-slate-300 dark:border-slate-600">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            <th className="w-8 border border-slate-400 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">#</th>
            <th className="border border-slate-400 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.criterion")}</th>
            <th className="border border-slate-400 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.answer")}</th>
            <th className="w-20 border border-slate-400 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.value")}</th>
            <th className="w-24 border border-slate-400 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide dark:border-slate-500">{t("table.grade")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr
              key={i}
              className={cn(
                "align-top cursor-pointer transition hover:bg-amber-50 dark:hover:bg-amber-950/20 even:bg-slate-50 dark:even:bg-slate-800/30",
                selectedRow === i && "bg-amber-100 dark:bg-amber-950/30"
              )}
              onClick={() => onRowSelect?.(selectedRow === i ? null : i)}
            >
              <td className="border border-slate-300 px-2 py-1.5 text-muted-foreground tabular-nums dark:border-slate-600">{i + 1}</td>
              <td className="border border-slate-300 px-3 py-1.5 dark:border-slate-600">{it.question || "—"}</td>
              <td className="border border-slate-300 px-3 py-1.5 dark:border-slate-600">{it.answer || "—"}</td>
              <td className="border border-slate-300 px-3 py-1.5 text-center font-medium tabular-nums dark:border-slate-600">
                {it.value != null ? it.value : "—"}
              </td>
              <td className="border border-slate-300 px-2 py-1 text-center dark:border-slate-600" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={it.grade ?? ""}
                  onChange={(e) => onGradeChange?.(i, e.target.value)}
                  placeholder="—"
                  className="w-16 border border-slate-300 bg-background px-1.5 py-0.5 text-center text-xs tabular-nums focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-slate-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
