import * as React from "react";
import { cn } from "@/lib/cn";
import { IconChevronDown, IconSearch } from "./icons";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }
>(({ className, mono = false, ...rest }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full border border-line bg-paper-raised px-3 text-small text-ink",
      "placeholder:text-ink-faint",
      "transition-colors duration-200 ease-precise hover:border-line-strong focus:border-slate focus:outline-none",
      mono && "font-mono text-micro2 tabular",
      className,
    )}
    {...rest}
  />
));
Input.displayName = "Input";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-micro text-ink-faint">{hint}</span>}
    </label>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Поиск",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch
        size={15}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8"
      />
    </div>
  );
}

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export function Select({
  value,
  onChange,
  options,
  className,
  align = "left",
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
  align?: "left" | "right";
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

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

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 border border-line bg-paper-raised px-3",
          "font-mono text-micro2 uppercase tracking-[0.08em] text-ink",
          "transition-colors duration-200 ease-precise hover:border-brass focus:outline-none",
        )}
      >
        <span className="truncate">{label ?? current?.label}</span>
        <IconChevronDown size={14} className={cn("shrink-0 transition-transform duration-200 ease-precise", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 max-h-72 w-full min-w-[240px] overflow-auto border border-line bg-paper-raised",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-4 border-b border-line-faint px-3 py-2 text-left last:border-b-0",
                "font-mono text-micro2 tracking-[0.04em] transition-colors duration-150 ease-precise",
                o.value === value ? "bg-slate text-[#F7F6F3]" : "hover:bg-paper-sunk hover:text-ink",
              )}
            >
              <span>{o.label}</span>
              {o.hint && <span className={cn(o.value === value ? "text-[#F7F6F3]/60" : "text-ink-faint")}>{o.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: React.ReactNode }>;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={cn("inline-flex border border-line bg-paper-sunk", className)}>
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 font-mono uppercase tracking-[0.09em]",
            "transition-colors duration-200 ease-precise",
            size === "sm" ? "h-7 px-2.5 text-micro" : "h-8 px-3 text-micro2",
            i > 0 && "border-l border-line",
            value === o.value
              ? "bg-slate text-[#F7F6F3]"
              : "text-ink-muted hover:bg-paper-raised hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "group inline-flex items-center gap-2.5 disabled:opacity-40",
        label ? "" : "",
      )}
    >
      <span
        className={cn(
          "relative h-4 w-[30px] shrink-0 border transition-colors duration-200 ease-precise",
          checked ? "border-slate bg-slate" : "border-line bg-paper-raised",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-[10px] w-[10px] -translate-y-1/2 transition-[left] duration-200 ease-precise",
            checked ? "left-[17px] bg-[#F7F6F3]" : "left-[2px] bg-ink-faint",
          )}
        />
      </span>
      {label && <span className="text-small text-ink">{label}</span>}
    </button>
  );
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type="range"
      className={cn("w-full cursor-pointer disabled:cursor-not-allowed", className)}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

/** Thin 1px meter. Colour is the only signal — never width games. */
export function Meter({
  value,
  tone = "forest",
  className,
  height = 3,
  hatch = false,
}: {
  value: number;
  tone?: "forest" | "brick" | "brass" | "slate";
  className?: string;
  height?: number;
  hatch?: boolean;
}) {
  const colors = {
    forest: "#2A6F5C",
    brick: "#B34747",
    brass: "#7E6640",
    slate: "#2C3E50",
  };
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("w-full border border-line bg-paper-sunk", className)} style={{ height }}>
      <div
        className={cn("h-full transition-[width] duration-500 ease-precise", hatch && "hatch-forest")}
        style={{ width: `${clamped}%`, background: hatch ? "transparent" : colors[tone] }}
      />
    </div>
  );
}