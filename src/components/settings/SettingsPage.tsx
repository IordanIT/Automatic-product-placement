"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DEVICES, STORES } from "@/lib/data";
import type { Device } from "@/lib/types";
import { EASE } from "@/components/ui/Motion";
import { Button } from "@/components/ui/Button";
import { CropMarksOverlay, SectionTitle } from "@/components/ui/Card";
import { Field, Input, Slider, Toggle } from "@/components/ui/Controls";
import { StatusDot, Tag } from "@/components/ui/Tag";
import { KeyValue, TableWrap, Tabs, Td, Th, Tr } from "@/components/ui/Table";
import {
  IconAlert,
  IconCamera,
  IconCheck,
  IconCopy,
  IconKey,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconTrash,
  IconUser,
} from "@/components/ui/icons";

type Tab = "stores" | "hardware" | "integrations" | "users";

const DEVICE_ICON = { camera: IconCamera, robot: IconRobot, handheld: IconTerminalIcon } as const;
function IconTerminalIcon(p: { size?: number; className?: string }) {
  return (
    <svg
      width={p.size ?? 18}
      height={p.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      className={p.className}
      aria-hidden
    >
      <path d="M3 4h18v16H3zM6.5 9l3 3-3 3M12 15h5.5" />
    </svg>
  );
}

interface Notify {
  critical: boolean;
  major: boolean;
  minor: boolean;
  digest: boolean;
}

interface User {
  id: string;
  name: string;
  role: string;
  store: string;
  last: string;
  active: boolean;
}

const USERS: User[] = [
  { id: "0442", name: "И. Полозова", role: "Мерчандайзер", store: "Гипермаркет «Океан»", last: "09:44", active: true },
  { id: "0398", name: "М. Гаврилов", role: "Мерчандайзер", store: "Гипермаркет «Океан»", last: "09:41", active: true },
  { id: "0511", name: "А. Северов", role: "Управляющий", store: "Сеть · 6 объектов", last: "09:38", active: true },
  { id: "0277", name: "Р. Тимурзе", role: "Мерчандайзер", store: "Гипермаркет «Ладога»", last: "08:55", active: false },
  { id: "0630", name: "Ю. Ким", role: "Аналитик", store: "Сеть · 6 объектов", last: "вчера 18:02", active: true },
  { id: "0184", name: "О. Дроздова", role: "Товарищество", store: "Сеть · 6 объектов", last: "16.09 21:14", active: true },
];

const INTEGRATIONS = [
  { id: "wms", name: "WMS · 1С:Управление торговлей", proto: "WMS-XML 2.4", status: true, key: "live_9f2c41ab77e04d13", synced: "2 мин назад" },
  { id: "erp", name: "ERP · SAP S/4HANA", proto: "IDoc · OData v4", status: true, key: "live_4b81de60aa9347c2", synced: "11 мин назад" },
  { id: "pos", name: "Кассовая система · ATOL", proto: "Реестр продаж, CSV", status: false, key: "test_a41d09fe23b8c7d5", synced: "нет данных" },
  { id: "promo", name: "Промо-модуль · TradeMarketing", proto: "REST / JSON", status: true, key: "live_77c05be1d2a94f66", synced: "37 мин назад" },
  { id: "scales", name: "Весы · Mettler Toledo", proto: "TCP / SICS", status: false, key: "—", synced: "нет данных" },
];

export function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>("stores");
  const [devices, setDevices] = React.useState(DEVICES);
  const [threshold, setThreshold] = React.useState(82);
  const [interval, setInterval] = React.useState(15);
  const [notify, setNotify] = React.useState({ critical: true, major: true, minor: false, digest: true });
  const [scanOnOpen, setScanOnOpen] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "stores", label: "Магазины", count: STORES.length },
          { value: "hardware", label: "Оборудование", count: devices.length },
          { value: "integrations", label: "Интеграции", count: INTEGRATIONS.length },
          { value: "users", label: "Пользователи", count: USERS.length },
        ]}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: EASE }}
        >
          {tab === "stores" && <StoresTab />}
          {tab === "hardware" && (
            <HardwareTab
              devices={devices}
              setDevices={setDevices}
              threshold={threshold}
              setThreshold={setThreshold}
              interval={interval}
              setInterval={setInterval}
              notify={notify}
              setNotify={setNotify}
              scanOnOpen={scanOnOpen}
              setScanOnOpen={setScanOnOpen}
              flash={flash}
            />
          )}
          {tab === "integrations" && <IntegrationsTab flash={flash} />}
          {tab === "users" && <UsersTab flash={flash} />}
        </motion.div>
      </AnimatePresence>

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

/* ------------------------------------------------------------------ */

function StoresTab() {
  return (
    <div className="border border-line bg-paper-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <span className="eyebrow text-brass-deep">01</span>
          <h2 className="mt-1 font-display text-h4 leading-none">Объекты сети</h2>
        </div>
        <Button variant="primary" size="sm">
          <IconPlus size={14} />
          Добавить магазин
        </Button>
      </div>
      <TableWrap>
        <thead>
          <tr>
            <Th className="w-[110px]">ID</Th>
            <Th>Наименование</Th>
            <Th className="w-[130px]">Город</Th>
            <Th className="w-[150px]">Формат</Th>
            <Th align="right" className="w-[80px]">Полок</Th>
            <Th align="right" className="w-[100px]">Устройств</Th>
            <Th align="right" className="w-[80px]">OSA</Th>
            <Th className="w-[120px]">Состояние</Th>
            <Th className="w-[80px]" />
          </tr>
        </thead>
        <tbody>
          {STORES.map((s) => (
            <Tr key={s.id}>
              <Td className="tabular font-mono text-micro2 text-ink-muted">{s.id}</Td>
              <Td className="text-ink">{s.name}</Td>
              <Td className="text-micro2 text-ink-muted">{s.city}</Td>
              <Td className="text-micro2 text-ink-muted">{s.format}</Td>
              <Td align="right" className="tabular font-mono text-micro2">
                {s.shelves}
              </Td>
              <Td align="right" className="tabular font-mono text-micro2">
                {s.devices}
              </Td>
              <Td align="right" className="tabular font-mono text-micro2">
                {s.osa}%
              </Td>
              <Td>
                <span className="flex items-center gap-2 font-mono text-micro text-forest">
                  <StatusDot tone="ok" />
                  активен
                </span>
              </Td>
              <Td>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="border border-line p-1 text-ink-muted transition-colors hover:border-brass hover:text-ink"
                    aria-label="Настроить"
                  >
                    <IconKey size={13} />
                  </button>
                  <button
                    type="button"
                    className="border border-line p-1 text-ink-muted transition-colors hover:border-brick hover:text-brick"
                    aria-label="Удалить"
                  >
                    <IconTrash size={13} />
                  </button>
                </span>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function HardwareTab({
  devices,
  setDevices,
  threshold,
  setThreshold,
  interval,
  setInterval,
  notify,
  setNotify,
  scanOnOpen,
  setScanOnOpen,
  flash,
}: {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  threshold: number;
  setThreshold: (v: number) => void;
  interval: number;
  setInterval: (v: number) => void;
  notify: Notify;
  setNotify: React.Dispatch<React.SetStateAction<Notify>>;
  scanOnOpen: boolean;
  setScanOnOpen: (v: boolean) => void;
  flash: (m: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <div className="border border-line bg-paper-raised">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <span className="eyebrow text-brass-deep">02</span>
              <h2 className="mt-1 font-display text-h4 leading-none">Камеры и роботы</h2>
            </div>
            <Button size="sm" onClick={() => flash("Сканирование сети…")}>
              <IconRefresh size={14} />
              Проверить соединения
            </Button>
          </div>
          <TableWrap>
            <thead>
              <tr>
                <Th>Устройство</Th>
                <Th className="w-[150px]">Зона</Th>
                <Th className="w-[100px]">Статус</Th>
                <Th align="right" className="w-[100px]">Последний скан</Th>
                <Th align="right" className="w-[80px]">Uptime</Th>
                <Th className="w-[70px]" />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => {
                const Icon = DEVICE_ICON[d.kind];
                return (
                  <Tr key={d.id}>
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={cn(
                            "shrink-0",
                            d.status === "online"
                              ? "text-forest"
                              : d.status === "degraded"
                                ? "text-brass-deep"
                                : "text-brick",
                          )}
                        />
                        <span>
                          <span className="block">{d.name}</span>
                          <span className="tabular block font-mono text-micro text-ink-faint">
                            {d.id} · {d.fps} fps
                          </span>
                        </span>
                      </span>
                    </Td>
                    <Td className="text-micro2 text-ink-muted">{d.zone}</Td>
                    <Td>
                      <span
                        className={cn(
                          "flex items-center gap-2 font-mono text-micro",
                          d.status === "online"
                            ? "text-forest"
                            : d.status === "degraded"
                              ? "text-brass-deep"
                              : "text-brick",
                        )}
                      >
                        <StatusDot tone={d.status === "online" ? "ok" : d.status === "degraded" ? "warn" : "off"} />
                        {d.status === "online" ? "онлайн" : d.status === "degraded" ? "деградация" : "оффлайн"}
                      </span>
                    </Td>
                    <Td align="right" className="tabular font-mono text-micro2 text-ink-muted">
                      {d.lastScan}
                    </Td>
                    <Td align="right" className="tabular font-mono text-micro2">
                      {d.uptime}%
                    </Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() =>
                          setDevices((prev) =>
                            prev.map((x) =>
                              x.id === d.id
                                ? {
                                    ...x,
                                    status: x.status === "online" ? "offline" : "online",
                                  }
                                : x,
                            ),
                          )
                        }
                        className="font-mono text-micro uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
                      >
                        {d.status === "online" ? "Отключить" : "Включить"}
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableWrap>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:col-span-5">
        <div className="relative border border-line bg-paper-raised p-4">
          <CropMarksOverlay inset={-1} />
          <SectionTitle index="03" title="Параметры инференса" className="border-b-0 pb-2" />

          <div className="mt-4 space-y-4">
            <Field
              label={`Порог уверенности модели — ${threshold}%`}
              hint={`Детекции ниже порога не попадают в задачи. Текущий порог модели: ${threshold / 100}`}
            >
              <div className="flex items-center gap-3">
                <Slider value={threshold} onChange={setThreshold} min={50} max={99} />
                <span className="tabular w-11 shrink-0 border border-line px-1 text-center font-mono text-micro2">
                  {threshold}%
                </span>
              </div>
            </Field>

            <Field
              label={`Частота сканирования — ${interval} мин`}
              hint="Период съёмки сектора. Для пиковых часов рекомендуется 5–10 мин."
            >
              <div className="flex items-center gap-3">
                <Slider value={interval} onChange={setInterval} min={5} max={60} step={5} />
                <span className="tabular w-11 shrink-0 border border-line px-1 text-center font-mono text-micro2">
                  {interval}
                </span>
              </div>
            </Field>

            <div className="border-t border-line-faint pt-3">
              <Toggle
                checked={scanOnOpen}
                onChange={setScanOnOpen}
                label="Сканировать сектор при открытии терминала"
              />
            </div>

            <div className="space-y-2 border-t border-line-faint pt-3">
              <span className="eyebrow block">Уведомления</span>
              {(
                [
                  ["critical", "Критический приоритет — пуш и звонок"],
                  ["major", "Высокий приоритет — пуш"],
                  ["minor", "Средний приоритет — дайджест"],
                  ["digest", "Ежедневная сводка по объекту в 08:00"],
                ] as const
              ).map(([k, label]) => (
                <Toggle
                  key={k}
                  checked={!!notify[k]}
                  onChange={(v) => setNotify((p) => ({ ...p, [k]: v }))}
                  label={label}
                />
              ))}
            </div>
          </div>

          <Button variant="primary" className="mt-5 w-full justify-center" onClick={() => flash("Настройки сохранены")}>
            Сохранить параметры
          </Button>
        </div>

        <div className="border border-line bg-paper-raised p-4">
          <SectionTitle index="04" title="Модель" className="border-b-0 pb-2" />
          <div className="mt-2">
            <KeyValue k="Архитектура" v="detr-r50 · 2 class" mono={false} />
            <KeyValue k="Версия весов" v="shelf-cv 2024.08" />
            <KeyValue k="Класс «товар»" v="0.987" />
            <KeyValue k="Класс «пусто»" v="0.994" />
            <KeyValue k="Класс «лицевая сторона»" v="0.961" />
            <KeyValue k="GPU" v="A10 · 24 ГБ" />
            <KeyValue k="Инференс, мс" v="38" />
          </div>
          <p className="mt-3 flex items-start gap-2 border-t border-line-faint pt-2.5 text-micro leading-relaxed text-ink-muted">
            <IconAlert size={13} className="mt-0.5 shrink-0 text-brass-deep" />
            Модель переобучается на разметке подтверждённых задач. Следующее
            плановое обучение — 24.09.2024.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function IntegrationsTab({ flash }: { flash: (m: string) => void }) {
  const [keys, setKeys] = React.useState<Record<string, string>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.key])),
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="space-y-4">
          {INTEGRATIONS.map((i) => (
            <div key={i.id} className="relative border border-line bg-paper-raised p-4">
              <CropMarksOverlay inset={-1} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 border"
                    style={{
                      borderColor: i.status ? "#2A6F5C" : "#B34747",
                      background: i.status ? "#2A6F5C" : "transparent",
                    }}
                  />
                  <div>
                    <div className="font-display text-lead leading-tight">{i.name}</div>
                    <div className="tabular mt-1 font-mono text-micro text-ink-faint">
                      {i.proto} · синхронизация {i.synced}
                    </div>
                  </div>
                </div>
                <Tag tone={i.status ? "forest" : "brick"} dot>
                  {i.status ? "подключено" : "нет связи"}
                </Tag>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="API-ключ / токен">
                  <div className="flex gap-2">
                    <Input mono value={keys[i.id]} onChange={(e) => setKeys((p) => ({ ...p, [i.id]: e.target.value }))} />
                    <Button size="icon" variant="quiet" aria-label="Скопировать" onClick={() => flash("Ключ скопирован в буфер обмена")}>
                      <IconCopy size={14} />
                    </Button>
                  </div>
                </Field>
                <Field label="Эндпоинт">
                  <Input mono defaultValue={`https://api.internal/${i.id}/v2`} />
                </Field>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-faint pt-3">
                <Button
                  size="sm"
                  variant={i.status ? "outline" : "primary"}
                  onClick={() => flash(`Проверка соединения с ${i.name}…`)}
                >
                  <IconRefresh size={13} />
                  Проверить соединение
                </Button>
                <Button size="sm" variant="ghost">
                  Лог обмена
                </Button>
                {!i.status && (
                  <span className="ml-auto font-mono text-micro text-brick">
                    <IconAlert size={12} className="mr-1 inline" />
                    Требуется переподключение
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="xl:col-span-4">
        <div className="border border-line bg-paper-raised p-4">
          <SectionTitle index="05" title="Протокол обмена" className="border-b-0 pb-2" />
          <div className="mt-3">
            <KeyValue k="Формат заданий" v="WMS-XML 2.4" />
            <KeyValue k="Очередь" v="replenishment" />
            <KeyValue k="Таймаут, с" v="30" />
            <KeyValue k="Повторов" v="3" />
            <KeyValue k="Подпись" v="HMAC-SHA256" />
          </div>
          <p className="mt-3 border-t border-line-faint pt-2.5 text-micro leading-relaxed text-ink-muted">
            При недоступности WMS задания остаются в локальной очереди и
            отправляются при восстановлении соединения.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UsersTab({ flash }: { flash: (m: string) => void }) {
  const [users, setUsers] = React.useState(USERS);
  return (
    <div className="border border-line bg-paper-raised">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <span className="eyebrow text-brass-deep">06</span>
          <h2 className="mt-1 font-display text-h4 leading-none">Пользователи и роли</h2>
        </div>
        <Button variant="primary" size="sm" onClick={() => flash("Приглашение отправлено")}>
          <IconUser size={14} />
          Пригласить
        </Button>
      </div>
      <TableWrap>
        <thead>
          <tr>
            <Th className="w-[80px]">ID</Th>
            <Th>Пользователь</Th>
            <Th className="w-[170px]">Роль</Th>
            <Th className="w-[220px]">Доступ</Th>
            <Th align="right" className="w-[110px]">Активность</Th>
            <Th className="w-[110px]">Состояние</Th>
            <Th className="w-[80px]" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td className="tabular font-mono text-micro2 text-ink-muted">{u.id}</Td>
              <Td className="text-ink">{u.name}</Td>
              <Td>
                <Tag tone={u.role === "Товарищество" ? "slate" : "neutral"}>{u.role}</Tag>
              </Td>
              <Td className="text-micro2 text-ink-muted">{u.store}</Td>
              <Td align="right" className="tabular font-mono text-micro2 text-ink-muted">
                {u.last}
              </Td>
              <Td>
                <span
                  className={cn(
                    "flex items-center gap-2 font-mono text-micro",
                    u.active ? "text-forest" : "text-ink-faint",
                  )}
                >
                  <StatusDot tone={u.active ? "ok" : "off"} />
                  {u.active ? "активен" : "не в сети"}
                </span>
              </Td>
              <Td>
                <button
                  type="button"
                  onClick={() =>
                    setUsers((p) => p.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)))
                  }
                  className="font-mono text-micro uppercase tracking-[0.08em] text-ink-muted transition-colors hover:text-brick"
                >
                  {u.active ? "Отозвать" : "Вернуть"}
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </TableWrap>
      <div className="flex flex-wrap items-center gap-4 border-t border-line bg-paper px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-micro text-ink-muted">
          <IconCheck size={13} className="text-forest" />
          SSO через Keycloak · 2FA обязательна
        </span>
        <span className="tabular font-mono text-micro text-ink-faint">
          Журнал доступа: retention 180 дней
        </span>
      </div>
    </div>
  );
}