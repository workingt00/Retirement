"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AnimatedValueProps {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animates a text value with a smooth slide-up + fade when it changes.
 * Uses Web Animations API for jitter-free transitions.
 * If a new value arrives mid-animation, it queues it and plays after the current one finishes.
 */
export default function AnimatedValue({ value, className, style }: AnimatedValueProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);
  const animatingRef = useRef(false);
  const queuedRef = useRef<string | null>(null);

  const runAnimation = useCallback((newValue: string) => {
    const el = spanRef.current;
    if (!el) {
      setDisplayed(newValue);
      return;
    }

    animatingRef.current = true;

    // Phase 1: fade out + slide up
    const exit = el.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      { duration: 120, easing: "ease-in", fill: "forwards" }
    );

    exit.onfinish = () => {
      // Swap text while invisible
      setDisplayed(newValue);

      // Phase 2: fade in + slide in from below
      const enter = el.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 180, easing: "ease-out", fill: "forwards" }
      );

      enter.onfinish = () => {
        animatingRef.current = false;
        // If a newer value arrived during animation, play it now
        if (queuedRef.current !== null && queuedRef.current !== newValue) {
          const next = queuedRef.current;
          queuedRef.current = null;
          runAnimation(next);
        } else {
          queuedRef.current = null;
        }
      };
    };
  }, []);

  useEffect(() => {
    if (value === displayed && !animatingRef.current) return;

    if (animatingRef.current) {
      // Animation in progress — queue the latest value, don't interrupt
      queuedRef.current = value;
    } else {
      runAnimation(value);
    }
  }, [value, displayed, runAnimation]);

  return (
    <span
      ref={spanRef}
      className={`inline-block ${className ?? ""}`}
      style={style}
    >
      {displayed}
    </span>
  );
}
