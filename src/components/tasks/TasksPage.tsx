"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  DETECTIONS,
  STORES,
  TASK_STATUS_LABEL,
  TASK_TYPE_LABEL,
  TASKS,
} from "@/lib/data";
import type { Task, TaskStatus, TaskType } from "@/lib/types";
import { EASE } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { CropMarksOverlay, SectionTitle } from "@/components/ui/Card";
import { SearchInput, Segmented, Select } from "@/components/ui/Controls";
import { StatusDot, TASK_STATUS_TONE, TASK_TYPE_TONE, Tag } from "@/components/ui/Tag";
import { Drawer, KeyValue, TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import {
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconClose,
  IconFilter,
  IconInbox,
  IconRefresh,
  IconUpload,
  IconUser,
} from "@/components/ui/icons";

const COLUMNS: TaskStatus[] = ["new", "assigned", "in_progress", "done"];

const SEVERITY_RANK = { critical: 0, major: 1, minor: 2 } as const;

function fmtDeadline(iso: string) {
  const d = new Date(iso);
  const now = new Date("2024-09-17T10:00:00Z");
  const mins = Math.round((d.getTime() - now.getTime()) / 60000);
  if (mins < 60) return `${mins} мин`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} ч`;
  return `${Math.round(mins / 1440)} дн`;
}

function fmtTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19);
}

export function TasksPage() {
  const [view, setView] = React.useState<"table" | "board">("table");
  const [status, setStatus] = React.useState<"all" | TaskStatus>("all");
  const [type, setType] = React.useState<"all" | TaskType>("all");
  const [sev, setSev] = React.useState<"all" | Task["severity"]>("all");
  const [store, setStore] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState(TASKS);
  const [after, setAfter] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);

  const list = React.useMemo(
    () =>
      rows
        .filter((t) => (status === "all" ? true : t.status === status))
        .filter((t) => (type === "all" ? true : t.type === type))
        .filter((t) => (sev === "all" ? true : t.severity === sev))
        .filter((t) => (store === "all" ? true : t.store === store))
        .filter((t) =>
          `${t.id} ${t.sku} ${t.title} ${t.body} ${t.assignee ?? ""}`
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
    [rows, status, type, sev, store, q],
  );

  const open = rows.find((t) => t.id === openId) ?? null;
  const counts = COLUMNS.map(
    (c) => rows.filter((t) => t.status === c).length,
  );

  const setTaskStatus = (id: string, s: TaskStatus) =>
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, status: s } : t)));

  const reset = () => {
    setStatus("all");
    setType("all");
    setSev("all");
    setStore("all");
    setQ("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ============ filters ============ */}
      <div className="border border-line bg-paper-raised">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
          <span className="eyebrow flex items-center gap-1.5">
            <IconFilter size={13} />
            Фильтры
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Segmented
              value={view}
              onChange={setView}
              size="sm"
              options={[
                { value: "table", label: "Таблица" },
                { value: "board", label: "Канбан" },
              ]}
            />
            <Button size="sm" variant="ghost" onClick={reset}>
              <IconRefresh size={13} />
              Сбросить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={q} onChange={setQ} placeholder="ID, SKU, исполнитель…" />

          <Select
            value={status}
            onChange={(v) => setStatus(v as typeof status)}
            label={`Статус: ${status === "all" ? "все" : TASK_STATUS_LABEL[status as TaskStatus]}`}
            options={[
              { value: "all", label: "Все статусы" },
              ...COLUMNS.map((c) => ({ value: c, label: TASK_STATUS_LABEL[c] })),
            ]}
          />
          <Select
            value={type}
            onChange={(v) => setType(v as typeof type)}
            label={`Тип: ${type === "all" ? "все" : TASK_TYPE_LABEL[type as TaskType]}`}
            options={[
              { value: "all", label: "Все типы" },
              ...(Object.keys(TASK_TYPE_LABEL) as TaskType[]).map((t) => ({
                value: t,
                label: TASK_TYPE_LABEL[t],
              })),
            ]}
          />
          <Select
            value={sev}
            onChange={(v) => setSev(v as typeof sev)}
            label={`Приоритет: ${sev === "all" ? "все" : sev === "critical" ? "критический" : sev === "major" ? "высокий" : "средний"}`}
            options={[
              { value: "all", label: "Любой приоритет" },
              { value: "critical", label: "Критический" },
              { value: "major", label: "Высокий" },
              { value: "minor", label: "Средний" },
            ]}
          />
          <Select
            value={store}
            onChange={setStore}
            align="right"
            label={`Магазин: ${store === "all" ? "все" : (STORES.find((s) => s.name === store)?.name ?? "все")}`}
            options={[
              { value: "all", label: "Все магазины" },
              ...STORES.map((s) => ({ value: s.name, label: s.name, hint: s.id })),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line bg-paper px-3 py-2">
          <span className="font-mono text-micro text-ink-faint">
            Найдено {list.length} из {rows.length}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-micro text-ink-muted">
            <StatusDot tone="ok" />
            Новые {counts[0]}
          </span>
          <span className="font-mono text-micro text-ink-muted">Назначено {counts[1]}</span>
          <span className="font-mono text-micro text-ink-muted">В работе {counts[2]}</span>
          <span className="font-mono text-micro text-ink-muted">Выполнено {counts[3]}</span>
        </div>
      </div>

      {/* ============ body ============ */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {view === "table" ? (
            <>
            <div className="hidden border border-line bg-paper-raised md:block">
              <TableWrap>
                <thead>
                  <tr>
                    <Th className="w-[132px]">ID</Th>
                    <Th className="w-[220px]">Магазин / стеллаж</Th>
                    <Th className="w-[190px]">Тип аномалии</Th>
                    <Th>Описание</Th>
                    <Th className="w-[140px]">Исполнитель</Th>
                    <Th className="w-[92px]">Дедлайн</Th>
                    <Th className="w-[130px]">Статус</Th>
                    <Th className="w-[40px]" />
                  </tr>
                </thead>
                <tbody>
                  {[...list]
                    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
                    .map((t) => (
                      <Tr key={t.id} onClick={() => setOpenId(t.id)}>
                        <Td className="tabular font-mono text-micro2 text-ink-muted">{t.id}</Td>
                        <Td>
                          <span className="block truncate">{t.store}</span>
                          <span className="tabular block font-mono text-micro text-ink-faint">
                            Ряд {t.aisle} · Секция {t.bay}
                            {t.level} · SKU {t.sku}
                          </span>
                        </Td>
                        <Td>
                          <Tag tone={TASK_TYPE_TONE[t.type]}>{TASK_TYPE_LABEL[t.type]}</Tag>
                          {t.severity === "critical" && (
                            <span className="mt-1 block font-mono text-micro text-brick">
                              критический
                            </span>
                          )}
                        </Td>
                        <Td>
                          <span className="block truncate">{t.title}</span>
                          <span className="block truncate text-micro text-ink-muted">{t.body}</span>
                        </Td>
                        <Td>
                          {t.assignee ? (
                            <span className="inline-flex items-center gap-1.5 font-mono text-micro2">
                              <IconUser size={13} className="text-ink-faint" />
                              {t.assignee}
                            </span>
                          ) : (
                            <span className="font-mono text-micro text-ink-faint">— не назначен —</span>
                          )}
                        </Td>
                        <Td>
                          <span
                            className={cn(
                              "tabular inline-flex items-center gap-1.5 font-mono text-micro2",
                              t.status !== "done" && t.severity === "critical" && "text-brick",
                            )}
                          >
                            <IconClock size={12} className="text-ink-faint" />
                            {fmtDeadline(t.deadline)}
                          </span>
                        </Td>
                        <Td>
                          <Tag tone={TASK_STATUS_TONE[t.status]} dot>
                            {TASK_STATUS_LABEL[t.status]}
                          </Tag>
                        </Td>
                        <Td>
                          <IconChevronRight size={15} className="text-ink-faint" />
                        </Td>
                      </Tr>
                    ))}
                </tbody>
              </TableWrap>
              {list.length === 0 && <EmptyState onReset={reset} />}
            </div>

            {/* Phone build: the task queue is the one thing that stays fully usable,
                so it gets a card list instead of a 720px-wide table. */}
            <div className="border border-line bg-paper-raised md:hidden">
              {[...list]
                .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className="block w-full border-b border-line-faint px-3 py-3 text-left transition-colors duration-200 ease-precise active:bg-paper-sunk"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="tabular font-mono text-micro2 text-ink-faint">{t.id}</span>
                      <Tag tone={TASK_STATUS_TONE[t.status]} dot>
                        {TASK_STATUS_LABEL[t.status]}
                      </Tag>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Tag tone={TASK_TYPE_TONE[t.type]}>{TASK_TYPE_LABEL[t.type]}</Tag>
                      {t.severity === "critical" && (
                        <span className="font-mono text-micro text-brick">критический</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-small leading-snug text-ink">{t.title}</p>
                    <p className="mt-1 truncate text-micro text-ink-muted">{t.body}</p>
                    <div className="tabular mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-micro2 text-ink-faint">
                      <span className="truncate">{t.store}</span>
                      <span>
                        Ряд {t.aisle} · {t.bay}
                        {t.level} · {t.sku}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconClock size={12} />
                        {fmtDeadline(t.deadline)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IconUser size={12} />
                        {t.assignee ?? "не назначен"}
                      </span>
                    </div>
                  </button>
                ))}
              {list.length === 0 && <EmptyState onReset={reset} />}
            </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
              {COLUMNS.map((col) => {
                const items = list
                  .filter((t) => t.status === col)
                  .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
                return (
                  <div key={col} className="flex min-h-[320px] flex-col bg-paper">
                    <div className="flex items-center justify-between border-b border-line px-3 py-2">
                      <span className="font-mono text-micro uppercase tracking-[0.1em] text-ink">
                        {TASK_STATUS_LABEL[col]}
                      </span>
                      <span className="tabular border border-line px-1.5 font-mono text-micro text-ink-muted">
                        {items.length}
                      </span>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-2">
                      {items.map((t) => (
                        <div
                          key={t.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setOpenId(t.id)}
                          onKeyDown={(e) => e.key === "Enter" && setOpenId(t.id)}
                          className="press cursor-pointer border border-line bg-paper-raised p-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Tag tone={TASK_TYPE_TONE[t.type]}>
                              {t.type === "oos" ? "OOS" : t.type === "misplaced" ? "ВЫКЛАДКА" : t.type === "facing" ? "ФЕЙСИНГ" : "ФАНТОМ"}
                            </Tag>
                            <span className="tabular font-mono text-micro text-ink-faint">
                              {fmtDeadline(t.deadline)}
                            </span>
                          </div>
                          <div className="mt-2 font-display text-small leading-tight">{t.title}</div>
                          <div className="tabular mt-1 font-mono text-micro text-ink-muted">
                            {t.aisle}-{t.bay}
                            {t.level} · {t.sku}
                          </div>
                          <div className="mt-2 border-t border-line-faint pt-2 font-mono text-micro text-ink-faint">
                            {t.assignee ?? "не назначен"}
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && (
                        <p className="py-6 text-center font-mono text-micro text-ink-faint">— пусто —</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ============ detail drawer ============ */}
      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        width="w-[min(560px,94vw)]"
        label="Детали задачи"
      >
        {open && (
          <TaskDetail
            task={open}
            after={after}
            verifying={verifying}
            onUpload={() => setAfter("after")}
            onVerify={() => {
              setVerifying(true);
              window.setTimeout(() => setVerifying(false), 2200);
            }}
            onClose={() => setOpenId(null)}
            onStatus={(s) => {
              setTaskStatus(open.id, s);
              if (s === "done" && after) setOpenId(null);
            }}
          />
        )}
      </Drawer>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TaskDetail({
  task,
  after,
  verifying,
  onUpload,
  onVerify,
  onClose,
  onStatus,
}: {
  task: Task;
  after: string | null;
  verifying: boolean;
  onUpload: () => void;
  onVerify: () => void;
  onClose: () => void;
  onStatus: (s: TaskStatus) => void;
}) {
  const det = DETECTIONS.find((d) => d.sku === task.sku);

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Tag tone={TASK_TYPE_TONE[task.type]}>{TASK_TYPE_LABEL[task.type]}</Tag>
            <span className="tabular font-mono text-micro text-ink-faint">{task.id}</span>
          </div>
          <h2 className="mt-1.5 font-display text-h4 leading-tight">{task.title}</h2>
          <p className="mt-1 font-mono text-micro text-ink-muted">
            {task.store} · ряд {task.aisle} · секция {task.bay}
            {task.level}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="shrink-0 border border-line p-1.5 text-ink-muted transition-colors hover:border-brick hover:text-brick"
        >
          <IconClose size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* before / after */}
        <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
          <PhotoPlate
            title="До"
            caption={`${fmtTime(task.createdAt)} · разметка CV`}
            detection={det ?? null}
            muted
          />
          <PhotoPlate
            title="После"
            caption={after ? "загружено · ожидает проверки" : "фото не загружено"}
            detection={det ?? null}
            after={!!after}
            onUpload={onUpload}
          />
        </div>

        {/* instruction */}
        <div className="border-b border-line px-4 py-3.5">
          <span className="eyebrow">Задание</span>
          <p className="mt-1.5 font-display text-lead leading-snug">{task.body}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-6">
            <KeyValue k="SKU" v={task.sku} />
            <KeyValue k="Координаты" v={`${task.aisle}-${task.bay}${task.level}`} />
            <KeyValue k="Приоритет" v={task.severity === "critical" ? "критический" : task.severity === "major" ? "высокий" : "средний"} mono={false} />
            <KeyValue k="Дедлайн" v={fmtDeadline(task.deadline)} />
            <KeyValue k="Уверенность CV" v={`${(task.confidence * 100).toFixed(1)}%`} />
            <KeyValue k="Единиц" v={task.qty} />
          </div>
        </div>

        {/* timeline */}
        <div className="border-b border-line px-4 py-3.5">
          <span className="eyebrow">Маршрут</span>
          <ol className="mt-2.5 space-y-0">
            <Step done label="Кадр получен и размечен" meta={`${fmtTime(task.createdAt)} · CAM-A12-04`} />
            <Step done label="Сопоставление с планограммой PL-2024-118" meta="совпадение 87%" />
            <Step done={task.status !== "new"} label="Задача сформирована и отправлена в пул" meta="queue replenishment" />
            <Step done={task.status === "in_progress" || task.status === "done"} label={task.assignee ? `Назначена: ${task.assignee}` : "Ожидает назначения"} meta={task.assignee ?? "—"} />
            <Step done={task.status === "done"} label="Выполнена и подтверждена" meta={task.status === "done" ? "photo-after принята" : "—"} last />
          </ol>
        </div>

        {/* note */}
        <div className="px-4 py-3.5">
          <span className="eyebrow">Комментарий мерчандайзера</span>
          <textarea
            rows={3}
            defaultValue="Товар перемещён из запаса секции A. Прошу пересчитать остаток в WMS."
            className="mt-1.5 w-full border border-line bg-paper-raised p-2.5 text-small text-ink placeholder:text-ink-faint focus:border-slate focus:outline-none"
          />
        </div>
      </div>

      <footer className="space-y-2 border-t border-line bg-paper-sunk p-3">
        {verifying && (
          <div className="flex items-center gap-2.5 border border-slate bg-paper-raised px-2.5 py-2">
            <span className="relative h-[2px] w-28 overflow-hidden bg-line">
              <motion.span
                className="absolute inset-y-0 w-1/3 bg-slate"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1, ease: EASE, repeat: Infinity }}
              />
            </span>
            <span className="font-mono text-micro uppercase tracking-[0.1em] text-ink">
              Повторный анализ изображения…
            </span>
          </div>
        )}
        <div className="flex gap-2">
          {task.status === "new" && (
            <Button className="flex-1 justify-center">Назначить исполнителя</Button>
          )}
          {task.status !== "done" && (
            <>
              <Button
                variant="primary"
                className="flex-1 justify-center"
                disabled={!after || verifying}
                onClick={() => {
                  onVerify();
                  window.setTimeout(() => onStatus("done"), 2200);
                }}
              >
                <IconCheck size={15} />
                Подтвердить выполнение
              </Button>
              <Button onClick={onVerify} disabled={!after || verifying}>
                Проверить CV
              </Button>
            </>
          )}
          {task.status === "done" && (
            <div className="flex flex-1 items-center justify-center gap-2 border border-forest-line bg-forest-soft py-2 font-mono text-micro uppercase tracking-[0.1em] text-forest">
              <IconCheck size={14} />
              Задача закрыта
            </div>
          )}
        </div>
        {!after && task.status !== "done" && (
          <p className="text-center font-mono text-micro text-ink-faint">
            Для подтверждения требуется фото «После»
          </p>
        )}
      </footer>
    </>
  );
}

function Step({
  done,
  label,
  meta,
  last = false,
}: {
  done: boolean;
  label: string;
  meta: string;
  last?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex flex-col items-center">
        <span
          className={cn(
            "mt-1 h-2.5 w-2.5 shrink-0 border",
            done ? "border-forest bg-forest" : "border-line-strong bg-paper",
          )}
        />
        {!last && <span className="h-full w-px flex-1 bg-line" />}
      </span>
      <span className={cn("pb-3", last && "pb-0")}>
        <span
          className={cn(
            "block text-micro2 leading-tight",
            done ? "text-ink" : "text-ink-faint",
          )}
        >
          {label}
        </span>
        <span className="tabular mt-0.5 block font-mono text-micro text-ink-faint">{meta}</span>
      </span>
    </li>
  );
}

function PhotoPlate({
  title,
  caption,
  detection,
  muted = false,
  after = false,
  onUpload,
}: {
  title: string;
  caption: string;
  detection: (typeof DETECTIONS)[number] | null;
  muted?: boolean;
  after?: boolean;
  onUpload?: () => void;
}) {
  return (
    <div className="relative bg-paper">
      <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
        <span className="font-mono text-micro uppercase tracking-[0.12em] text-ink">{title}</span>
        <span className="tabular font-mono text-[0.5625rem] text-ink-faint">{caption}</span>
      </div>
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden",
          after ? "bg-paper-sunk" : "grid-fine",
        )}
      >
        {after ? (
          <button
            type="button"
            onClick={onUpload}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-faint transition-colors hover:bg-paper-sunk"
          >
            <IconUpload size={22} />
            <span className="font-mono text-micro uppercase tracking-[0.12em]">
              Загрузить фото «После»
            </span>
            <span className="font-mono text-[0.5625rem] text-ink-faint">
              jpg · до 8 МБ · с геометкой
            </span>
          </button>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg,#DEDAD2 0%,#CFCAC1 45%,#B9B4AA 100%)",
              }}
            />
            {/* pseudo product blocks */}
            <div className="absolute inset-x-2 bottom-3 top-6 flex items-end gap-[3px]">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 border border-black/15",
                    i === 11 && "hatch-brick border-brick-line",
                  )}
                  style={{
                    height: `${38 + ((i * 37) % 42)}%`,
                    background: ["#2C3E50", "#8B8880", "#B34747", "#2A6F5C", "#C4A574"][i % 5],
                    opacity: muted ? 0.75 : 0.9,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-x-2 bottom-1.5 h-2 bg-[#B7B2A8]" />
            {detection && (
              <span
                className="absolute border-2 border-brick"
                style={{
                  left: "12%",
                  top: "22%",
                  width: "26%",
                  height: "58%",
                }}
              />
            )}
            <span className="absolute left-2 top-2 flex items-center gap-1.5 bg-paper-raised/90 px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-brick">
              <IconCamera size={11} />
              разметка нейросети
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16">
      <IconInbox size={24} className="text-ink-faint" />
      <p className="text-small text-ink-muted">Задачи по заданным фильтрам отсутствуют.</p>
      <Button size="sm" onClick={onReset}>
        Сбросить фильтры
      </Button>
      <p className="font-mono text-micro text-ink-faint">
        Очередь replenishment пуста · WMS-XML 2.4
      </p>
    </div>
  );
}