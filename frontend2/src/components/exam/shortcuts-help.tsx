"use client"

import { useEffect, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

const SHORTCUTS = [
  {
    group: "Navigation",
    items: [
      { keys: ["⌘", "→"], label: "Rubric → Answer (on Rubric)" },
      { keys: ["⌘", "←"], label: "Answer → Rubric (on Answer)" },
      { keys: ["J"], label: "Next student (Answer view)" },
      { keys: ["K"], label: "Previous student (Answer view)" },
      { keys: ["N"], label: "Next ungraded student (Answer view)" },
      { keys: ["1", "–", "9"], label: "Jump to student N (Answer view)" },
      { keys: ["?"], label: "Toggle this shortcuts panel" },
    ],
  },
  {
    group: "Tabs & rows",
    items: [
      { keys: ["Drag"], label: "Reorder tabs · reorder question rows" },
      { keys: ["×"], label: "Close a tab (hover a tab)" },
    ],
  },
]

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-foreground shadow-[0_1px_0_rgb(0_0_0/0.06)]">
      {children}
    </kbd>
  )
}

export function ShortcutsHelp({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t) {
        const tag = t.tagName
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        )
          return
      }
      if (e.key === "?") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-lg", className)}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-72 p-0">
        <div className="border-b border-border/70 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">Keyboard shortcuts</span>
          </div>
        </div>
        <div className="p-2">
          {SHORTCUTS.map((group) => (
            <div key={group.group} className="mb-2 last:mb-0">
              <p className="px-1 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5 hover:bg-muted/50"
                  >
                    <span className="text-xs text-foreground">{item.label}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {item.keys.map((k, i) => (
                        <Kbd key={i}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
