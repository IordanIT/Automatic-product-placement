"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import {
  HEATMAP,
  KPIS,
  OOS_SERIES,
  OSA_TREND,
  STORES,
  TASK_FLOW,
  TOP_PROBLEM_SKUS,
} from "@/lib/data";
import { Reveal } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { CropMarksOverlay, SectionTitle } from "@/components/ui/Card";
import { Segmented, Select } from "@/components/ui/Controls";
import { StatusDot, Tag } from "@/components/ui/Tag";
import { TableWrap, Td, Th, Tr } from "@/components/ui/Table";
import { AreaChart, FlowChart, StoreHeatmap, TrendChart } from "./Charts";
import { IconAlert, IconArrowUpRight, IconDownload, IconStore } from "@/components/ui/icons";

export function AnalyticsPage() {
  const [range, setRange] = React.useState<"7" | "14" | "30">("14");
  const [store, setStore] = React.useState("msk-014");
  const [metric, setMetric] = React.useState<"oos" | "osa">("oos");

  const series = React.useMemo(
    () => [
      { label: "Напитки", values: [42, 38, 51, 47, 44, 49, 46] },
      { label: "Пиво", values: [28, 31, 26, 29, 33, 30, 27] },
      { label: "Снеки", values: [64, 71, 68, 74, 69, 66, 62] },
      { label: "Какао", values: [19, 22, 21, 24, 20, 18, 17] },
      { label: "Сладкое", values: [35, 33, 38, 36, 40, 37, 34] },
      { label: "Молочное", values: [23, 21, 25, 22, 24, 26, 23] },
      { label: "Энергетики", values: [47, 52, 49, 55, 51, 48, 45] },
    ],
    [],
  );

  const prevSeries = React.useMemo(
    () => [
      { label: "Напитки", values: [55, 58, 61, 57, 59, 62, 60] },
      { label: "Пиво", values: [34, 36, 33, 38, 37, 35, 36] },
      { label: "Снеки", values: [82, 88, 91, 86, 89, 84, 83] },
      { label: "Какао", values: [26, 28, 27, 30, 29, 31, 28] },
      { label: "Сладкое", values: [44, 47, 49, 45, 48, 50, 46] },
      { label: "Молочное", values: [30, 33, 31, 34, 32, 35, 33] },
      { label: "Энергетики", values: [60, 66, 63, 68, 65, 62, 61] },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ============ controls ============ */}
      <div className="flex flex-wrap items-end justify-between gap-3 border border-line bg-paper-raised px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={store}
            onChange={setStore}
            className="w-[260px]"
            label={STORES.find((s) => s.id === store)?.name}
            options={STORES.map((s) => ({ value: s.id, label: s.name, hint: s.id }))}
          />
          <Segmented
            value={range}
            onChange={setRange}
            options={[
              { value: "7", label: "7 дней" },
              { value: "14", label: "14 дней" },
              { value: "30", label: "30 дней" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="eyebrow hidden sm:inline">Обновлено 09:45</span>
          <Button size="sm" onClick={() => setRange("14")}>
            <IconDownload size={14} />
            Выгрузка
          </Button>
        </div>
      </div>

      {/* ============ KPI ============ */}
      <RevealGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k, i) => (
            <Reveal key={k.id} delay={i * 0.06}>
              <div className="relative h-full border border-line bg-paper-raised p-4">
                <CropMarksOverlay inset={-1} />
                <div className="eyebrow">{k.label}</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="tabular font-display text-display leading-none tracking-tight">
                    {k.value}
                  </span>
                  <span className="font-mono text-small text-ink-muted">{k.unit}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 border px-1.5 py-0.5 font-mono text-micro",
                      k.delta >= 0
                        ? "border-forest-line bg-forest-soft text-forest"
                        : "border-brick-line bg-brick-soft text-brick",
                    )}
                  >
                    <IconArrowUpRight
                      size={11}
                      className={cn(!k.delta && "hidden", k.delta < 0 && "rotate-90")}
                    />
                    {k.delta >= 0 ? "+" : ""}
                    {k.delta.toFixed(1)}%
                  </span>
                  <span className="font-mono text-micro text-ink-faint">{k.note}</span>
                </div>
                {k.target && (
                  <div className="mt-3 border-t border-line-faint pt-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="eyebrow">План</span>
                      <span className="tabular font-mono text-micro2 text-ink">
                        {k.target}
                        {k.unit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-[3px] w-full border border-line bg-paper-sunk">
                      <div
                        className={cn(
                          "h-full",
                          k.id === "osa" || k.id === "ttr" ? "bg-forest" : "bg-slate",
                        )}
                        style={{
                          width: `${
                            k.id === "ttr"
                              ? Math.min(100, (parseFloat(k.value) / k.target) * 100)
                              : Math.min(100, (parseFloat(k.value) / k.target) * 100)
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </RevealGroup>

      {/* ============ charts row ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="relative h-full border border-line bg-paper-raised p-4">
            <CropMarksOverlay inset={-1} />
            <SectionTitle
              index="01"
              title="Динамика OOS по категориям"
              note="ед. в день"
              action={
                <Segmented
                  size="sm"
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: "oos", label: "OOS" },
                    { value: "osa", label: "OSA" },
                  ]}
                />
              }
            />
            <div className="mt-4">
              <AreaChart
                series={metric === "oos" ? [series[0]!, ...series.slice(1)] : series}
                height={268}
                unit="%"
              />
            </div>
            <p className="mt-3 border-t border-line-faint pt-2.5 text-micro text-ink-faint">
              Расчёт по кадрам камер с периодом 15 минут. Значения за вычетом
              подтверждённых задач репленishment.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-5">
          <div className="border border-line bg-paper-raised p-4">
            <SectionTitle index="02" title="Уровень сервиса полки" note="14 дней" className="pb-3" />
            <TrendChart points={OSA_TREND} target={94} />
          </div>

          <div className="border border-line bg-paper-raised p-4">
            <SectionTitle index="03" title="Воронка сигнала" note="от CV к закрытию" className="pb-3" />
            <FlowChart stages={TASK_FLOW} />
          </div>
        </div>
      </div>

      {/* ============ heatmap + top sku ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <div className="relative border border-line bg-paper-raised p-4">
            <CropMarksOverlay inset={-1} />
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="eyebrow text-brass-deep">04</span>
                  <span className="eyebrow">Тепловая карта</span>
                </div>
                <h2 className="mt-1 font-display text-h4 leading-none">Зоны с наибольшим расхождением</h2>
              </div>
              <span className="flex min-w-0 items-center gap-2 border border-line px-2 py-1">
                <IconStore size={14} className="shrink-0 text-ink-muted" />
                <span className="truncate font-mono text-micro2 text-ink">
                  {STORES.find((s) => s.id === store)?.name}
                </span>
              </span>
            </div>
            <StoreHeatmap data={HEATMAP} />
          </div>
        </div>

        <div className="xl:col-span-5">
          <div className="border border-line bg-paper-raised">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <span className="eyebrow text-brass-deep">05</span>
                <h2 className="mt-1 font-display text-h4 leading-none">Топ проблемных SKU</h2>
              </div>
              <Button size="sm" variant="ghost">
                <IconDownload size={13} />
                CSV
              </Button>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>SKU</Th>
                  <Th align="right">OOS</Th>
                  <Th align="right">Выкладка</Th>
                  <Th align="right">Всего</Th>
                  <Th align="right">OSA</Th>
                </tr>
              </thead>
              <tbody>
                {TOP_PROBLEM_SKUS.map((s) => (
                  <Tr key={s.sku}>
                    <Td>
                      <span className="block truncate">{s.name}</span>
                      <span className="tabular block font-mono text-micro text-ink-faint">
                        {s.sku}
                      </span>
                    </Td>
                    <Td align="right" className="tabular font-mono text-micro2 text-brick">
                      {s.oos}
                    </Td>
                    <Td align="right" className="tabular font-mono text-micro2 text-ink-muted">
                      {s.misplaced}
                    </Td>
                    <Td align="right" className="tabular font-mono text-micro2">
                      {s.total}
                    </Td>
                    <Td align="right">
                      <span className="flex items-center justify-end gap-2">
                        <span className="tabular font-mono text-micro2">{s.osa}%</span>
                        <span
                          className={cn(
                            "font-mono text-micro",
                            s.delta < 0 ? "text-brick" : "text-forest",
                          )}
                        >
                          {s.delta > 0 ? "+" : ""}
                          {s.delta}
                        </span>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="flex items-start gap-2 border-t border-line bg-paper px-3 py-2.5">
              <IconAlert size={14} className="mt-0.5 shrink-0 text-brass-deep" />
              <p className="text-micro leading-relaxed text-ink-muted">
                SKU 44502 и 45118 дают 31% всех сигналов OOS в сети. Рекомендация:
                пересмотреть параметры пополнения в PL-2024-121 и перевести их в
                режим автоматического репленishment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============ store table ============ */}
      <div className="border border-line bg-paper-raised">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <span className="eyebrow text-brass-deep">06</span>
            <h2 className="mt-1 font-display text-h4 leading-none">Срез по объектам</h2>
          </div>
          <div className="flex items-center gap-2">
            <Tag tone="neutral" dot>
              {STORES.length} объектов
            </Tag>
            <span className="flex items-center gap-2 font-mono text-micro text-ink-muted">
              <StatusDot tone="ok" pulse />
              телеметрия в норме
            </span>
          </div>
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th className="w-[110px]">ID</Th>
              <Th>Объект</Th>
              <Th className="w-[150px]">Формат</Th>
              <Th align="right" className="w-[80px]">Полок</Th>
              <Th align="right" className="w-[100px]">Устройств</Th>
              <Th align="right" className="w-[90px]">OSA</Th>
              <Th className="w-[130px]">Последнее сканирование</Th>
              <Th className="w-[90px]">Состояние</Th>
            </tr>
          </thead>
          <tbody>
            {STORES.map((s) => (
              <Tr key={s.id}>
                <Td className="tabular font-mono text-micro2 text-ink-muted">{s.id}</Td>
                <Td>
                  <span className="block">{s.name}</span>
                  <span className="block text-micro text-ink-faint">{s.city}</span>
                </Td>
                <Td className="text-micro2 text-ink-muted">{s.format}</Td>
                <Td align="right" className="tabular font-mono text-micro2">
                  {s.shelves}
                </Td>
                <Td align="right" className="tabular font-mono text-micro2">
                  {s.devices}
                </Td>
                <Td align="right">
                  <span className="flex items-center justify-end gap-2">
                    <span
                      className={cn(
                        "tabular font-mono text-micro2",
                        s.osa < 85 ? "text-brick" : s.osa < 92 ? "text-brass-deep" : "text-forest",
                      )}
                    >
                      {s.osa.toFixed(1)}%
                    </span>
                    <span className="inline-block h-[3px] w-12 border border-line">
                      <span
                        className={cn(
                          "block h-full",
                          s.osa < 85 ? "bg-brick" : s.osa < 92 ? "bg-brass" : "bg-forest",
                        )}
                        style={{ width: `${s.osa}%` }}
                      />
                    </span>
                  </span>
                </Td>
                <Td className="tabular font-mono text-micro2 text-ink-muted">{s.lastScan}</Td>
                <Td>
                  <span className="flex items-center gap-2 font-mono text-micro text-forest">
                    <StatusDot tone={s.osa < 85 ? "warn" : "ok"} />
                    {s.osa < 85 ? "внимание" : "норма"}
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      {/* category breakdown */}
      <div className="border border-line bg-paper-raised p-4">
        <SectionTitle index="07" title="Категории: расчётный OOS и полнота полки" note="текущий месяц" className="pb-3" />
        <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
          {OOS_SERIES.map((c) => {
            const delta = ((c.current - c.previous) / c.previous) * 100;
            return (
              <div key={c.label} className="border-b border-line-faint py-2.5 last:border-b-0 md:border-b-0">
                <div className="eyebrow">{c.label}</div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="tabular font-mono text-h4">{c.current}</span>
                  <span
                    className={cn(
                      "font-mono text-micro",
                      delta < 0 ? "text-forest" : "text-brick",
                    )}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 h-[3px] w-full border border-line bg-paper-sunk">
                  <div
                    className="h-full bg-brick"
                    style={{ width: `${Math.min(100, (c.current / 90) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RevealGroup({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>;
}