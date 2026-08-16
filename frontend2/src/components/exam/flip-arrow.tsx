"use client"

import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowLeft, ClipboardCheck, FileText } from "lucide-react"

/**
 * The single arrow control that flips between Rubric and Answer views.
 * - On Rubric: sits top-RIGHT, arrow points right, label "Answer".
 * - On Answer: sits top-LEFT, arrow points left, label "Rubric".
 */
export function FlipArrow({ side }: { side: "right" | "left" }) {
  const subView = useAppStore((s) => (s.activeTabId ? s.subViews[s.activeTabId] ?? "rubric" : "rubric"))
  const flipView = useAppStore((s) => s.flipView)

  const toAnswer = subView === "rubric"
  const Icon = toAnswer ? ArrowRight : ArrowLeft
  const label = toAnswer ? "Answer" : "Rubric"
  const SubIcon = toAnswer ? FileText : ClipboardCheck

  return (
    <button
      onClick={flipView}
      className={cn(
        "group fixed top-16 z-40 flex h-10 items-center gap-2 rounded-full border border-border bg-card/95 pl-3 pr-2.5 text-xs font-medium shadow-sm backdrop-blur transition hover:border-foreground/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        side === "right" ? "right-4 md:right-6" : "left-4 md:left-6"
      )}
      aria-label={`Switch to ${label} view`}
      title={`Switch to ${label} (⌘/Ctrl + ${toAnswer ? "→" : "←"})`}
    >
      {side === "left" && <Icon className="h-4 w-4" />}
      <span className="hidden items-center gap-1.5 sm:flex">
        <SubIcon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </span>
      <span className="sm:hidden">{label}</span>
      {side === "right" && <Icon className="h-4 w-4" />}
      <kbd className="ml-1 hidden rounded border border-border bg-muted/60 px-1 py-0.5 text-[9px] font-medium text-muted-foreground group-hover:bg-muted md:inline">
        ⌘{toAnswer ? "→" : "←"}
      </kbd>
    </button>
  )
}
