"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { DEVICES, KPIS, STORES, TASK_FLOW, TASKS } from "@/lib/data";
import { TASK_STATUS_LABEL, TASK_TYPE_LABEL } from "@/lib/data";
import type { TaskStatus } from "@/lib/types";
import { Reveal } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { CropMarksOverlay, SectionTitle } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Controls";
import { StatusDot, TASK_TYPE_TONE, Tag } from "@/components/ui/Tag";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { FlowChart } from "@/components/analytics/Charts";
import {
  IconAlert,
  IconArrowRight,
  IconCamera,
  IconChevronRight,
  IconClock,
  IconRobot,
  IconStore,
  IconTerminal,
} from "@/components/ui/icons";

const DEVICE_ICON = { camera: IconCamera, robot: IconRobot, handheld: IconTerminal } as const;

export function OverviewPage() {
  const pending = TASKS.filter((t) => t.status === "new");
  const online = DEVICES.filter((d) => d.status === "online").length;

  return (
    <div className="flex flex-col gap-5">
      {/* ============ masthead card ============ */}
      <Reveal>
        <div className="relative border border-line bg-paper-raised">
          <CropMarksOverlay inset={-1} />
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b border-line p-5 lg:col-span-7 lg:border-b-0 lg:border-r">
              <span className="eyebrow text-brass-deep">Смена · утро</span>
              <h2 className="mt-2 font-display text-h2 leading-[1.06]">
                Сеть под контролем.
                <br />
                <em className="font-normal italic text-forest">Что делать дальше</em> — по полкам.
              </h2>
              <p className="mt-3 max-w-xl text-small text-ink-muted">
                412 стеллажей обходят камеры и роботы. За последние 4 часа
                получено 4 820 кадров, поставлено 1 216 задач на выкладку.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" size="lg" className="justify-center">
                  <Link href="/shelf">Открыть анализ полки</Link>
                </Button>
                <Button size="lg" className="justify-center">
                  <Link href="/tasks">Очередь задач</Link>
                  <span className="tabular opacity-60">({TASKS.length})</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:col-span-5">
              {KPIS.map((k, i) => (
                <div
                  key={k.id}
                  className={cn(
                    "p-4",
                    i % 2 === 0 && "border-r border-line",
                    i < 2 && "border-b border-line",
                  )}
                >
                  <div className="eyebrow">{k.label}</div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="tabular font-display text-h2 leading-none">{k.value}</span>
                    <span className="font-mono text-micro2 text-ink-muted">{k.unit}</span>
                  </div>
                  <div
                    className={cn(
                      "mt-2 font-mono text-micro",
                      k.delta >= 0 ? "text-forest" : "text-brick",
                    )}
                  >
                    {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta).toFixed(1)}% {k.note.toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ============ stores ============ */}
      <Reveal delay={0.05}>
        <div className="border border-line bg-paper-raised">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <span className="eyebrow text-brass-deep">01</span>
              <h2 className="mt-1 font-display text-h4 leading-none">Объекты</h2>
            </div>
            <span className="flex items-center gap-2 font-mono text-micro text-ink-muted">
              <StatusDot tone={online === DEVICES.length ? "ok" : "warn"} pulse />
              Устройств в сети {online}/{DEVICES.length}
            </span>
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th className="w-[110px]">ID</Th>
                <Th>Объект</Th>
                <Th align="right" className="w-[80px]">Полок</Th>
                <Th className="w-[180px]">OSA</Th>
                <Th align="right" className="w-[90px]">Устройств</Th>
                <Th className="w-[130px]">Сканирование</Th>
                <Th className="w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {STORES.map((s) => (
                <Tr key={s.id}>
                  <Td className="tabular font-mono text-micro2 text-ink-muted">{s.id}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <IconStore size={14} className="shrink-0 text-ink-faint" />
                      <span>
                        <span className="block">{s.name}</span>
                        <span className="block text-micro text-ink-faint">
                          {s.city} · {s.format}
                        </span>
                      </span>
                    </span>
                  </Td>
                  <Td align="right" className="tabular font-mono text-micro2">
                    {s.shelves}
                  </Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <span className="tabular w-12 shrink-0 font-mono text-micro2">{s.osa}%</span>
                      <Meter
                        value={s.osa}
                        tone={s.osa < 85 ? "brick" : s.osa < 92 ? "brass" : "forest"}
                        className="flex-1"
                      />
                    </span>
                  </Td>
                  <Td align="right" className="tabular font-mono text-micro2">
                    {s.devices}
                  </Td>
                  <Td className="tabular font-mono text-micro2 text-ink-muted">{s.lastScan}</Td>
                  <Td>
                    <IconChevronRight size={15} className="text-ink-faint" />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      </Reveal>

      {/* ============ queue + funnel ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Reveal delay={0.08} className="xl:col-span-7">
          <div className="relative h-full border border-line bg-paper-raised">
            <CropMarksOverlay inset={-1} />
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <span className="eyebrow text-brass-deep">02</span>
                <h2 className="mt-1 font-display text-h4 leading-none">Ожидают назначения</h2>
              </div>
              <Link
                href="/tasks"
                className="group flex items-center gap-1.5 font-mono text-micro uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink"
              >
                Все задачи
                <IconArrowRight
                  size={13}
                  className="transition-transform duration-200 ease-precise group-hover:translate-x-0.5"
                />
              </Link>
            </div>
            <div>
              {pending.slice(0, 6).map((t) => (
                <Link
                  key={t.id}
                  href="/tasks"
                  className="flex items-start gap-3 border-b border-line-faint px-4 py-2.5 transition-colors duration-200 ease-precise hover:bg-paper-sunk"
                >
                  <span
                    className="mt-1 h-8 w-[2px] shrink-0"
                    style={{
                      background:
                        t.severity === "critical" ? "#B34747" : t.severity === "major" ? "#7E6640" : "#6B6B66",
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <Tag tone={TASK_TYPE_TONE[t.type]}>{TASK_TYPE_LABEL[t.type]}</Tag>
                      <span className="tabular font-mono text-micro text-ink-faint">{t.id}</span>
                    </span>
                    <span className="mt-1 block truncate font-display text-small">{t.title}</span>
                    <span className="tabular mt-0.5 block font-mono text-micro text-ink-muted">
                      {t.store} · ряд {t.aisle} · {t.bay}
                      {t.level} · SKU {t.sku}
                    </span>
                  </span>
                  <span className="tabular flex shrink-0 items-center gap-1.5 font-mono text-micro text-brick">
                    <IconClock size={12} />
                    {new Date(t.deadline).toISOString().slice(11, 16)}
                  </span>
                </Link>
              ))}
              {pending.length === 0 && (
                <p className="px-4 py-10 text-center font-mono text-micro2 text-ink-faint">
                  Очередь пуста
                </p>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="xl:col-span-5">
          <div className="flex h-full flex-col gap-4">
            <div className="border border-line bg-paper-raised p-4">
              <SectionTitle index="03" title="Воронка сигнала" note="за смену" className="pb-3" />
              <FlowChart stages={TASK_FLOW} />
            </div>

            <div className="border border-line bg-paper-raised p-4">
              <SectionTitle index="04" title="Оборудование" note="инциденты" className="pb-3" />
              <div className="space-y-0">
                {DEVICES.filter((d) => d.status !== "online").map((d) => {
                  const Icon = DEVICE_ICON[d.kind];
                  return (
                    <div
                      key={d.id}
                      className="flex items-start gap-3 border-b border-line-faint py-2.5 last:border-b-0"
                    >
                      <Icon
                        size={16}
                        className={cn("mt-0.5", d.status === "offline" ? "text-brick" : "text-brass-deep")}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-small">{d.name}</div>
                        <div className="tabular font-mono text-micro text-ink-faint">
                          {d.id} · {d.zone} · последний скан {d.lastScan}
                        </div>
                      </div>
                      <Tag tone={d.status === "offline" ? "brick" : "brass"}>
                        {d.status === "offline" ? "оффлайн" : "деградация"}
                      </Tag>
                    </div>
                  );
                })}
                <p className="flex items-start gap-2 pt-2.5 text-micro leading-relaxed text-ink-muted">
                  <IconAlert size={14} className="mt-0.5 shrink-0 text-brass-deep" />
                  CAM-B07-01 не отвечает с 07:58. Проход 7 частично не контролируется —
                  задачи по нему помечены как «без подтверждения».
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============ status legend ============ */}
      <Reveal delay={0.16}>
        <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
          {(["new", "assigned", "in_progress", "done"] as TaskStatus[]).map((s) => (
            <div key={s} className="bg-paper px-3 py-2.5">
              <Tag tone="neutral" dot>
                {TASK_STATUS_LABEL[s]}
              </Tag>
              <div className="tabular mt-2 font-display text-h3 leading-none">
                {TASKS.filter((t) => t.status === s).length}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}