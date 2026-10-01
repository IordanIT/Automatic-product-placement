import * as React from "react";
import { cn } from "@/lib/cn";
import type { FacetStatus, TaskStatus, TaskType } from "@/lib/types";

export type Tone = "neutral" | "slate" | "forest" | "brick" | "brass";

const TONES: Record<Tone, string> = {
  neutral: "bg-paper-sunk text-ink-muted border-line",
  slate: "bg-slate-soft text-slate border-slate-line",
  forest: "bg-forest-soft text-forest border-forest-line",
  brick: "bg-brick-soft text-brick-deep border-brick-line",
  brass: "bg-brass-soft text-brass-deep border-brass-line",
};

export function Tag({
  tone = "neutral",
  children,
  className,
  dot = false,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-mono text-micro uppercase tracking-[0.09em]",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-[5px] w-[5px] border border-current" />}
      {children}
    </span>
  );
}

export const FACET_TONE: Record<FacetStatus, Tone> = {
  ok: "forest",
  oos: "brick",
  misplaced: "brick",
  facing: "brass",
  phantom: "brass",
};

export const FACET_HEX: Record<FacetStatus, string> = {
  ok: "#2A6F5C",
  oos: "#B34747",
  misplaced: "#B34747",
  facing: "#7E6640",
  phantom: "#7E6640",
};

export const TASK_TYPE_TONE: Record<TaskType, Tone> = {
  oos: "brick",
  misplaced: "brick",
  facing: "brass",
  phantom: "slate",
};

export const TASK_STATUS_TONE: Record<TaskStatus, Tone> = {
  new: "neutral",
  assigned: "slate",
  in_progress: "brass",
  done: "forest",
};

/** Status dot: hollow ring when offline, filled when live. No glow, no pulse. */
export function StatusDot({
  tone,
  pulse = false,
}: {
  tone: "ok" | "warn" | "off";
  pulse?: boolean;
}) {
  const map = {
    ok: "bg-forest border-forest",
    warn: "bg-brass border-brass",
    off: "bg-transparent border-ink-faint",
  };
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0">
      {pulse && tone === "ok" && (
        <span className="absolute inset-0 animate-[fade-up_2s_ease-precise_infinite] border border-forest" />
      )}
      <span className={cn("h-2 w-2 border", map[tone])} />
    </span>
  );
}