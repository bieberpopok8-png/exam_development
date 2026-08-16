"use client"

import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LanguageToggle({ className }: { className?: string }) {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const next = language === "en" ? "id" : "en"

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 gap-1 rounded-lg px-2 text-xs font-semibold", className)}
      onClick={() => setLanguage(next)}
      aria-label={`Switch to ${next === "id" ? "Indonesian" : "English"}`}
      title={language === "en" ? "Beralih ke Bahasa Indonesia" : "Switch to English"}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="uppercase">{language}</span>
    </Button>
  )
}
