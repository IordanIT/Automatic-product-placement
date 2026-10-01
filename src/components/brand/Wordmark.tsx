import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Wordmark: a drafting-derived monogram. Three shelf rails inside a frame —
 * the same geometry the CV overlay draws.
 */
export function Monogram({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect x="0.5" y="0.5" width="23" height="23" stroke="#1C1C1A" strokeWidth="1" />
      <path d="M4 7h16M4 12h16M4 17h16" stroke="#1C1C1A" strokeWidth="1" />
      <rect x="5" y="7.6" width="4" height="4" fill="#2C3E50" />
      <rect x="10" y="7.6" width="3" height="4" fill="#C4A574" />
      <rect x="5" y="12.6" width="3" height="4" fill="#2A6F5C" />
      <rect x="9" y="12.6" width="4" height="4" fill="#B34747" />
      <rect x="14" y="12.6" width="4" height="4" fill="#1C1C1A" />
    </svg>
  );
}

export function Wordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Monogram size={compact ? 20 : 24} />
      <span className="leading-none">
        <span className="block font-display text-h4 leading-none tracking-[-0.02em]">
          Полка
        </span>
        {!compact && (
          <span className="eyebrow mt-1 block !text-[0.5625rem] !tracking-[0.2em]">
            Shelf&nbsp;CV
          </span>
        )}
      </span>
    </span>
  );
}