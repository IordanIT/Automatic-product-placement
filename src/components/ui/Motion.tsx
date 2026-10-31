import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export const EASE = [0.4, 0, 0.2, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 6,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Staggers direct Reveal children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const revealVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
};

/** Tab / view switch: crossfade with a 4px rise. */
export function ViewSwitch({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.24, ease: EASE }}
        className={cn(className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}