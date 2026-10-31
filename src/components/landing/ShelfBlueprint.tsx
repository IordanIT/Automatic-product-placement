import * as React from "react";

/**
 * Hero drawing — an elevation of one shelf run, drawn the way a retailer
 * would print it for a planogram review: crop marks, dimension chains,
 * bay coordinates, facing rectangles. No perspective, no photography.
 */
export function ShelfBlueprint({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) {
  const W = 560;
  const H = 420;
  const X = 56;
  const Y = 44;
  const FW = W - 112;
  const FH = H - 108;
  const levels = 4;
  const bays = 6;
  const levelH = FH / levels;
  const bayW = FW / bays;

  // deterministic facing fill per bay/level
  const cells: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    state: "ok" | "oos" | "mis" | "fac";
    sku: string;
  }> = [];
  let n = 0;
  for (let l = 0; l < levels; l++) {
    for (let b = 0; b < bays; b++) {
      const slots = 2 + ((l * bays + b) % 2);
      const slotW = (bayW - 12) / slots;
      const roll = (l * 7 + b * 3) % 11;
      for (let s = 0; s < slots; s++) {
        const state =
          roll === 3 && s === slots - 1
            ? "oos"
            : roll === 7 && s === 0
              ? "mis"
              : roll === 5 && s === 0
                ? "fac"
                : "ok";
        const fill = state === "oos" ? 0.42 : 0.88;
        cells.push({
          x: X + b * bayW + 6 + slotW * s + (slotW * (1 - fill)) / 2,
          y: Y + l * levelH + levelH * 0.16,
          w: slotW * fill,
          h: levelH * 0.66,
          state,
          sku: `44${(500 + l * 41 + b * 13 + s * 3).toString().padStart(3, "0")}`,
        });
        n++;
      }
    }
  }

  const stroke = "#1C1C1A";
  const dim = "#C4A574";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Чертёж стеллажа с разметкой фейсингов"
    >
      <defs>
        <pattern id="bp-hatch" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#B34747" strokeWidth="1" opacity="0.55" />
        </pattern>
        <pattern id="bp-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#D6D4CF" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill="url(#bp-grid)" />

      {/* crop marks */}
      {[
        [10, 10, 1, 1],
        [W - 10, 10, -1, 1],
        [10, H - 10, 1, -1],
        [W - 10, H - 10, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <g key={i} stroke={dim} strokeWidth="1">
          <path d={`M${cx} ${cy + 22 * sy} L${cx} ${cy} L${cx + 22 * sx} ${cy}`} />
        </g>
      ))}

      {/* frame */}
      <rect x={X} y={Y} width={FW} height={FH} fill="none" stroke={stroke} strokeWidth="1.5" />

      {/* shelf rails */}
      {Array.from({ length: levels + 1 }).map((_, i) => (
        <g key={i}>
          <line
            x1={X}
            x2={X + FW}
            y1={Y + i * levelH}
            y2={Y + i * levelH}
            stroke={stroke}
            strokeWidth={i === levels ? 1.5 : 0.75}
            opacity={i === levels ? 1 : 0.45}
          />
          <line
            x1={X + FW / 2}
            x2={X + FW}
            y1={Y + i * levelH + 1.5}
            y2={Y + i * levelH + 1.5}
            stroke={dim}
            strokeWidth="0.5"
            opacity="0.6"
          />
        </g>
      ))}

      {/* bay dividers */}
      {Array.from({ length: bays + 1 }).map((_, i) => (
        <line
          key={i}
          x1={X + i * bayW}
          x2={X + i * bayW}
          y1={Y}
          y2={Y + FH}
          stroke={stroke}
          strokeWidth="0.5"
          opacity="0.28"
        />
      ))}

      {/* facings */}
      {cells.map((c, i) => (
        <g key={i}>
          <rect
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            fill={c.state === "oos" ? "url(#bp-hatch)" : c.state === "mis" ? "rgba(179,71,71,0.08)" : "rgba(42,111,92,0.07)"}
            stroke={
              c.state === "ok" ? "#2A6F5C" : c.state === "fac" ? "#C4A574" : "#B34747"
            }
            strokeWidth="0.8"
          />
          {/* facing front-edge tick */}
          <line
            x1={c.x}
            x2={c.x}
            y1={c.y + 3}
            y2={c.y + c.h - 3}
            stroke={c.state === "ok" ? "#2A6F5C" : "#B34747"}
            strokeWidth="1.6"
          />
        </g>
      ))}

      {/* bay labels */}
      {Array.from({ length: bays }).map((_, b) => (
        <text
          key={b}
          x={X + b * bayW + 5}
          y={Y - 7}
          className="fill-[#5E5E59] font-mono"
          style={{ fontSize: 8.5, letterSpacing: "0.08em" }}
        >
          {String.fromCharCode(65 + b)}
        </text>
      ))}
      {Array.from({ length: levels }).map((_, l) => (
        <text
          key={l}
          x={X - 22}
          y={Y + l * levelH + levelH / 2 + 3}
          className="fill-[#5E5E59] font-mono"
          style={{ fontSize: 8.5 }}
        >
          L{levels - l}
        </text>
      ))}

      {/* dimension chain — top */}
      <g stroke={dim} strokeWidth="0.8">
        <line x1={X} x2={X + FW} y1={Y - 24} y2={Y - 24} />
        <line x1={X} x2={X} y1={Y - 28} y2={Y - 20} />
        <line x1={X + FW} x2={X + FW} y1={Y - 28} y2={Y - 20} />
      </g>
      <text
        x={X + FW / 2}
        y={Y - 29}
        textAnchor="middle"
        className="fill-[#7E6640] font-mono"
        style={{ fontSize: 8.5, letterSpacing: "0.1em" }}
      >
        2400 мм
      </text>

      {/* dimension chain — right */}
      <g stroke={dim} strokeWidth="0.8">
        <line x1={X + FW + 18} x2={X + FW + 18} y1={Y} y2={Y + FH} />
        <line x1={X + FW + 14} x2={X + FW + 22} y1={Y} y2={Y} />
        <line x1={X + FW + 14} x2={X + FW + 22} y1={Y + FH} y2={Y + FH} />
      </g>
      <text
        x={X + FW + 24}
        y={Y + FH / 2}
        className="fill-[#7E6640] font-mono"
        style={{ fontSize: 8.5 }}
        transform={`rotate(90 ${X + FW + 24} ${Y + FH / 2})`}
        textAnchor="middle"
      >
        1100 мм
      </text>

      {/* callout on an OOS cell */}
      {(() => {
        const c = cells.find((x) => x.state === "oos");
        if (!c) return null;
        const cx = c.x + c.w;
        const cy = c.y;
        return (
          <g>
            <path
              d={`M${cx + 2} ${cy} L${cx + 26} ${cy - 18} L${cx + 96} ${cy - 18}`}
              fill="none"
              stroke={stroke}
              strokeWidth="0.9"
            />
            <circle cx={cx + 2} cy={cy} r="2.5" fill="#B34747" />
            <text
              x={cx + 99}
              y={cy - 15}
              className="fill-[#B34747] font-mono"
              style={{ fontSize: 8.5, letterSpacing: "0.08em" }}
            >
              OOS −3
            </text>
            <text
              x={cx + 99}
              y={cy - 4}
              className="fill-[#5E5E59] font-mono"
              style={{ fontSize: 7.5 }}
            >
              SKU {c.sku}
            </text>
          </g>
        );
      })()}

      {/* annotation block */}
      <g>
        <line x1={X + 8} x2={X + 8} y1={Y + FH - 74} y2={Y + FH - 8} stroke="#B34747" strokeWidth="2" />
        <text
          x={X + 15}
          y={Y + FH - 60}
          className="fill-[#1C1C1A] font-mono"
          style={{ fontSize: 9, letterSpacing: "0.12em" }}
        >
          СОВПАДЕНИЕ 87%
        </text>
        <text
          x={X + 15}
          y={Y + FH - 47}
          className="fill-[#5E5E59] font-mono"
          style={{ fontSize: 8 }}
        >
          71 / 82 фейсинга
        </text>
        <text
          x={X + 15}
          y={Y + FH - 34}
          className="fill-[#5E5E59] font-mono"
          style={{ fontSize: 8 }}
        >
          cam-a12-04 · 09:42:11
        </text>
        <text
          x={X + 15}
          y={Y + FH - 20}
          className="fill-[#5E5E59] font-mono"
          style={{ fontSize: 8 }}
        >
          rev 4 · PL-2024-118
        </text>
      </g>

      {/* frame id, bottom right */}
      <text
        x={X + FW}
        y={Y + FH + 20}
        textAnchor="end"
        className="fill-[#6B6B66] font-mono"
        style={{ fontSize: 8, letterSpacing: "0.16em" }}
      >
        {`SH-1142 · ${n} ДЕТЕКЦИЙ`}
      </text>

      {/* draw animation */}
      {animate && (
        <style>{`
          .bp-trace {
            stroke-dasharray: 1600;
            stroke-dashoffset: 1600;
            animation: bp-draw 1800ms cubic-bezier(0.4,0,0.2,1) forwards;
          }
          @keyframes bp-draw { to { stroke-dashoffset: 0; } }
          .bp-fade { opacity: 0; animation: bp-in 500ms cubic-bezier(0.4,0,0.2,1) forwards; }
          @keyframes bp-in { to { opacity: 1; } }
        `}</style>
      )}
      {animate && (
        <>
          <rect
            className="bp-trace"
            x={X}
            y={Y}
            width={FW}
            height={FH}
            fill="none"
            stroke="#2C3E50"
            strokeWidth="1"
            style={{ animationDelay: "60ms" }}
          />
          <rect
            className="bp-fade"
            x={X}
            y={Y}
            width={FW}
            height={FH}
            fill="none"
            stroke="#B34747"
            strokeWidth="1"
            strokeDasharray="3 3"
            style={{ animationDelay: "1100ms" }}
          />
        </>
      )}
    </svg>
  );
}