"use client"

import { useAppStore } from "@/lib/store"
import { HomeView } from "@/components/home/home-view"
import { ExamView } from "@/components/exam/exam-view"
import { useEffect } from "react"
import { useExams } from "@/hooks/use-exams"

export default function Page() {
  const view = useAppStore((s) => s.view)
  const openTabs = useAppStore((s) => s.openTabs)
  const { exams, refresh } = useExams()

  // keep exams fresh when returning home
  useEffect(() => {
    if (view === "home") refresh()
  }, [view, refresh])

  // listen for global refresh requests (after create/delete)
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener("gradebook:refresh-exams", handler)
    return () => window.removeEventListener("gradebook:refresh-exams", handler)
  }, [refresh])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {view === "home" ? (
        <HomeView exams={exams} />
      ) : (
        <ExamView openTabIds={openTabs} />
      )}
    </div>
  )
}
