"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import type { Variants, HTMLMotionProps } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * AnimatedStack
 *
 * Drop-in replacement for <motion.div className="space-y-*">.
 * Uses CSS flex gap with a transition so spacing animates
 * smoothly when the `gap` prop changes.
 * ───────────────────────────────────────────────────────── */

interface AnimatedStackProps extends Omit<HTMLMotionProps<"div">, "style"> {
  /** Gap in pixels. Animates when changed. Default: 32 (space-y-8) */
  gap?: number;
  /** CSS transition duration for gap changes. Default: "300ms" */
  transitionDuration?: string;
  /** CSS transition easing. Default: "ease-out" */
  transitionEasing?: string;
  /** Framer Motion variants. Default: staggerContainer */
  variants?: Variants;
  /** Inline style overrides (merged after flex/gap) */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function AnimatedStack({
  gap = 32,
  transitionDuration = "300ms",
  transitionEasing = "ease-out",
  variants = staggerContainer,
  className,
  style,
  children,
  ...rest
}: AnimatedStackProps) {
  return (
    <motion.div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        transition: `gap ${transitionDuration} ${transitionEasing}`,
        ...style,
      }}
      variants={variants}
      initial="hidden"
      animate="visible"
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
 * CollapsibleSection
 *
 * Always mounted wrapper that collapses to zero height
 * via CSS grid rows transition when `open` is false.
 * Avoids DOM mount/unmount so surrounding gaps stay stable.
 * ───────────────────────────────────────────────────────── */

interface CollapsibleSectionProps {
  /** Whether the section is expanded */
  open: boolean;
  /** Transition duration. Default: "300ms" */
  duration?: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  open,
  duration = "300ms",
  children,
}: CollapsibleSectionProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: `grid-template-rows ${duration} ease-out, opacity ${duration} ease-out`,
      }}
    >
      <div style={{ overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
