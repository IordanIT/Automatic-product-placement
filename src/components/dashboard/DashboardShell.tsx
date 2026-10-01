"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar, NAV } from "./Sidebar";
import { StoreContext, Topbar } from "./Topbar";
import { STORES } from "@/lib/data";

const TITLES: Record<string, { title: string; crumb: string }> = {
  "/overview": { title: "Обзор сети", crumb: "Сводка по объектам и сменам" },
  "/shelf": { title: "Анализ полки", crumb: "Кадр SH-1142 · Ряд 12 · Напитки" },
  "/planograms": { title: "Планограммы", crumb: "PL-2024-118 · Редактор эталона" },
  "/tasks": { title: "Задачи", crumb: "Очередь выкладки и маршрутизация" },
  "/analytics": { title: "Аналитика", crumb: "Макро-метрики за 14 дней" },
  "/settings": { title: "Настройки", crumb: "Объекты, оборудование, интеграции" },
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [railOpen, setRailOpen] = React.useState(false);
  const [storeId, setStoreId] = React.useState("msk-014");
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: "Полка", crumb: "" };
  const store = STORES.find((s) => s.id === storeId);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setRailOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <StoreContext.Provider value={{ storeId, setStoreId }}>
      <div className="flex min-h-screen flex-col bg-paper paper-grain">
        <Topbar storeId={storeId} onStoreChange={setStoreId} />

        <div className="flex flex-1 items-start">
          <Sidebar open={railOpen} onToggle={() => setRailOpen((v) => !v)} />

          <div className="min-w-0 flex-1">
            {/* Page masthead */}
            <div className="sticky top-topbar z-30 border-b border-line bg-paper/95 backdrop-blur-[2px]">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-5 py-3 lg:px-7">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="eyebrow text-brass-deep">
                      {NAV.find((n) => n.href === pathname)?.code ?? "—"}
                    </span>
                    <span className="h-px w-6 bg-line-strong" />
                    <span className="eyebrow truncate">{meta.crumb}</span>
                  </div>
                  <h1 className="mt-1.5 font-display text-h3 leading-none tracking-[-0.02em]">
                    {meta.title}
                  </h1>
                </div>
                <div className="flex items-center gap-5 pb-1">
                  <div className="hidden text-right sm:block">
                    <div className="eyebrow">Объект</div>
                    <div className="mt-0.5 font-mono text-micro2 text-ink">{store?.name}</div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="eyebrow">Смена</div>
                    <div className="tabular mt-0.5 font-mono text-micro2 text-ink">
                      09:42:11
                    </div>
                  </div>
                  <div className="hidden text-right lg:block">
                    <div className="eyebrow">Обновлено</div>
                    <div className="tabular mt-0.5 font-mono text-micro2 text-ink">
                      {store?.lastScan}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <main className="px-5 py-5 lg:px-7 lg:py-6">{children}</main>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 lg:px-7">
              <span className="eyebrow">Полка CV · модуль vision-inference</span>
              <span className="tabular font-mono text-micro text-ink-faint">
                build 2024.09.17 · frame SH-1142 · rev 4
              </span>
            </footer>
          </div>
        </div>
      </div>
    </StoreContext.Provider>
  );
}