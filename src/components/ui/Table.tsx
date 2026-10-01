import * as React from "react";
import { cn } from "@/lib/cn";

export function TableWrap({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({
  className,
  children,
  align = "left",
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-paper-sunk px-3 py-2 font-mono text-micro font-normal uppercase tracking-[0.12em] text-ink-muted",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  children,
  align = "left",
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <td
      className={cn(
        "border-b border-line-faint px-3 py-2.5 align-middle text-small text-ink",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
}

export function Tr({
  className,
  children,
  onClick,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150 ease-precise",
        onClick && "cursor-pointer hover:bg-paper-sunk",
        className,
      )}
      onClick={onClick}
      {...rest}
    >
      {children}
    </tr>
  );
}

/* -- Tabs ------------------------------------------------------------- */

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
  variant = "underline",
}: {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ value: T; label: string; count?: number }>;
  className?: string;
  variant?: "underline" | "enclosed";
}) {
  if (variant === "enclosed") {
    return (
      <div
        className={cn(
          "inline-flex max-w-full overflow-x-auto border border-line bg-paper-sunk",
          className,
        )}
      >
        {items.map((it) => (
          <button
            key={it.value}
            type="button"
            onClick={() => onChange(it.value)}
            className={cn(
              "relative h-9 shrink-0 whitespace-nowrap px-4 font-mono text-micro2 uppercase tracking-[0.1em]",
              "border-l border-line first:border-l-0",
              "transition-colors duration-200 ease-precise",
              value === it.value
                ? "bg-paper-raised text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {it.label}
            {typeof it.count === "number" && (
              <span className="ml-2 text-ink-faint">{it.count}</span>
            )}
            {value === it.value && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-brass" />
            )}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "no-scrollbar flex max-w-full items-stretch gap-6 overflow-x-auto border-b border-line",
        className,
      )}
    >
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          onClick={() => onChange(it.value)}
          className={cn(
            "relative -mb-px shrink-0 whitespace-nowrap border-b pb-2.5 pt-1 font-mono text-micro2 uppercase tracking-[0.1em]",
            "transition-colors duration-200 ease-precise",
            value === it.value ? "border-slate text-ink" : "border-transparent text-ink-muted hover:text-ink",
          )}
        >
          {it.label}
          {typeof it.count === "number" && (
            <span className="ml-1.5 text-ink-faint">{it.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* -- Drawer ----------------------------------------------------------- */

export function Drawer({
  open,
  onClose,
  width = "w-[520px]",
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  width?: string;
  children: React.ReactNode;
  label: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[70] transition-opacity duration-300 ease-precise",
        open ? "opacity-100" : "opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Закрыть панель"
        onClick={onClose}
        className={cn(
          "absolute inset-0 h-full w-full cursor-default bg-ink/20",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute right-0 top-0 flex h-full flex-col border-l border-line bg-paper",
          "transition-transform duration-300 ease-precise",
          width,
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
        )}
      >
        {children}
      </aside>
    </div>
  );
}

/* -- Misc ------------------------------------------------------------- */

export function KeyValue({
  k,
  v,
  mono = true,
}: {
  k: React.ReactNode;
  v: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line-faint py-1.5 last:border-b-0">
      <span className="eyebrow">{k}</span>
      <span className={cn("text-micro2 text-ink", mono && "font-mono tabular")}>{v}</span>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}