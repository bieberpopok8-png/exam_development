"use client"

import { useAppStore } from "@/lib/store"

export function Footer() {
  const view = useAppStore((s) => s.view)
  return (
    <footer className="mt-auto border-t border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-xs text-muted-foreground">
        <span>
          Gradebook — simple exam grading
        </span>
        <span className="hidden sm:inline">
          {view === "exam" ? "Exam workspace" : "All exams"}
        </span>
      </div>
    </footer>
  )
}
