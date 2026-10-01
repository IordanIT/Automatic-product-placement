"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { EASE } from "@/components/ui/Motion";
import {
  IconAnalytics,
  IconChevronLeft,
  IconOverview,
  IconPlanogram,
  IconSettings,
  IconShelf,
  IconTasks,
} from "@/components/ui/icons";

export const NAV: ReadonlyArray<{
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  code: string;
  badge?: number;
}> = [
  { href: "/overview", label: "Обзор", icon: IconOverview, code: "01" },
  { href: "/shelf", label: "Анализ полки", icon: IconShelf, code: "02", badge: 24 },
  { href: "/planograms", label: "Планограммы", icon: IconPlanogram, code: "03" },
  { href: "/tasks", label: "Задачи", icon: IconTasks, code: "04", badge: 12 },
  { href: "/analytics", label: "Аналитика", icon: IconAnalytics, code: "05" },
  { href: "/settings", label: "Настройки", icon: IconSettings, code: "06" },
];

const ROLE = "Мерчандайзер";

export function Sidebar({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        "sticky top-0 z-40 flex h-[calc(100vh-56px)] shrink-0 flex-col border-r border-line bg-paper",
        "transition-[width] duration-300 ease-precise",
        open ? "w-railOpen" : "w-rail",
      )}
    >
      <ul className="flex-1 overflow-y-auto py-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-12 items-center gap-3 border-b border-line-faint px-0",
                  "transition-colors duration-200 ease-precise",
                  open ? "pl-4 pr-3" : "justify-center px-0",
                  active ? "bg-paper-sunk" : "hover:bg-paper-sunk/60",
                )}
              >
                {/* Active indicator: a single vertical hairline, never a fill. */}
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-[2px] transition-colors duration-200 ease-precise",
                    active ? "bg-slate" : "bg-transparent group-hover:bg-brass",
                  )}
                />
                <Icon
                  size={19}
                  className={cn(
                    "shrink-0 transition-colors duration-200 ease-precise",
                    active ? "text-slate" : "text-ink-muted group-hover:text-ink",
                  )}
                />

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2"
                    >
                      <span
                        className={cn(
                          "truncate font-mono text-micro2 uppercase tracking-[0.1em]",
                          active ? "text-ink" : "text-ink-muted group-hover:text-ink",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge ? (
                        <span className="tabular shrink-0 border border-line px-1 text-[0.625rem] leading-4 text-ink-muted">
                          {item.badge}
                        </span>
                      ) : null}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!open && (
                  <span className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap border border-line bg-paper-raised px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-ink group-hover:block">
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={cn("border-t border-line", open ? "px-4 py-3" : "flex justify-center py-3")}>
        {open ? (
          <div className="animate-fade-up">
            <div className="eyebrow">Роль</div>
            <div className="mt-1 font-display text-small leading-tight">{ROLE}</div>
            <div className="tabular mt-1 text-micro text-ink-faint">ID · 0442</div>
          </div>
        ) : (
          <span className="tabular text-micro text-ink-faint">02</span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Свернуть меню" : "Развернуть меню"}
        className={cn(
          "flex h-10 items-center gap-2 border-t border-line px-3 font-mono text-micro uppercase tracking-[0.12em] text-ink-muted",
          "transition-colors duration-200 ease-precise hover:bg-paper-sunk hover:text-ink",
          !open && "justify-center",
        )}
      >
        <IconChevronLeft
          size={15}
          className={cn("transition-transform duration-300 ease-precise", open ? "" : "rotate-180")}
        />
        {open && <span>Свернуть</span>}
      </button>
    </nav>
  );
}