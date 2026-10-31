import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Crop marks — the corner registration ticks used across the product.
 * Drawn as four absolutely-positioned L-ticks inside a `relative` frame.
 */
export function CropMarksOverlay({
  className,
  color = "#C4A574",
  size = 10,
  inset = -1,
}: {
  className?: string;
  color?: string;
  size?: number;
  inset?: number;
}) {
  const s = `${size}px`;
  const i = `${inset}px`;
  const common = "pointer-events-none absolute overflow-visible";
  return (
    <span aria-hidden className={cn(common, className)} style={{ inset: i }}>
      <svg className="absolute left-0 top-0" width={s} height={s} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 ${size} V0 H${size}`} stroke={color} strokeWidth={1} fill="none" />
      </svg>
      <svg className="absolute right-0 top-0" width={s} height={s} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M${size} 0 V${size} H0`} stroke={color} strokeWidth={1} fill="none" />
      </svg>
      <svg className="absolute bottom-0 left-0" width={s} height={s} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M0 0 V${size} H${size}`} stroke={color} strokeWidth={1} fill="none" />
      </svg>
      <svg className="absolute bottom-0 right-0" width={s} height={s} viewBox={`0 0 ${size} ${size}`}>
        <path d={`M${size} ${size} V0 H0`} stroke={color} strokeWidth={1} fill="none" />
      </svg>
    </span>
  );
}

/**
 * Panel — the base surface. Borders carry all the structure; shadows do not.
 */
export function Card({
  className,
  marks = false,
  markColor,
  tone = "raised",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  marks?: boolean;
  markColor?: string;
  tone?: "raised" | "sunk" | "paper" | "grid";
}) {
  const tones = {
    raised: "bg-paper-raised border-line",
    sunk: "bg-paper-sunk border-line",
    paper: "bg-paper border-line",
    grid: "bg-paper border-line grid-fine",
  };
  return (
    <div className={cn("relative border", tones[tone], className)} {...rest}>
      {marks && <CropMarksOverlay inset={-1} color={markColor} />}
      <div className="relative">{children}</div>
    </div>
  );
}

/** Simpler primitive: a bordered frame with optional crop marks drawn on it. */
export function Frame({
  className,
  marks = true,
  markColor = "#C4A574",
  markInset = -1,
  tone = "raised",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  marks?: boolean;
  markColor?: string;
  markInset?: number;
  tone?: "raised" | "sunk" | "paper" | "grid" | "none";
}) {
  const tones = {
    raised: "bg-paper-raised",
    sunk: "bg-paper-sunk",
    paper: "bg-paper",
    grid: "bg-paper grid-fine",
    none: "",
  };
  return (
    <div className={cn("relative", tones[tone], className)} {...rest}>
      {marks && <CropMarksOverlay inset={markInset} color={markColor} />}
      {children}
    </div>
  );
}

/**
 * DesktopOnlyNotice — the mobile policy of the product: the phone build is for
 * walking the task queue and checking statuses, not for editing. Renders a
 * hatched notice on small screens and nothing at all from `lg` up.
 */
export function DesktopOnlyNotice({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "hatch-brick border border-line bg-paper-raised p-5 lg:hidden",
        className,
      )}
    >
      <div className="border border-line bg-paper-raised p-4">
        <span className="eyebrow text-brass-deep">Мобильный режим</span>
        <p className="mt-2 text-small leading-relaxed text-ink-muted">{children}</p>
      </div>
    </div>
  );
}

/** Section heading: mono index + display type. Used across every view. */export function SectionTitle({
  index,
  title,
  note,
  className,
  action,
}: {
  index?: string;
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6 border-b border-line pb-3", className)}>
      <div className="min-w-0">
        {(index || note) && (
          <div className="mb-1 flex items-center gap-3">
            {index && <span className="eyebrow text-brass-deep">{index}</span>}
            {note && <span className="eyebrow">{note}</span>}
          </div>
        )}
        <h2 className="font-display text-h4 text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}