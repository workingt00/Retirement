"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  format: "currency" | "percent" | "integer";
  duration?: number;
  className?: string;
}

function formatValue(value: number, format: "currency" | "percent" | "integer"): string {
  if (format === "currency") {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 1_000_000) {
      const m = abs / 1_000_000;
      return `${sign}$${m.toFixed(1)}M`;
    }
    if (abs >= 1_000) {
      return `${sign}$${Math.round(abs).toLocaleString()}`;
    }
    return `${sign}$${Math.round(abs)}`;
  }
  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }
  return Math.round(value).toLocaleString();
}

function springEase(t: number): number {
  // Slight overshoot spring
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

export default function AnimatedNumber({
  value,
  format,
  duration = 300,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = springEase(progress);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{formatValue(display, format)}</span>;
}
