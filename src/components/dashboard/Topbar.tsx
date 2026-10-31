"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { STORES } from "@/lib/data";
import { EASE } from "@/components/ui/Motion";
import { Wordmark } from "@/components/brand/Wordmark";
import { StatusDot } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Controls";
import {
  IconArrowUpRight,
  IconBell,
  IconCheck,
  IconChevronDown,
  IconSearch,
  IconStore,
  IconUser,
} from "@/components/ui/icons";

export function Topbar({
  storeId,
  onStoreChange,
}: {
  storeId: string;
  onStoreChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0]!;

  const filtered = STORES.filter((s) =>
    `${s.name} ${s.city} ${s.id}`.toLowerCase().includes(query.toLowerCase()),
  );

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const demo = () => {
    setOpen(false);
    setToast("Запрос на демо зарегистрирован");
    window.setTimeout(() => setToast(null), 3600);
  };

  return (
    <header className="sticky top-0 z-50 flex h-topbar items-center border-b border-line bg-paper/95 backdrop-blur-[2px]">
      {/* Left — identity */}
      <div className="flex h-full items-center border-r border-line px-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Полка — на главную">
          <Wordmark compact />
          <span className="eyebrow hidden border-l border-line pl-2.5 !tracking-[0.16em] xl:inline">
            Shelf&nbsp;CV
          </span>
        </Link>
      </div>

      {/* Center — context switcher */}
      <div className="flex min-w-0 flex-1 items-center justify-center px-3">
        <div ref={ref} className="relative w-full max-w-[420px]">
          <button
            type="button"
            onClick={() => {
              setOpen((o) => !o);
              setQuery("");
            }}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              "group flex h-9 w-full items-center gap-3 border border-line bg-paper-raised px-3 text-left",
              "transition-colors duration-200 ease-precise hover:border-brass",
              open && "border-slate",
            )}
          >
            <IconStore size={16} className="shrink-0 text-ink-muted" />
            <span className="min-w-0 flex-1">
              <span className="eyebrow block !text-[0.5625rem] !tracking-[0.18em]">
                Контекст
              </span>
              <span className="block truncate font-mono text-micro2 tracking-[0.04em] text-ink">
                {store.name}
              </span>
            </span>
            <span className="tabular hidden shrink-0 border border-line px-1.5 py-0.5 text-[0.625rem] text-ink-muted sm:inline">
              {store.id}
            </span>
            <IconChevronDown
              size={14}
              className={cn(
                "shrink-0 text-ink-muted transition-transform duration-200 ease-precise",
                open && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: EASE }}
                role="listbox"
                className="absolute left-1/2 top-full z-50 mt-1 w-[min(460px,92vw)] -translate-x-1/2 border border-line bg-paper-raised"
              >
                <div className="border-b border-line p-2">
                  <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Магазин, филиал, ID…"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={s.id === storeId}
                      onClick={() => {
                        onStoreChange(s.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-line-faint px-3 py-2.5 text-left last:border-b-0",
                        "transition-colors duration-150 ease-precise",
                        s.id === storeId ? "bg-slate text-[#F7F6F3]" : "hover:bg-paper-sunk",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-small font-medium">{s.name}</span>
                        <span
                          className={cn(
                            "tabular block text-micro",
                            s.id === storeId ? "text-[#F7F6F3]/60" : "text-ink-faint",
                          )}
                        >
                          {s.city} · {s.format} · {s.shelves} полок
                        </span>
                      </span>
                      <span className="tabular shrink-0 text-micro2">{s.osa.toFixed(1)}%</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="px-3 py-4 text-center font-mono text-micro2 text-ink-faint">
                      Объектов не найдено
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line bg-paper-sunk px-3 py-2">
                  <span className="eyebrow !text-ink-faint">
                    {filtered.length} из {STORES.length}
                  </span>
                  <Button size="sm" variant="primary" onClick={demo}>
                    Запросить демо
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right — system state + identity */}
      <div className="flex h-full items-center">
        <div className="hidden h-full items-center gap-2.5 border-l border-line px-4 md:flex">
          <StatusDot tone="ok" pulse />
          <span className="font-mono text-micro2 uppercase tracking-[0.08em] text-ink-muted">
            CV-серверы онлайн
          </span>
          <span className="tabular border-l border-line pl-2.5 text-micro text-ink-faint">
            6/6
          </span>
        </div>

        <button
          type="button"
          aria-label="Уведомления"
          className="relative flex h-full w-12 items-center justify-center border-l border-line text-ink-muted transition-colors duration-200 ease-precise hover:bg-paper-sunk hover:text-ink"
        >
          <IconBell size={18} />
          <span className="absolute right-3 top-3 h-1.5 w-1.5 bg-brick" />
        </button>

        <div className="flex h-full items-center gap-2.5 border-l border-line px-3">
          <span className="flex h-7 w-7 items-center justify-center border border-line bg-paper-sunk">
            <IconUser size={15} className="text-ink-muted" />
          </span>
          <span className="hidden leading-tight lg:block">
            <span className="block text-micro2 text-ink">И. Полозова</span>
            <span className="block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-faint">
              Мерчандайзер
            </span>
          </span>
        </div>

        <Link
          href="/#demo"
          className="hidden h-full items-center gap-1.5 border-l border-line px-4 font-mono text-micro uppercase tracking-[0.1em] text-ink-muted transition-colors duration-200 ease-precise hover:bg-paper-sunk hover:text-ink xl:flex"
        >
          Демо
          <IconArrowUpRight size={13} />
        </Link>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="absolute right-4 top-full z-[60] mt-2 flex items-center gap-2.5 border border-forest-line bg-forest-soft px-3 py-2"
          >
            <IconCheck size={15} className="text-forest" />
            <span className="font-mono text-micro2 uppercase tracking-[0.08em] text-forest">
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Context provider that keeps the selected store across the dashboard tree. */
export const StoreContext = React.createContext<{
  storeId: string;
  setStoreId: (id: string) => void;
}>({ storeId: "msk-014", setStoreId: () => {} });

export function useStore() {
  return React.useContext(StoreContext);
}

export { IconSearch };