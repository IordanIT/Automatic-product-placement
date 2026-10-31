"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * Charts are hand-drawn SVG — no chart library. Every figure is annotated with
 * mono tick labels, hatch fills and 1px rules so the analytics read as part of
 * the same drafting system as the rest of the product.
 */

export interface Series {
  label: string;
  values: number[];
}

/* ------------------------------------------------------------------ *
 * Area chart — OOS dynamics by category                               *
 * ------------------------------------------------------------------ */
export function AreaChart({
  series,
  height = 260,
  unit = "",
  highlightIndex,
}: {
  series: Series[];
  height?: number;
  unit?: string;
  highlightIndex?: number | null;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const w = 720;
  const h = height;
  const pad = { t: 18, r: 18, b: 34, l: 44 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.12;
  const n = series[0]?.values.length ?? 0;
  const x = (i: number) => pad.l + (iw / Math.max(1, n - 1)) * i;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const path = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  const ticks = 4;
  const active = hover ?? highlightIndex ?? null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Динамика OOS по категориям"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <pattern id="hatch-a" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#B34747" strokeWidth="1" opacity="0.5" />
          </pattern>
          <pattern id="hatch-b" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#6B6B66" strokeWidth="1" opacity="0.45" />
          </pattern>
        </defs>

        {/* grid */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (max / ticks) * i;
          return (
            <g key={i}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y(v)}
                y2={y(v)}
                stroke="#D6D4CF"
                strokeWidth="1"
              />
              <text
                x={pad.l - 8}
                y={y(v) + 3.5}
                textAnchor="end"
                className="fill-[#6B6B66] font-mono text-[10px]"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* previous period (dashed, hatched) */}
        {series[1] && (
          <>
            <path
              d={`${path(series[1].values)} L${x(n - 1)} ${pad.t + ih} L${pad.l} ${pad.t + ih} Z`}
              fill="url(#hatch-b)"
            />
            <path
              d={path(series[1].values)}
              fill="none"
              stroke="#6B6B66"
              strokeWidth="1.25"
              strokeDasharray="4 3"
            />
          </>
        )}

        {/* current period (hatched area + line) */}
        {series[0] && (
          <>
            <path
              d={`${path(series[0].values)} L${x(n - 1)} ${pad.t + ih} L${pad.l} ${pad.t + ih} Z`}
              fill="url(#hatch-a)"
            />
            <path
              d={path(series[0].values)}
              fill="none"
              stroke="#B34747"
              strokeWidth="1.75"
              strokeLinejoin="round"
              pathLength={1}
              style={{
                strokeDasharray: 1,
                animation: "draw-x 900ms cubic-bezier(0.4,0,0.2,1) both",
              }}
            />
          </>
        )}

        {/* baseline / target */}
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={y(max * 0.72)}
          y2={y(max * 0.72)}
          stroke="#2A6F5C"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <text
          x={w - pad.r}
          y={y(max * 0.72) - 5}
          textAnchor="end"
          className="fill-[#2A6F5C] font-mono text-[9px]"
        >
          целевой уровень
        </text>

        {/* hover crosshair */}
        {active !== null && (
          <g>
            <line
              x1={x(active)}
              x2={x(active)}
              y1={pad.t}
              y2={pad.t + ih}
              stroke="#2C3E50"
              strokeWidth="1"
            />
            <circle cx={x(active)} cy={y(series[0]!.values[active]!)} r="3.5" fill="#B34747" />
            <circle cx={x(active)} cy={y(series[1]!.values[active]!)} r="3.5" fill="#6B6B66" />
          </g>
        )}

        {/* x labels */}
        {series[0]?.values.map((_, i) => (
          <text
            key={i}
            x={x(i)}
            y={h - 12}
            textAnchor="middle"
            className={cn(
              "font-mono text-[10px]",
              active === i ? "fill-[#1C1C1A]" : "fill-[#6B6B66]",
            )}
          >
            {series[0]!.label.length > 9
              ? `${series[0]!.label.slice(0, 8)}…`
              : series[0]!.label}
          </text>
        ))}

        {/* hit areas */}
        {series[0]?.values.map((_, i) => (
          <rect
            key={i}
            x={x(i) - iw / n / 2}
            y={pad.t}
            width={iw / n}
            height={ih}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      {active !== null && (
        <div className="pointer-events-none absolute right-3 top-3 border border-line bg-paper-raised px-2 py-1.5">
          <div className="font-mono text-micro text-ink">{series[0]!.values[active]}{unit}</div>
          <div className="tabular font-mono text-micro text-ink-faint">
            было {series[1]!.values[active]}
            {unit} · {series[0]!.label}
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 font-mono text-micro text-ink-muted">
          <span className="h-[2px] w-4 bg-brick" /> текущий период
        </span>
        <span className="flex items-center gap-1.5 font-mono text-micro text-ink-muted">
          <span className="h-[2px] w-4 bg-ink-faint" /> предыдущий период
        </span>
        <span className="flex items-center gap-1.5 font-mono text-micro text-ink-muted">
          <span className="hatch-brick h-2.5 w-4 border border-brick-line" /> зона OOS
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Line chart — OSA trend                                             *
 * ------------------------------------------------------------------ */
export function TrendChart({
  points,
  target,
  height = 200,
}: {
  points: Array<{ day: string; osa: number }>;
  target: number;
  height?: number;
}) {
  const w = 720;
  const h = height;
  const pad = { t: 16, r: 16, b: 28, l: 40 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const min = Math.min(...points.map((p) => p.osa), target) - 2;
  const max = Math.max(...points.map((p) => p.osa)) + 2;
  const x = (i: number) => pad.l + (iw / (points.length - 1)) * i;
  const y = (v: number) => pad.t + ih - ((v - min) / (max - min)) * ih;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.osa).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img" aria-label="Динамика OSA">
      {Array.from({ length: 4 }).map((_, i) => {
        const v = min + ((max - min) / 3) * i;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#D6D4CF" />
            <text x={pad.l - 8} y={y(v) + 3.5} textAnchor="end" className="fill-[#6B6B66] font-mono text-[10px]">
              {v.toFixed(0)}
            </text>
          </g>
        );
      })}
      <line x1={pad.l} x2={w - pad.r} y1={y(target)} y2={y(target)} stroke="#2A6F5C" strokeDasharray="3 3" />
      <text x={w - pad.r} y={y(target) - 5} textAnchor="end" className="fill-[#2A6F5C] font-mono text-[9px]">
        план {target}%
      </text>
      <path d={d} fill="none" stroke="#2C3E50" strokeWidth="1.75" pathLength={1}
        style={{ strokeDasharray: 1, animation: "draw-x 1100ms cubic-bezier(0.4,0,0.2,1) both" }} />
      {points.map((p, i) => (
        <circle key={p.day} cx={x(i)} cy={y(p.osa)} r="2.4" fill="#2C3E50" />
      ))}
      {points.map((p, i) =>
        i % 2 === 0 ? (
          <text key={p.day} x={x(i)} y={h - 8} textAnchor="middle" className="fill-[#6B6B66] font-mono text-[9px]">
            {p.day}
          </text>
        ) : null,
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Heatmap — schematic top-down store layout                          *
 * ------------------------------------------------------------------ */
export function StoreHeatmap({ data }: { data: { w: number; h: number; zones: Array<{ id: string; label: string; x: number; y: number; w: number; h: number; osa: number }> } }) {
  const [hover, setHover] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<"osa" | "id">("osa");

  const zones = [...data.zones].sort((a, b) =>
    sortBy === "osa" ? a.osa - b.osa : a.id.localeCompare(b.id),
  );

  const colour = (v: number) => {
    if (v >= 97) return { fill: "#E4EEEA", stroke: "#2A6F5C", text: "#1E5244" };
    if (v >= 92) return { fill: "#F3ECE0", stroke: "#7E6640", text: "#7E6640" };
    if (v >= 85) return { fill: "#F4E7E7", stroke: "#B34747", text: "#8B3434" };
    return { fill: "#EBD4D4", stroke: "#8B3434", text: "#6E2626" };
  };

  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow">Схема зала · вид сверху</span>
        <button
          type="button"
          onClick={() => setSortBy((s) => (s === "osa" ? "id" : "osa"))}
          className="border border-line bg-paper-raised px-2 py-0.5 font-mono text-micro uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-brass hover:text-ink"
        >
          {sortBy === "osa" ? "по OSA ↑" : "по зоне"}
        </button>
      </div>
      <svg
        viewBox={`0 0 ${data.w} ${data.h}`}
        className="grid-fine w-full border border-line bg-paper"
        role="img"
        aria-label="Тепловая карта магазина"
      >
        {zones.map((z) => {
          const c = colour(z.osa);
          const active = hover === z.id;
          return (
            <g
              key={z.id}
              onMouseEnter={() => setHover(z.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill={c.fill}
                stroke={c.stroke}
                strokeWidth={active ? 2 : 1}
                style={{ transition: "stroke-width 200ms cubic-bezier(0.4,0,0.2,1)" }}
              />
              {z.osa < 80 && (
                <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#heat-hatch)" />
              )}
              <text
                x={z.x + 10}
                y={z.y + 22}
                className="font-mono text-[13px]"
                fill={c.text}
              >
                {z.id}
              </text>
              <text x={z.x + 10} y={z.y + 40} className="fill-[#1C1C1A] font-mono text-[11px]">
                {z.label}
              </text>
              <text x={z.x + 10} y={z.y + 62} className="font-mono text-[19px]" fill={c.text}>
                {z.osa.toFixed(1)}%
              </text>
              {active && (
                <rect
                  x={z.x - 3}
                  y={z.y - 3}
                  width={z.w + 6}
                  height={z.h + 6}
                  fill="none"
                  stroke="#1C1C1A"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
              )}
            </g>
          );
        })}
        <defs>
          <pattern id="heat-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#B34747" strokeWidth="1" opacity="0.32" />
          </pattern>
        </defs>
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        {[
          { c: "#EBD4D4", b: "#8B3434", l: "< 85% — критично" },
          { c: "#F4E7E7", b: "#B34747", l: "85–92%" },
          { c: "#F3ECE0", b: "#7E6640", l: "92–97%" },
          { c: "#E4EEEA", b: "#2A6F5C", l: "> 97% — эталон" },
        ].map((l) => (
          <span key={l.l} className="flex items-center gap-1.5 font-mono text-micro text-ink-muted">
            <span className="h-3 w-5 border" style={{ background: l.c, borderColor: l.b }} />
            {l.l}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Funnel — signal to closure                                         *
 * ------------------------------------------------------------------ */
export function FlowChart({
  stages,
}: {
  stages: Array<{ stage: string; count: number }>;
}) {
  const max = stages[0]?.count ?? 1;
  // Fixed grouping + non-breaking space: identical on server and client.
  const nf = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (
    <div className="space-y-0">
      {stages.map((s, i) => {
        const w = (s.count / max) * 100;
        const prev = i > 0 ? stages[i - 1]!.count : null;
        const drop = prev ? ((prev - s.count) / prev) * 100 : 0;
        return (
          <div key={s.stage} className="flex items-center gap-3 border-b border-line-faint py-2 last:border-b-0">
            <span className="eyebrow w-[92px] shrink-0">{s.stage}</span>
            <span className="relative h-6 flex-1 border border-line bg-paper-sunk">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 border-r transition-[width] duration-700 ease-precise",
                  i === stages.length - 1 ? "border-forest bg-hatch-forest" : "border-brick bg-hatch-brick",
                )}
                style={{ width: `${w}%` }}
              />
            </span>
            <span className="tabular w-16 shrink-0 text-right font-mono text-micro2 text-ink">
              {nf(s.count)}
            </span>
            <span className="tabular w-12 shrink-0 text-right font-mono text-micro text-ink-faint">
              {i > 0 ? `−${drop.toFixed(1)}%` : "100%"}
            </span>
          </div>
        );
      })}
    </div>
  );
}