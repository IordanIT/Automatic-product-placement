"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { CATALOG, CATEGORIES } from "@/lib/data";
import type { CatalogSku, PlanogramCell } from "@/lib/types";
import { EASE } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { CropMarksOverlay, DesktopOnlyNotice, SectionTitle } from "@/components/ui/Card";
import { Field, Input, SearchInput, Slider } from "@/components/ui/Controls";
import { Tag } from "@/components/ui/Tag";
import { KeyValue } from "@/components/ui/Table";
import {
  IconAlert,
  IconBarcode,
  IconChevronRight,
  IconCopy,
  IconDownload,
  IconEdit,
  IconRuler,
  IconTrash,
  IconUpload,
} from "@/components/ui/icons";

const ROWS = 4;
const COLS = 12;

/** Seed the etalon from the catalogue so the grid is never empty. */
function seedCells(): PlanogramCell[] {
  const cells: PlanogramCell[] = [];
  let c = 0;
  for (let r = 0; r < ROWS; r++) {
    const pool = CATALOG.filter((s) => s.category === CATEGORIES[r % CATEGORIES.length]);
    for (let col = 0; col < COLS; col++) {
      const sku = (col + r) % 11 === 10 ? null : (pool[(col + r) % pool.length] ?? CATALOG[c++ % CATALOG.length]!);
      cells.push({ id: `C-${r}-${col}`, row: r, col, sku: sku?.sku ?? null, capacity: 4 });
    }
  }
  return cells;
}

export function PlanogramPage() {
  const [cells, setCells] = React.useState<PlanogramCell[]>(seedCells);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("Все");
  const [selectedCell, setSelectedCell] = React.useState<string>("C-1-3");
  const [selectedSku, setSelectedSku] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState<{ sku: CatalogSku; x: number; y: number } | null>(null);
  const [overCell, setOverCell] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(
    () =>
      CATALOG.filter(
        (s) =>
          (category === "Все" || s.category === category) &&
          `${s.sku} ${s.name} ${s.barcode} ${s.brand}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, category],
  );

  const bySku = React.useMemo(() => {
    const m = new Map<string, CatalogSku>();
    CATALOG.forEach((s) => m.set(s.sku, s));
    return m;
  }, []);

  const cell = cells.find((c) => c.id === selectedCell) ?? null;
  const activeSku = cell?.sku ? bySku.get(cell.sku) ?? null : selectedSku ? bySku.get(selectedSku) ?? null : null;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  /* ---- drag & drop ---- */
  const onDragStart = (e: React.PointerEvent, sku: CatalogSku) => {
    const r = gridRef.current?.getBoundingClientRect();
    if (!r) return;
    setDrag({ sku, x: e.clientX, y: e.clientY });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cellEl = el?.closest<HTMLElement>("[data-cell]");
    setOverCell(cellEl?.dataset.cell ?? null);
  };

  const onDrop = () => {
    if (!drag || !overCell) {
      setDrag(null);
      setOverCell(null);
      return;
    }
    setCells((prev) =>
      prev.map((c) => (c.id === overCell ? { ...c, sku: drag.sku.sku } : c)),
    );
    setDirty(true);
    setDrag(null);
    setOverCell(null);
  };

  const setCapacity = (v: number) => {
    if (!cell) return;
    setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, capacity: v } : c)));
    setDirty(true);
  };

  const clearCell = () => {
    if (!cell) return;
    setCells((prev) => prev.map((c) => (c.id === cell.id ? { ...c, sku: null } : c)));
    setDirty(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <DesktopOnlyNotice className="mb-1">
        Конструктор планограмм доступен только на планшете и десктопе. На телефоне
        остаются просмотр задач и статусы полок.
      </DesktopOnlyNotice>

      <div className="hidden grid-cols-1 gap-4 lg:grid xl:grid-cols-12">
        {/* ============ left: catalogue ============ */}
        <aside className="flex flex-col border border-line bg-paper-raised xl:col-span-3">
          <div className="border-b border-line p-3">
            <SectionTitle
              index="01"
              title="Каталог SKU"
              note={`${CATALOG.length}`}
              className="border-b-0 pb-2.5"
            />
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Штрих-код, SKU, название…"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {["Все", ...CATEGORIES.slice(0, 4)].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "border px-1.5 py-0.5 font-mono text-micro uppercase tracking-[0.08em] transition-colors duration-200 ease-precise",
                    category === c
                      ? "border-slate bg-slate text-[#F7F6F3]"
                      : "border-line bg-paper text-ink-muted hover:border-brass hover:text-ink",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-360px)] flex-1 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.sku}
                type="button"
                onPointerDown={(e) => onDragStart(e, s)}
                onPointerMove={onDragMove}
                onPointerUp={onDrop}
                onClick={() => setSelectedSku(s.sku)}
                className={cn(
                  "group block w-full cursor-grab border-b border-line-faint px-3 py-2.5 text-left",
                  "transition-colors duration-200 ease-precise hover:bg-paper-sunk active:cursor-grabbing",
                  selectedSku === s.sku && "bg-paper-sunk",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate font-display text-small leading-tight">
                      {s.name}
                    </span>
                    <span className="tabular mt-0.5 block font-mono text-micro text-ink-faint">
                      {s.brand}
                    </span>
                  </span>
                  <IconChevronRight
                    size={14}
                    className="mt-1 shrink-0 text-ink-faint transition-transform duration-200 ease-precise group-hover:translate-x-0.5"
                  />
                </div>
                <div className="tabular mt-1.5 flex items-center gap-2 font-mono text-micro2 text-ink-muted">
                  <IconBarcode size={12} className="text-ink-faint" />
                  {s.sku}
                  <span className="text-ink-faint">· {s.category}</span>
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <Tag tone="neutral">{s.unit}</Tag>
                  <Tag tone="slate">
                    {s.min}–{s.max} фейс.
                  </Tag>
                  <Tag tone="neutral">
                    {s.height}×{s.width}×{s.depth}
                  </Tag>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-8 text-center font-mono text-micro2 text-ink-faint">
                Позиций нет
              </p>
            )}
          </div>

          <div className="border-t border-line bg-paper-sunk px-3 py-2 font-mono text-micro text-ink-faint">
            Перетащите позицию на ячейку эталона
          </div>
        </aside>

        {/* ============ centre: constructor ============ */}
        <div className="xl:col-span-6 2xl:col-span-7">
          <div className="relative border border-line bg-paper-raised">
            <CropMarksOverlay inset={-1} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
              <div>
                <h2 className="font-display text-h4 leading-none">Конструктор эталона</h2>
                <p className="mt-1 font-mono text-micro text-ink-faint">
                  PL-2024-118 «Напитки 0.5л» · ряд 12 · 2400×1100 мм
                </p>
              </div>
              <div className="flex items-center gap-2">
                {dirty && <Tag tone="brass" dot>Не сохранено</Tag>}
                <Button size="sm" onClick={() => flash("Шаблон планограммы применён")}>
                  <IconCopy size={14} />
                  Шаблон
                </Button>
                <Button size="sm" onClick={() => flash("Импорт XLSX…")}>
                  <IconUpload size={14} />
                  Импорт
                </Button>
              </div>
            </div>

            {/* shelf drawing */}
            <div
              ref={gridRef}
              onPointerMove={onDragMove}
              onPointerUp={onDrop}
              onPointerLeave={() => {
                setOverCell(null);
                setDrag(null);
              }}
              className="grid-fine relative select-none px-4 py-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <IconRuler size={14} className="text-ink-faint" />
                <span className="eyebrow">4 полки × 12 фейсингов</span>
              </div>

              <div className="relative border border-ink bg-paper">
                {/* frame rails */}
                <span className="absolute -left-[7px] inset-y-0 w-[3px] bg-line-strong" />
                <span className="absolute -right-[7px] inset-y-0 w-[3px] bg-line-strong" />

                {Array.from({ length: ROWS }).map((_, r) => (
                  <div key={r} className="relative flex border-b border-line last:border-b-0">
                    <span className="tabular flex w-9 shrink-0 items-center justify-center border-r border-line bg-paper-sunk font-mono text-micro text-ink-muted">
                      L{ROWS - r}
                    </span>
                    {Array.from({ length: COLS }).map((__, col) => {
                      const c = cells.find((x) => x.row === r && x.col === col)!;
                      const sku = c.sku ? bySku.get(c.sku) : null;
                      const isSel = c.id === selectedCell;
                      const isOver = c.id === overCell;
                      return (
                        <button
                          key={c.id}
                          data-cell={c.id}
                          type="button"
                          onClick={() => setSelectedCell(c.id)}
                          className={cn(
                            "group relative flex-1 border-r border-line-faint px-1 py-2 text-left transition-colors duration-200 ease-precise",
                            "last:border-r-0",
                            sku ? "bg-paper-raised hover:bg-paper-sunk" : "hatch-brick/40",
                            isSel && "bg-paper-sunk outline outline-1 -outline-offset-1 outline-slate",
                            isOver && "bg-brass-soft",
                          )}
                        >
                          <span
                            className={cn(
                              "block h-[42px] w-full border",
                              sku ? "border-line-strong bg-paper-sunk" : "border-brick-line",
                            )}
                            style={
                              sku
                                ? { background: "repeating-linear-gradient(135deg, #EFEDE8 0 4px, #E4E2DD 4px 8px)" }
                                : undefined
                            }
                          />
                          <span className="tabular mt-1 block truncate font-mono text-[0.5625rem] leading-[1.1] text-ink-muted">
                            {sku ? sku.sku : "—"}
                          </span>
                          <span className="tabular block font-mono text-[0.5625rem] leading-[1.1] text-ink-faint">
                            cap {c.capacity}
                          </span>
                          {isSel && (
                            <span className="absolute -right-px -top-px h-1.5 w-1.5 bg-slate" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* dimension line */}
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-brass" />
                <span className="tabular font-mono text-micro text-ink-muted">2400 мм</span>
                <span className="h-px flex-1 bg-brass" />
              </div>

              {/* drag ghost */}
              <AnimatePresence>
                {drag && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12, ease: EASE }}
                    className="pointer-events-none fixed z-[80] border border-slate bg-paper-raised px-2 py-1.5"
                    style={{ left: drag.x + 12, top: drag.y + 12 }}
                  >
                    <div className="font-mono text-micro2 text-ink">{drag.sku.sku}</div>
                    <div className="font-mono text-micro text-ink-muted">{drag.sku.name}</div>
                    <div className="tabular mt-1 font-mono text-micro text-brass-deep">
                      {drag.sku.height}×{drag.sku.width}×{drag.sku.depth} мм
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* validation strip */}
          <div className="mt-3 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
            <Check
              ok={cells.every((c) => c.sku)}
              label="Пустых ячеек нет"
              value={`${cells.filter((c) => !c.sku).length}`}
            />
            <Check
              ok={cells.filter((c) => c.sku).length >= 40}
              label="Заполненность"
              value={`${Math.round((cells.filter((c) => c.sku).length / cells.length) * 100)}%`}
            />
            <Check
              ok
              label="Габариты в допуске"
              value="100%"
            />
          </div>
        </div>

        {/* ============ right: properties ============ */}
        <aside className="flex flex-col gap-4 xl:col-span-3 2xl:col-span-2">
          <div className="relative border border-line bg-paper-raised p-4">
            <CropMarksOverlay inset={-1} />
            <SectionTitle
              index="02"
              title="Свойства"
              note={cell ? cell.id : "—"}
              className="border-b-0 pb-2"
            />

            {!cell ? (
              <p className="py-6 text-center font-mono text-micro2 text-ink-faint">
                Выберите ячейку
              </p>
            ) : (
              <>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="eyebrow">Ячейка</span>
                  <span className="tabular font-mono text-micro2 text-ink">
                    L{ROWS - cell.row} · позиция {cell.col + 1}
                  </span>
                </div>

                <div className="mt-3 border border-line bg-paper-sunk p-2.5">
                  {activeSku ? (
                    <>
                      <div className="font-display text-small leading-tight">{activeSku.name}</div>
                      <div className="tabular mt-1 font-mono text-micro text-ink-muted">
                        SKU {activeSku.sku} · {activeSku.brand}
                      </div>
                      <div className="tabular mt-0.5 font-mono text-micro text-ink-faint">
                        {activeSku.unit} · {activeSku.height}×{activeSku.width}×{activeSku.depth} мм
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-brick">
                      <IconAlert size={15} />
                      <span className="font-mono text-micro2 uppercase tracking-[0.08em]">
                        Ячейка пуста
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <Field label="Мин. остаток">
                    <Input
                      mono
                      type="number"
                      defaultValue={activeSku?.min ?? 0}
                      className="tabular"
                    />
                  </Field>
                  <Field label="Макс. остаток (фейсинг)">
                    <Input
                      mono
                      type="number"
                      defaultValue={cell.capacity}
                      className="tabular"
                    />
                  </Field>
                  <Field
                    label="Ёмкость ячейки"
                    hint={`${cell.capacity} фейсингов · шаг 1`}
                  >
                    <Slider value={cell.capacity} onChange={setCapacity} min={1} max={8} />
                  </Field>
                  <Field label="Допустимое отклонение, %">
                    <div className="flex items-center gap-3">
                      <Slider value={15} onChange={() => {}} min={0} max={40} />
                      <span className="tabular w-10 shrink-0 border border-line px-1 text-center font-mono text-micro2">
                        15
                      </span>
                    </div>
                  </Field>
                  <Field label="Допустимо к пересчёту">
                    <div className="flex items-center gap-3">
                      <Slider value={1} onChange={() => {}} min={1} max={4} />
                      <span className="tabular w-10 shrink-0 border border-line px-1 text-center font-mono text-micro2">
                        1
                      </span>
                    </div>
                  </Field>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" variant="danger" onClick={clearCell}>
                    <IconTrash size={13} />
                    Очистить
                  </Button>
                  <Button size="sm" variant="ghost">
                    <IconEdit size={13} />
                    Изменить SKU
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="border border-line bg-paper-raised p-4">
            <SectionTitle index="03" title="Публикация" className="border-b-0 pb-2" />
            <div className="mt-3">
              <KeyValue k="Версия" v="rev 4" />
              <KeyValue k="Действует с" v="17.09.2024" />
              <KeyValue k="Автор" v="А. Северов" />
              <KeyValue k="Согласование" v="Товарищество" />
            </div>
            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full justify-center"
              onClick={() => {
                setDirty(false);
                flash("Планограмма сохранена · rev 5");
              }}
            >
              Сохранить планограмму
            </Button>
            <Button
              className="mt-2 w-full justify-center"
              onClick={() => flash("Экспорт чертежа PDF…")}
            >
              <IconDownload size={15} />
              Экспорт в PDF (чертёж)
            </Button>
            <p className="mt-2.5 text-center font-mono text-micro text-ink-faint">
              A1 · 1:10 · ISO 5457
            </p>
          </div>
        </aside>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="fixed bottom-5 right-5 z-[80] border border-slate bg-slate px-3 py-2 font-mono text-micro2 uppercase tracking-[0.1em] text-[#F7F6F3]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Check({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-paper px-3 py-2.5">
      <span className="flex items-center gap-2">
        <span
          className={cn("h-2 w-2 border", ok ? "border-forest bg-forest" : "border-brick bg-brick")}
        />
        <span className="font-mono text-micro uppercase tracking-[0.08em] text-ink-muted">
          {label}
        </span>
      </span>
      <span className="tabular font-mono text-micro2 text-ink">{value}</span>
    </div>
  );
}