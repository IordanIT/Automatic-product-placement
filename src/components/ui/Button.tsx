import * as React from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-slate text-[#F7F6F3] border-slate hover:bg-slate-deep hover:border-slate-deep active:bg-slate-deep",
  outline:
    "bg-transparent text-ink border-line hover:border-brass hover:text-ink active:bg-paper-sunk",
  ghost: "bg-transparent text-ink-muted border-transparent hover:text-ink hover:border-line",
  danger:
    "bg-transparent text-brick border-brick-line hover:bg-brick hover:text-[#F7F6F3] hover:border-brick",
  quiet: "bg-paper-sunk text-ink border-line hover:border-brass",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-micro gap-1.5",
  md: "h-9 px-4 text-micro2 gap-2",
  lg: "h-11 px-6 text-small gap-2.5",
  icon: "h-8 w-8 justify-center",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "md", ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center border font-mono uppercase tracking-[0.1em]",
        "transition-[background-color,border-color,color,transform] duration-200 ease-precise",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  ),
);
Button.displayName = "Button";