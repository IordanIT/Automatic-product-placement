"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DETECTIONS, SHELF_META, STATUS_LABEL } from "@/lib/data";
import type { Detection, FacetStatus } from "@/lib/types";
import { EASE } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { Meter, Segmented, Slider } from "@/components/ui/Controls";
import { CropMarksOverlay, SectionTitle } from "@/components/ui/Card";
import { FACET_TONE, Tag } from "@/components/ui/Tag";
import { KeyValue, Tabs, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  IconAlert,
  IconBarcode,
  IconCheck,
  IconClose,
  IconCrosshair,
  IconDownload,
  IconFit,
  IconGrid,
  IconInbox,
  IconLayers,
  IconRefresh,
  IconUser,
  IconZoomIn,
  IconZoomOut,
} from "@/components/ui/icons";
import { Layers, ShelfViewport, ShelfViewportHandle } from "./ShelfViewport";

const ORDER: Record<FacetStatus, number> = {
  oos: 0,
  misplaced: 1,
  phantom: 2,
  facing: 3,
  ok: 4,
};

export function ShelfAnalysisPage() {
  const [mode, setMode] = React.useState<"photo" | "schema">("photo");
  const [selected, setSelected] = React.useState<string | null>(null);
  const [layers, setLayers] = React.useState<Layers>({
    boxes: true,
    labels: true,
    confidence: false,
    grid: false,
    id: true,
  });
  const [filter, setFilter] = React.useState<"all" | "oos" | "misplaced" | "facing">("all");
  const [threshold, setThreshold] = React.useState(72);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [assigned, setAssigned] = React.useState<Record<string, string>>({});
  const handle = React.useRef<ShelfViewportHandle | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const anomalies = React.useMemo(
    () =>
      [...DETECTIONS]
        .filter((d) => d.status !== "ok")
        .filter((d) => d.confidence * 100 >= threshold)
        .filter((d) => (filter === "all" ? true : d.status === filter || (filter === "misplaced" && d.status === "phantom")))
        .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.confidence - b.confidence),
    [filter, threshold],
  );

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { oos: 0, misplaced: 0, facing: 0, phantom: 0 };
    DETECTIONS.forEach((d) => {
      if (d.status !== "ok") c[d.status] = (c[d.status] ?? 0) + 1;
    });
    return c;
  }, []);

  const [progress, setProgress] = React.useState<null | string>(null);
  React.useEffect(() => {
    if (!busy) return;
    const id = window.setTimeout(() => {
      setProgress(busy);
      window.setTimeout(() => {
        setBusy(null);
        setProgress(null);
      }, 900);
    }, 1500);
    return () => window.clearTimeout(id);
  }, [busy]);

  const selectAndReveal = (id: string | null) => {
    setSelected(id);
    if (!id) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-row="${id}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const selectedDetection = DETECTIONS.find((d) => d.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {/* ============ pipeline status strip ============ */}
      <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
        <Stat label="Совпадение с планограммой" value={`${SHELF_META.score}%`} tone="forest" sub={`${SHELF_META.resolved} из ${SHELF_META.total} фейсингов`} />
        <Stat label="Расчётный OOS" value={String(counts.oos)} tone="brick" sub="пустых фейсингов" />
        <Stat label="Неверная выкладка" value={String(counts.misplaced + counts.phantom)} tone="brick" sub="SKU вне своей секции" />
        <Stat label="Фейсинг ниже нормы" value={String(counts.facing)} tone="brass" sub="ориентация < 100%" />
      </div>

      {/* ============ split view ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* ---------- left: visualisation ---------- */}
        <div className="xl:col-span-7 2xl:col-span-8">
          <div className="relative border border-line bg-paper-raised">
            <CropMarksOverlay inset={-1} />

            {/* toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper px-2 py-1.5">
              <div className="flex items-center gap-2">
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: "photo", label: "Фото" },
                    { value: "schema", label: "Схема" },
                  ]}
                />
                <span className="hidden items-center gap-1.5 border-l border-line pl-3 font-mono text-micro uppercase tracking-[0.1em] text-ink-faint lg:flex">
                  {mode === "photo" ? "CAM-A12-04 · 2.4 MP" : "PL-2024-118 · вектор"}
                </span>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-1">
                <ToolBtn label="Уменьшить" onClick={() => handle.current?.zoomBy(1 / 1.25)}>
                  <IconZoomOut size={15} />
                </ToolBtn>
                <ToolBtn label="Вписать" onClick={() => handle.current?.fit()}>
                  <IconFit size={15} />
                </ToolBtn>
                <ToolBtn label="Увеличить" onClick={() => handle.current?.zoomBy(1.25)}>
                  <IconZoomIn size={15} />
                </ToolBtn>
                <span className="mx-1 h-5 w-px bg-line" />
                <LayerToggle
                  on={layers.boxes}
                  onClick={() => setLayers((l) => ({ ...l, boxes: !l.boxes }))}
                  label="Рамки"
                >
                  <IconLayers size={15} />
                </LayerToggle>
                <LayerToggle
                  on={layers.labels}
                  onClick={() => setLayers((l) => ({ ...l, labels: !l.labels }))}
                  label="Подписи"
                >
                  <IconInbox size={15} />
                </LayerToggle>
                <LayerToggle
                  on={layers.grid}
                  onClick={() => setLayers((l) => ({ ...l, grid: !l.grid }))}
                  label="Координатная сетка"
                >
                  <IconGrid size={15} />
                </LayerToggle>
                <LayerToggle
                  on={layers.confidence}
                  onClick={() => setLayers((l) => ({ ...l, confidence: !l.confidence }))}
                  label="Уверенность модели"
                >
                  <IconCrosshair size={15} />
                </LayerToggle>
                <span className="mx-1 h-5 w-px bg-line" />
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={() => setBusy("Сканирование стеллажа…")}
                >
                  <IconRefresh size={14} />
                  Пересканировать
                </Button>
                <Button size="sm" onClick={() => setBusy("Формирование отчёта PDF…")}>
                  <IconDownload size={14} />
                  Отчёт
                </Button>
              </div>
            </div>

            {/* canvas stage */}
            <div className="relative h-[clamp(380px,58vh,720px)] w-full">
              <ShelfViewport
                mode={mode}
                detections={DETECTIONS}
                selectedId={selected}
                onSelect={selectAndReveal}
                layers={layers}
                handleRef={handle}
              />

              {/* busy overlay — real pipeline wording, not "Загрузка..." */}
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-paper/88 backdrop-blur-[1px]"
                  >
                    <div className="relative h-[2px] w-56 overflow-hidden bg-line">
                      <motion.span
                        className="absolute inset-y-0 left-0 w-1/3 bg-slate"
                        initial={{ x: "-100%" }}
                        animate={{ x: "300%" }}
                        transition={{ duration: 1.1, ease: EASE, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-mono text-micro2 uppercase tracking-[0.12em] text-ink">
                        {progress ?? busy}
                      </p>
                      <p className="mt-1.5 font-mono text-micro text-ink-faint">
                        {progress ? "Готово" : "vision-inference · gpu-0"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* legend */}
              <div className="pointer-events-none absolute left-2 top-2 border border-line bg-paper-raised/92">
                {(["ok", "oos", "misplaced", "facing"] as FacetStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-2 border-b border-line-faint px-2 py-1 last:border-b-0">
                    <span
                      className="h-2.5 w-2.5 border"
                      style={{
                        borderColor:
                          s === "ok" ? "#2A6F5C" : s === "facing" ? "#7E6640" : "#B34747",
                        background:
                          s === "ok"
                            ? "rgba(42,111,92,0.18)"
                            : s === "facing"
                              ? "rgba(196,165,116,0.22)"
                              : s === "misplaced"
                                ? "transparent"
                                : "rgba(179,71,71,0.2)",
                      }}
                    />
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-muted">
                      {s === "ok"
                        ? "совпадает"
                        : s === "oos"
                          ? "OOS"
                          : s === "misplaced"
                            ? "неверная выкладка"
                            : "фейсинг"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* confidence threshold */}
            <div className="flex flex-wrap items-center gap-4 border-t border-line bg-paper px-3 py-2">
              <span className="eyebrow shrink-0 !text-ink-faint">Порог уверенности</span>
              <div className="flex min-w-[180px] flex-1 items-center gap-3">
                <Slider value={threshold} onChange={setThreshold} min={50} max={99} />
                <span className="tabular w-10 shrink-0 border border-line px-1 text-center font-mono text-micro2">
                  {threshold}%
                </span>
              </div>
              <span className="font-mono text-micro text-ink-faint">
                Скрыто детекций: {DETECTIONS.filter((d) => d.confidence * 100 < threshold).length}
              </span>
            </div>
          </div>
        </div>

        {/* ---------- right: summary + tasks ---------- */}
        <div className="flex flex-col gap-4 xl:col-span-5 2xl:col-span-4">
          {/* summary */}
          <div className="relative border border-line bg-paper-raised p-4">
            <CropMarksOverlay inset={-1} />
            <SectionTitle
              index="A"
              title="Сводка по полке"
              note={SHELF_META.id}
              className="border-b-0 pb-2"
            />
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <div className="tabular font-display text-[2.75rem] leading-none text-forest">
                  {SHELF_META.score}
                  <span className="text-h3">%</span>
                </div>
                <div className="eyebrow mt-1.5">Совпадение с планограммой</div>
              </div>
              <div className="text-right">
                <div className="tabular font-mono text-small text-ink">
                  {SHELF_META.resolved}/{SHELF_META.total}
                </div>
                <div className="eyebrow mt-1">Фейсингов</div>
              </div>
            </div>
            <Meter value={SHELF_META.score} className="mt-3" />

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-0">
              <KeyValue k="Планограмма" v={SHELF_META.planogram} mono={false} />
              <KeyValue k="Устройство" v={SHELF_META.device} />
              <KeyValue k="Кадр" v={SHELF_META.capturedAt} />
              <KeyValue k="Камера" v={SHELF_META.camera} mono={false} />
              <KeyValue k="Ожидалось ед." v={SHELF_META.unitsExpected} />
              <KeyValue k="На полке ед." v={SHELF_META.unitsActual} />
            </div>
          </div>

          {/* anomaly list */}
          <div className="flex min-h-0 flex-1 flex-col border border-line bg-paper-raised">
            <div className="border-b border-line px-3 pb-0 pt-3">
              <div className="flex items-center justify-between">
                <SectionTitle
                  index="B"
                  title="Аномалии · задачи"
                  note={`${anomalies.length}`}
                  className="border-b-0 pb-2"
                />
              </div>
              <Tabs
                value={filter}
                onChange={setFilter}
                variant="enclosed"
                className="mb-2 -ml-px"
                items={[
                  { value: "all", label: "Все" },
                  { value: "oos", label: "OOS", count: counts.oos },
                  { value: "misplaced", label: "Выкладка", count: counts.misplaced },
                  { value: "facing", label: "Фейсинг", count: counts.facing },
                ]}
              />
            </div>

            <div ref={listRef} className="max-h-[clamp(320px,44vh,620px)] flex-1 overflow-y-auto">
              {anomalies.map((d, i) => (
                <AnomalyCard
                  key={d.id}
                  d={d}
                  index={i}
                  active={selected === d.id}
                  assignee={assigned[d.id]}
                  onHover={() => setSelected(d.id)}
                  onAssign={(name) => setAssigned((a) => ({ ...a, [d.id]: name }))}
                />
              ))}
              {anomalies.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                  <IconCheck size={22} className="text-forest" />
                  <p className="text-small text-ink-muted">
                    По выбранному порогу аномалий не найдено.
                  </p>
                  <p className="font-mono text-micro text-ink-faint">
                    Порог {threshold}% · кадр {SHELF_META.id}
                  </p>
                </div>
              )}
            </div>

            {/* action */}
            <div className="border-t border-line p-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                onClick={() => setBusy("Формирование задания в WMS…")}
                disabled={anomalies.length === 0}
              >
                Сформировать задание в WMS
                <span className="tabular ml-1 opacity-60">({anomalies.length})</span>
              </Button>
              <p className="mt-2 text-center font-mono text-micro text-ink-faint">
                Протокол обмена: WMS-XML 2.4 · очередь replenishment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ detection register ============ */}
      <div className="border border-line bg-paper-raised">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h3 className="font-display text-h4 leading-none">Реестр детекций</h3>
            <p className="mt-1.5 font-mono text-micro text-ink-faint">
              Полный вывод inference-модели по кадру {SHELF_META.id} · сортировка по приоритету
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tag tone="neutral" dot>
              {DETECTIONS.length} записей
            </Tag>
            <Button size="sm" onClick={() => setBusy("Выгрузка CSV…")}>
              <IconDownload size={14} />
              CSV
            </Button>
          </div>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-[92px]">bbox</Th>
              <Th className="w-[110px]">SKU</Th>
              <Th>Наименование</Th>
              <Th className="w-[92px]">Координаты</Th>
              <Th align="right" className="w-[64px]">Ожид.</Th>
              <Th align="right" className="w-[64px]">Факт</Th>
              <Th align="right" className="w-[92px]">Уверенность</Th>
              <Th className="w-[190px]">Статус</Th>
            </tr>
          </thead>
          <tbody>
            {[...DETECTIONS]
              .sort((a, b) => ORDER[a.status] - ORDER[b.status])
              .map((d) => (
                <Tr
                  key={d.id}
                  onClick={() => selectAndReveal(d.id)}
                  className={cn(
                    selected === d.id && "bg-paper-sunk",
                    d.confidence * 100 < threshold && "opacity-40",
                  )}
                >
                  <Td className="font-mono text-micro2 text-ink-faint">{d.id}</Td>
                  <Td className="font-mono text-micro2 tabular">{d.sku}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      {d.name}
                      {d.status === "phantom" && (
                        <IconAlert size={13} className="text-brass-deep" />
                      )}
                    </span>
                  </Td>
                  <Td className="tabular font-mono text-micro2 text-ink-muted">
                    {d.aisle}-{d.bay}{d.level}
                  </Td>
                  <Td align="right" className="tabular font-mono text-micro2">
                    {d.expected}
                  </Td>
                  <Td
                    align="right"
                    className={cn(
                      "tabular font-mono text-micro2",
                      d.actual < d.expected && "text-brick",
                    )}
                  >
                    {d.actual}
                  </Td>
                  <Td align="right">
                    <span className="flex items-center justify-end gap-2">
                      <span
                        className={cn(
                          "tabular font-mono text-micro2",
                          d.confidence < 0.9 && "text-brass-deep",
                        )}
                      >
                        {(d.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="inline-block h-[3px] w-10 border border-line">
                        <span
                          className="block h-full bg-slate"
                          style={{ width: `${d.confidence * 100}%` }}
                        />
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <Tag tone={FACET_TONE[d.status]}>{STATUS_LABEL[d.status]}</Tag>
                  </Td>
                </Tr>
              ))}
          </tbody>
        </TableWrap>
      </div>

      {/* ============ selected detection detail ============ */}
      <AnimatePresence>
        {selectedDetection && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="fixed bottom-5 left-5 z-[65] w-[min(380px,calc(100vw-2.5rem))] border border-line bg-paper-raised"
          >
            <div
              className="flex items-center justify-between border-b border-line px-3 py-2"
              style={{
                borderLeft: `3px solid ${
                  selectedDetection.status === "ok"
                    ? "#2A6F5C"
                    : selectedDetection.status === "facing"
                      ? "#7E6640"
                      : "#B34747"
                }`,
              }}
            >
              <span className="font-mono text-micro2 uppercase tracking-[0.1em] text-ink">
                Детекция {selectedDetection.id}
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Закрыть"
                className="text-ink-faint transition-colors hover:text-ink"
              >
                <IconClose size={14} />
              </button>
            </div>
            <div className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lead leading-tight">{selectedDetection.name}</div>
                  <div className="tabular mt-1 flex items-center gap-2 font-mono text-micro text-ink-muted">
                    <IconBarcode size={13} />
                    SKU {selectedDetection.sku} · {selectedDetection.brand}
                  </div>
                </div>
                <Tag tone={FACET_TONE[selectedDetection.status]}>
                  {STATUS_LABEL[selectedDetection.status]}
                </Tag>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-0">
                <KeyValue k="Координаты" v={`Ряд ${selectedDetection.aisle} · ${selectedDetection.bay}${selectedDetection.level}`} />
                <KeyValue k="Уверенность" v={`${(selectedDetection.confidence * 100).toFixed(1)}%`} />
                <KeyValue k="Ожидалось" v={selectedDetection.expected} />
                <KeyValue k="Факт" v={selectedDetection.actual} />
                <KeyValue k="Фейсинг" v={`${selectedDetection.facing}%`} />
                <KeyValue k="Габарит, мм" v={`${Math.round(selectedDetection.w * 2400)}×${Math.round(selectedDetection.h * 900 * 0.5)}`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "forest" | "brick" | "brass";
}) {
  const color = { forest: "text-forest", brick: "text-brick", brass: "text-brass-deep" }[tone];
  return (
    <div className="bg-paper px-3 py-3">
      <div className="eyebrow">{label}</div>
      <div className={cn("tabular mt-1.5 font-display text-h3 leading-none", color)}>{value}</div>
      <div className="mt-1.5 font-mono text-micro text-ink-faint">{sub}</div>
    </div>
  );
}

function ToolBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center border border-line bg-paper-raised text-ink-muted transition-colors duration-200 ease-precise hover:border-brass hover:text-ink"
    >
      {children}
    </button>
  );
}

function LayerToggle({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center border transition-colors duration-200 ease-precise",
        on
          ? "border-slate bg-slate text-[#F7F6F3]"
          : "border-line bg-paper-raised text-ink-faint hover:border-brass hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

const ASSIGNEES = ["И. Полозова", "М. Гаврилов", "А. Северов", "Р. Тимурзе"];

function AnomalyCard({
  d,
  index,
  active,
  assignee,
  onHover,
  onAssign,
}: {
  d: Detection;
  index: number;
  active: boolean;
  assignee?: string;
  onHover: () => void;
  onAssign: (n: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const accent =
    d.status === "ok" ? "#2A6F5C" : d.status === "facing" || d.status === "phantom" ? "#7E6640" : "#B34747";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE, delay: Math.min(index, 8) * 0.012 }}
      onMouseEnter={onHover}
      className={cn(
        "group border-b border-line-faint px-3 py-2.5 transition-colors duration-200 ease-precise",
        active ? "bg-paper-sunk" : "hover:bg-paper-sunk/70",
      )}
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone={FACET_TONE[d.status]}>{STATUS_LABEL[d.status]}</Tag>
            <span className="tabular font-mono text-micro text-ink-faint">
              {d.aisle}-{d.bay}{d.level}
            </span>
          </div>
          <div className="mt-1.5 truncate font-display text-small leading-tight">{d.name}</div>
          <div className="tabular mt-1 font-mono text-micro text-ink-muted">
            SKU {d.sku} · ожидается {d.expected} / факт {d.actual} · conf{" "}
            {(d.confidence * 100).toFixed(1)}%
          </div>
        </div>
        <span className="tabular shrink-0 font-mono text-micro2 text-ink-faint">
          {(index + 1).toString().padStart(2, "0")}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 border-t border-line-faint pt-2.5">
              <p className="text-micro leading-relaxed text-ink-muted">
                {d.status === "oos"
                  ? `Свободных фейсингов в секции ${d.bay}${d.level}: ${d.expected - d.actual}. Товар числится в WMS, на полке отсутствует.`
                  : d.status === "misplaced"
                    ? `Обнаружен SKU ${d.sku} вне целевой секции. Требуется перестановка и пересчёт ячейки.`
                    : `Ориентация упаковки ${d.facing}% от нормы. Разворот на лицевую сторону.`
                }
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {ASSIGNEES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => onAssign(a)}
                    className={cn(
                      "border px-2 py-1 font-mono text-micro uppercase tracking-[0.08em] transition-colors duration-200 ease-precise",
                      assignee === a
                        ? "border-slate bg-slate text-[#F7F6F3]"
                        : "border-line bg-paper-raised text-ink-muted hover:border-brass hover:text-ink",
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2.5 flex items-center gap-2">
        {assignee ? (
          <span className="inline-flex items-center gap-1.5 border border-forest-line bg-forest-soft px-2 py-1 font-mono text-micro uppercase tracking-[0.08em] text-forest">
            <IconUser size={12} />
            {assignee}
          </span>
        ) : (
          <Button size="sm" onClick={() => setOpen((o) => !o)}>
            <IconUser size={13} />
            Назначить исполнителя
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
          {open ? "Свернуть" : "Подробнее"}
        </Button>
      </div>
    </motion.div>
  );
}