export type ExamColor =
  | "slate"
  | "emerald"
  | "amber"
  | "rose"
  | "violet"
  | "cyan"
  | "orange"

export type ExtractStatus = "empty" | "uploading" | "processing" | "ready" | "failed"

export interface RubricItem {
  criterion: string
  points: number | null
}

export interface AnswerItem {
  question: string
  answer: string
  grade: string // professor-entered grade per answer item (free text, e.g. "8/10")
}

export interface RubricExtract {
  items: RubricItem[]
}

export interface AnswerExtract {
  items: AnswerItem[]
}

export interface Question {
  id: string
  examId: string
  number: number
  rubricFileName: string | null
  rubricFileType: string | null
  rubricFileData: string | null
  rubricNotes: string
  rubricParsed: string
  rubricExtract: string // JSON: RubricExtract
  rubricStatus: ExtractStatus
  maxScore: number | null
  createdAt: string
  updatedAt: string
}

export interface Student {
  id: string
  examId: string
  anonymizedId: string
  order: number
}

// Per-student, per-question answer record — the unit of blind grading.
export interface Answer {
  id: string
  questionId: string
  studentId: string
  fileName: string | null
  fileType: string | null
  fileData: string | null
  notes: string
  parsed: string
  extract: string // JSON: AnswerExtract
  extractStatus: ExtractStatus
  score: number | null
  feedback: string
  graded: boolean
  aiGraded: boolean
  createdAt: string
  updatedAt: string
}

export interface ExamProgress {
  gradedCells: number
  totalCells: number
  answeredCells: number
  maxScore: number
  avgScore: number | null
  fraction: number // 0..1
}

export interface Exam {
  id: string
  name: string
  description: string
  dueDate: string | null
  color: ExamColor
  createdAt: string
  updatedAt: string
  questions?: Question[]
  students?: Student[]
  _count?: { questions: number; students: number }
  progress?: ExamProgress
}

export interface ExamWithRelations extends Exam {
  questions: Question[]
  students: Student[]
  answers: Answer[]
}

export const EXAM_COLORS: ExamColor[] = [
  "slate",
  "emerald",
  "amber",
  "rose",
  "violet",
  "cyan",
  "orange",
]

// accent stripe color (used on rows, tabs, calendar chips)
export function colorClasses(c: ExamColor) {
  switch (c) {
    case "slate":
      return { dot: "bg-slate-400", stripe: "bg-slate-400", text: "text-slate-600" }
    case "emerald":
      return { dot: "bg-emerald-500", stripe: "bg-emerald-500", text: "text-emerald-600" }
    case "amber":
      return { dot: "bg-amber-500", stripe: "bg-amber-500", text: "text-amber-600" }
    case "rose":
      return { dot: "bg-rose-500", stripe: "bg-rose-500", text: "text-rose-600" }
    case "violet":
      return { dot: "bg-violet-500", stripe: "bg-violet-500", text: "text-violet-600" }
    case "cyan":
      return { dot: "bg-cyan-500", stripe: "bg-cyan-500", text: "text-cyan-600" }
    case "orange":
      return { dot: "bg-orange-500", stripe: "bg-orange-500", text: "text-orange-600" }
  }
}

export function colorChip(c: ExamColor) {
  switch (c) {
    case "slate":
      return "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
    case "emerald":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
    case "amber":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
    case "rose":
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
    case "violet":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
    case "cyan":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
    case "orange":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
  }
}
