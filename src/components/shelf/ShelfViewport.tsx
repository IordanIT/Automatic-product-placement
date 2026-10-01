"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { PLATE } from "@/lib/data";
import { getPlate } from "@/lib/shelfPlate";
import type { Detection } from "@/lib/types";
import { STATUS_SHORT } from "@/lib/data";

const MM_PER_PLATE_PX = 2400 / PLATE.w; // the run is 2400 mm wide in the planogram

export interface Layers {
  boxes: boolean;
  labels: boolean;
  confidence: boolean;
  grid: boolean;
  id: boolean;
}

interface T {
  scale: number;
  tx: number;
  ty: number;
}

export function ShelfViewport({
  mode,
  detections,
  selectedId,
  onSelect,
  layers,
  handleRef,
  className,
}: {
  mode: "photo" | "schema";
  detections: Detection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  layers: Layers;
  handleRef?: React.MutableRefObject<ShelfViewportHandle | null>;
  className?: string;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const zoomRef = React.useRef<HTMLSpanElement>(null);
  const coordRef = React.useRef<HTMLSpanElement>(null);
  const [tip, setTip] = React.useState<{ id: string; x: number; y: number } | null>(null);

  const t = React.useRef<T>({ scale: 1, tx: 0, ty: 0 });
  const size = React.useRef({ w: 0, h: 0, dpr: 1 });
  const hover = React.useRef<string | null>(null);
  const dirty = React.useRef(true);
  const raf = React.useRef(0);
  const plate = React.useRef<HTMLCanvasElement | null>(null);
  const pointers = React.useRef(new Map<number, { x: number; y: number }>());
  const pinch = React.useRef<{ dist: number; mid: { x: number; y: number }; s: number } | null>(null);
  const drag = React.useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  /* ---------------- helpers ---------------- */
  const toPlate = React.useCallback((clientX: number, clientY: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const { tx, ty, scale } = t.current;
    return { px: (clientX - r.left - tx) / scale, py: (clientY - r.top - ty) / scale };
  }, []);

  const hit = React.useCallback(
    (clientX: number, clientY: number): Detection | null => {
      const { px, py } = toPlate(clientX, clientY);
      for (let i = detections.length - 1; i >= 0; i--) {
        const d = detections[i]!;
        if (
          px >= d.x * PLATE.w &&
          px <= (d.x + d.w) * PLATE.w &&
          py >= d.y * PLATE.h &&
          py <= (d.y + d.h) * PLATE.h
        )
          return d;
      }
      return null;
    },
    [detections, toPlate],
  );

  const fit = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 24;
    const s = Math.min((r.width - pad * 2) / PLATE.w, (r.height - pad * 2) / PLATE.h);
    t.current = {
      scale: s,
      tx: (r.width - PLATE.w * s) / 2,
      ty: (r.height - PLATE.h * s) / 2,
    };
    dirty.current = true;
  }, []);

  const zoomTo = React.useCallback((next: number, cx?: number, cy?: number) => {
    const r = canvasRef.current!.getBoundingClientRect();
    const ox = cx ?? r.width / 2;
    const oy = cy ?? r.height / 2;
    const cur = t.current;
    const s = Math.min(8, Math.max(0.18, next));
    cur.tx = ox - ((ox - cur.tx) / cur.scale) * s;
    cur.ty = oy - ((oy - cur.ty) / cur.scale) * s;
    cur.scale = s;
    dirty.current = true;
  }, []);

  const zoomBy = React.useCallback(
    (factor: number) => zoomTo(t.current.scale * factor),
    [zoomTo],
  );

  const panBy = React.useCallback((dx: number, dy: number) => {
    t.current.tx += dx;
    t.current.ty += dy;
    dirty.current = true;
  }, []);

  /* ---------------- measurement ---------------- */
  const fitted = React.useRef(false);
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      size.current = { w: r.width, h: r.height, dpr: Math.min(window.devicePixelRatio || 1, 2) };
      const c = canvasRef.current;
      if (c) {
        c.width = Math.max(1, Math.round(r.width * size.current.dpr));
        c.height = Math.max(1, Math.round(r.height * size.current.dpr));
        c.style.width = `${r.width}px`;
        c.style.height = `${r.height}px`;
      }
      if (!fitted.current && r.width > 0 && r.height > 0) {
        fitted.current = true;
        fit();
      }
      dirty.current = true;
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- plate ---------------- */
  React.useEffect(() => {
    plate.current = getPlate(mode, mode === "schema" ? selectedId : null);
    dirty.current = true;
  }, [mode, selectedId]);

  /* ---------------- draw loop ---------------- */
  React.useEffect(() => {
    const draw = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const { w, h, dpr } = size.current;
      if (!w || !h) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // backdrop
      ctx.fillStyle = "#EFEDE8";
      ctx.fillRect(0, 0, w, h);

      const { scale, tx, ty } = t.current;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);
      ctx.imageSmoothingQuality = "high";

      if (plate.current) ctx.drawImage(plate.current, 0, 0, PLATE.w, PLATE.h);

      /* coordinate grid */
      if (layers.grid) {
        const step = 64;
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = "rgba(44,62,80,0.16)";
        ctx.beginPath();
        for (let x = 0; x <= PLATE.w; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, PLATE.h);
        }
        for (let y = 0; y <= PLATE.h; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(PLATE.w, y);
        }
        ctx.stroke();

        ctx.fillStyle = "rgba(44,62,80,0.55)";
        ctx.font = `${11 / scale}px ui-monospace, monospace`;
        ctx.textBaseline = "top";
        for (let x = 0; x <= PLATE.w; x += step * 4) {
          ctx.fillText(`${Math.round(x * MM_PER_PLATE_PX)}`, x + 3 / scale, 3 / scale);
        }
        for (let y = step * 4; y <= PLATE.h; y += step * 4) {
          ctx.fillText(`${Math.round(y * MM_PER_PLATE_PX)}`, 3 / scale, y + 3 / scale);
        }
      }

      /* boxes */
      if (layers.boxes) {
        const px = 1 / scale; // 1 screen px expressed in plate units
        for (const d of detections) {
          const x = d.x * PLATE.w;
          const y = d.y * PLATE.h;
          const bw = d.w * PLATE.w;
          const bh = d.h * PLATE.h;
          const isHover = hover.current === d.id;
          const isSel = selectedId === d.id;
          const col =
            d.status === "ok"
              ? "#2A6F5C"
              : d.status === "facing" || d.status === "phantom"
                ? "#7E6640"
                : "#B34747";

          ctx.lineWidth = (isSel ? 2.5 : isHover ? 2 : 1.25) * px;
          ctx.strokeStyle = isSel ? "#1C1C1A" : col;
          ctx.strokeRect(x, y, bw, bh);

          // status wash
          ctx.fillStyle =
            d.status === "ok"
              ? `rgba(42,111,92,${isHover || isSel ? 0.16 : 0.07})`
              : `rgba(179,71,71,${isHover || isSel ? 0.2 : 0.09})`;
          ctx.fillRect(x, y, bw, bh);

          // OOS slots are hatched in place
          if (d.status === "oos") {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, bw, bh);
            ctx.clip();
            ctx.strokeStyle = "rgba(179,71,71,0.75)";
            ctx.lineWidth = px;
            ctx.beginPath();
            for (let i = -bh; i < bw; i += 7) {
              ctx.moveTo(x + i, y + bh);
              ctx.lineTo(x + i + bh, y);
            }
            ctx.stroke();
            ctx.restore();
          }

          // corner ticks — the plate registration motif, on every detection
          const t = 7;
          ctx.strokeStyle = isSel ? "#1C1C1A" : col;
          ctx.lineWidth = (isSel ? 3 : 2) * px;
          ctx.beginPath();
          ctx.moveTo(x, y + t); ctx.lineTo(x, y); ctx.lineTo(x + t, y);
          ctx.moveTo(x + bw - t, y + bh); ctx.lineTo(x + bw, y + bh); ctx.lineTo(x + bw, y + bh - t);
          ctx.stroke();

          /* labels */
          const screenW = bw * scale;
          if (layers.labels && screenW > 42) {
            const fs = Math.max(9, 11 / Math.max(scale, 0.001)) * scale;
            ctx.font = `${fs}px ui-monospace, monospace`;
            ctx.textBaseline = "bottom";

            const short = STATUS_SHORT[d.status];
            const line1 = `${d.sku}`;
            const line2 = `${short} · ${d.actual}/${d.expected}`;
            const w1 = ctx.measureText(line1).width;
            const w2 = ctx.measureText(line2).width;
            const bw2 = Math.max(w1, w2) + 10 / scale;
            const bh2 = (fs * 2 + 8) / scale;
            const bx = x;
            const by = y - bh2 - 3 / scale;

            ctx.fillStyle = "rgba(247,246,243,0.94)";
            ctx.fillRect(bx, by, bw2, bh2);
            ctx.strokeStyle = col;
            ctx.lineWidth = px;
            ctx.strokeRect(bx + 0.5 / scale, by + 0.5 / scale, bw2 - 1 / scale, bh2 - 1 / scale);
            ctx.fillStyle = "#1C1C1A";
            ctx.fillText(line1, bx + 5 / scale, by + fs + 3 / scale);
            ctx.fillStyle = col;
            ctx.fillText(line2, bx + 5 / scale, by + bh2 - 4 / scale);

            if (layers.confidence && screenW > 60) {
              ctx.fillStyle = "rgba(28,28,26,0.78)";
              ctx.textBaseline = "top";
              ctx.fillText(
                `${(d.confidence * 100).toFixed(1)}%`,
                bx + 5 / scale,
                y + bh + 3 / scale,
              );
            }
          }

          if (layers.id && screenW > 42) {
            ctx.font = `${10 / scale}px ui-monospace, monospace`;
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(247,246,243,0.8)";
            const tag = `${d.aisle}-${d.bay}${d.level}`;
            const tw = ctx.measureText(tag).width + 8 / scale;
            ctx.fillRect(x, y + bh + 2 / scale, tw, 14 / scale);
            ctx.fillStyle = "rgba(28,28,26,0.8)";
            ctx.fillText(tag, x + 4 / scale, y + bh + 4 / scale);
          }
        }
      }

      ctx.restore();

      /* scale bar, screen space */
      const targetPx = 140;
      const mm = Math.round((targetPx / (scale / MM_PER_PLATE_PX)) / 50) * 50;
      const barPx = (mm / MM_PER_PLATE_PX) * scale;
      ctx.strokeStyle = "#1C1C1A";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, h - 22);
      ctx.lineTo(18 + barPx, h - 22);
      ctx.moveTo(18, h - 26);
      ctx.lineTo(18, h - 18);
      ctx.moveTo(18 + barPx, h - 26);
      ctx.lineTo(18 + barPx, h - 18);
      ctx.stroke();
      ctx.fillStyle = "#1C1C1A";
      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${mm} мм`, 18, h - 30);

      if (zoomRef.current) zoomRef.current.textContent = `${Math.round(scale * 100)}%`;
      dirty.current = false;
    };

    const loop = () => {
      if (dirty.current) draw();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [detections, selectedId, layers, mode]);

  React.useEffect(() => {
    dirty.current = true;
  }, [detections, selectedId, layers, mode]);


  /* imperative handle for toolbar buttons */
  React.useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      zoomBy,
      zoomTo,
      fit,
      panBy,
      getTransform: () => ({ ...t.current }),
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, zoomBy, zoomTo, fit, panBy]);

  /* ---------------- tooltip ---------------- */
  const showTip = (d: Detection, clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    if (coordRef.current) {
      const p = toPlate(clientX, clientY);
      coordRef.current.textContent = `x ${Math.round(p.px * MM_PER_PLATE_PX)} · y ${Math.round(
        p.py * MM_PER_PLATE_PX,
      )} мм`;
    }
    const x = clientX - r.left;
    const y = clientY - r.top;
    const flip = x > r.width - 250;
    setTip({
      id: d.id,
      x: flip ? x - 236 : x + 16,
      y: Math.max(8, Math.min(y - 12, r.height - 150)),
    });
  };

  /* ---------------- pointer handlers ---------------- */
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a!.x - b!.x, a!.y - b!.y),
        mid: { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 },
        s: t.current.scale,
      };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, tx: t.current.tx, ty: t.current.ty };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // pinch
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const mid = { x: (a!.x + b!.x) / 2, y: (a!.y + b!.y) / 2 };
      const target = pinch.current.s * (dist / pinch.current.dist);
      zoomTo(target, mid.x, mid.y);
      return;
    }

    if (drag.current) {
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      t.current.tx = drag.current.tx + dx;
      t.current.ty = drag.current.ty + dy;
      dirty.current = true;
      return;
    }

    const d = hit(e.clientX, e.clientY);
    const nextId = d?.id ?? null;
    if (nextId !== hover.current) {
      hover.current = nextId;
      dirty.current = true;
      if (d) showTip(d, e.clientX, e.clientY);
      else setTip(null);
    } else if (d) {
      showTip(d, e.clientX, e.clientY);
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const wasDrag =
      drag.current &&
      (Math.abs(e.clientX - drag.current.x) > 3 || Math.abs(e.clientY - drag.current.y) > 3);
    if (!wasDrag) {
      const d = hit(e.clientX, e.clientY);
      onSelect(d?.id ?? null);
    }
    drag.current = null;
  };

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0016);
      zoomTo(t.current.scale * factor, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomTo]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const step = 40;
      switch (e.key) {
        case "+":
        case "=":
          zoomBy(1.2);
          break;
        case "-":
        case "_":
          zoomBy(1 / 1.2);
          break;
        case "0":
          fit();
          break;
        case "ArrowLeft":
          panBy(step, 0);
          break;
        case "ArrowRight":
          panBy(-step, 0);
          break;
        case "ArrowUp":
          panBy(0, step);
          break;
        case "ArrowDown":
          panBy(0, -step);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomBy, fit, panBy]);

  const hovered = tip ? (detections.find((d) => d.id === tip.id) ?? null) : null;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative h-full w-full touch-none select-none overflow-hidden bg-paper-sunk",
        drag.current ? "cursor-grabbing" : "cursor-crosshair",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onPointerLeave={() => {
        hover.current = null;
        setTip(null);
        dirty.current = true;
      }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Tooltip */}
      {hovered && tip && (
        <div
          role="tooltip"
          style={{ left: tip.x, top: tip.y }}
          className="pointer-events-none absolute z-20 w-[220px] border border-line bg-paper-raised"
        >
          <div
            className="flex items-center justify-between border-b border-line px-2 py-1"
            style={{
              borderLeft: `3px solid ${
                hovered.status === "ok"
                  ? "#2A6F5C"
                  : hovered.status === "facing" || hovered.status === "phantom"
                    ? "#7E6640"
                    : "#B34747"
              }`,
            }}
          >
              <span className="font-mono text-micro text-ink">SKU: {hovered.sku}</span>
              <span className="font-mono text-micro text-ink-faint">
                conf {(hovered.confidence * 100).toFixed(1)}
              </span>
            </div>
            <div className="px-2 py-1.5 font-mono text-micro leading-[1.5] text-ink">
              <div className="truncate text-ink-muted">{hovered.name}</div>
              <div className="tabular mt-1 flex justify-between">
                <span className="text-ink-faint">Ожидается</span>
                <span>{hovered.expected}</span>
              </div>
              <div className="tabular flex justify-between">
                <span className="text-ink-faint">Факт</span>
                <span>{hovered.actual}</span>
              </div>
              <div className="tabular mt-1 border-t border-line-faint pt-1 text-brick">
                Статус:{" "}
                {hovered.status === "ok"
                  ? "СООТВЕТСТВУЕТ"
                  : hovered.status === "oos"
                    ? `НЕХВАТКА ${hovered.expected - hovered.actual} шт`
                    : hovered.status === "facing"
                      ? `ФЕЙСИНГ ${hovered.facing}%`
                      : "НЕВЕРНАЯ ВЫКЛАДКА"}
              </div>
              <div className="tabular mt-0.5 text-ink-faint">
                Ряд {hovered.aisle} · Секция {hovered.bay} · Полка {hovered.level}
              </div>
            </div>
        </div>
      )}

      {/* Readouts */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-3 py-2">
        <span
          ref={coordRef}
          className="tabular bg-paper-raised/90 px-1.5 py-0.5 font-mono text-micro text-ink-muted"
        >
          x 0 · y 0 мм
        </span>
        <span className="flex items-center gap-2">
          <span className="bg-paper-raised/90 px-1.5 py-0.5 font-mono text-micro text-ink-muted">
            ZOOM <span ref={zoomRef}>100%</span>
          </span>
          <span className="hidden bg-paper-raised/90 px-1.5 py-0.5 font-mono text-micro text-ink-muted sm:inline">
            {detections.length} bbox
          </span>
        </span>
      </div>
    </div>
  );
}

export interface ShelfViewportHandle {
  zoomBy: (f: number) => void;
  zoomTo: (s: number, cx?: number, cy?: number) => void;
  fit: () => void;
  panBy: (dx: number, dy: number) => void;
  getTransform: () => T;
}
