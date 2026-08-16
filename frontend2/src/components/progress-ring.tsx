"use client"

import { cn } from "@/lib/utils"

/**
 * A compact circular progress indicator.
 * - `value` is 0..1
 * - size / stroke configurable
 * - shows a check when fully complete
 */
export function ProgressRing({
  value,
  size = 36,
  stroke = 3,
  className,
  tone = "primary",
  showCheck = true,
}: {
  value: number // 0..1
  size?: number
  stroke?: number
  className?: string
  tone?: "primary" | "emerald" | "amber"
  showCheck?: boolean
}) {
  const v = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - v)
  const complete = v >= 1

  const colorClass =
    tone === "emerald"
      ? "text-emerald-500"
      : tone === "amber"
      ? "text-amber-500"
      : "text-primary"

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(v * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="text-muted/60"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={cn(
            complete && tone !== "amber" ? "text-emerald-500" : colorClass
          )}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <span
        className={cn(
          "absolute text-[9px] font-semibold tabular-nums",
          complete && showCheck ? "text-emerald-600" : "text-muted-foreground"
        )}
      >
        {complete && showCheck ? "✓" : `${Math.round(v * 100)}`}
      </span>
    </div>
  )
}
