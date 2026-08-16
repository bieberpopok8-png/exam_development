import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Language } from "@/lib/i18n"

export type AppView = "home" | "exam"
export type ExamSubView = "rubric" | "answer"

interface AppState {
  view: AppView
  openTabs: string[] // exam ids, ordered
  activeTabId: string | null
  subViews: Record<string, ExamSubView> // per-exam subView, keyed by examId
  language: Language

  openExam: (examId: string) => void
  closeTab: (examId: string) => void
  setActiveTab: (examId: string) => void
  reorderTabs: (next: string[]) => void
  goHome: () => void
  setSubView: (v: ExamSubView) => void
  flipView: () => void
  setLanguage: (lang: Language) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "home",
      openTabs: [],
      activeTabId: null,
      subViews: {},
      language: "en",

      openExam: (examId) => {
        const { openTabs, subViews } = get()
        const next = openTabs.includes(examId)
          ? openTabs
          : [...openTabs, examId]
        // default to rubric for new tabs; keep existing for already-open tabs
        set({
          view: "exam",
          activeTabId: examId,
          openTabs: next,
          subViews: { ...subViews, [examId]: subViews[examId] ?? "rubric" },
        })
      },

      closeTab: (examId) => {
        const { openTabs, activeTabId, view, subViews } = get()
        const next = openTabs.filter((id) => id !== examId)
        // clean up the subView entry for the closed tab
        const nextSubViews = { ...subViews }
        delete nextSubViews[examId]
        let nextActive = activeTabId
        if (activeTabId === examId) {
          nextActive = next.length ? next[Math.max(0, next.indexOf(examId) - 1)] ?? next[0] : null
          if (!nextActive) {
            set({ openTabs: next, activeTabId: null, view: "home", subViews: nextSubViews })
            return
          }
        }
        set({ openTabs: next, activeTabId: nextActive, view: nextActive ? view : "home", subViews: nextSubViews })
      },

      setActiveTab: (examId) => set({ activeTabId: examId, view: "exam" }),

      reorderTabs: (next) => set({ openTabs: next }),

      goHome: () => set({ view: "home" }),

      setSubView: (v) => {
        const { activeTabId, subViews } = get()
        if (!activeTabId) return
        set({ subViews: { ...subViews, [activeTabId]: v } })
      },

      flipView: () => {
        const { activeTabId, subViews } = get()
        if (!activeTabId) return
        const current = subViews[activeTabId] ?? "rubric"
        set({ subViews: { ...subViews, [activeTabId]: current === "rubric" ? "answer" : "rubric" } })
      },

      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: "gradebook-app-store" }
  )
)
