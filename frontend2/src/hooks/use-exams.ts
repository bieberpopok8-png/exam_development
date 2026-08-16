"use client"

import { useEffect, useState, useCallback } from "react"
import type { Exam, ExamWithRelations } from "@/lib/types"

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`${res.status} ${t}`)
  }
  return res.json() as Promise<T>
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await jfetch<Exam[]>("/api/exams")
      setExams(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { exams, loading, error, refresh, setExams }
}

export function useExam(examId: string | null) {
  const [exam, setExam] = useState<ExamWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!examId) {
      setExam(null)
      return
    }
    setLoading(true)
    try {
      const data = await jfetch<ExamWithRelations>(`/api/exams/${examId}`)
      setExam(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
      setExam(null)
    } finally {
      setLoading(false)
    }
  }, [examId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { exam, loading, error, refresh, setExam }
}

export { jfetch }
