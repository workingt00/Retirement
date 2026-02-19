"use client";

import { useState, useRef, useCallback } from "react";
import { useMode } from "./ModeProvider";
import { getTooltip } from "@/lib/tooltips";

interface TooltipProps {
  term: string;
  children: React.ReactNode;
}

export default function Tooltip({ term, children }: TooltipProps) {
  const { mode, theme } = useMode();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const content = getTooltip(term, mode);
  if (!content) return <>{children}</>;

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <span
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full text-[10px] font-bold"
        style={{
          backgroundColor: `${theme.textMuted}30`,
          color: theme.textMuted,
        }}
      >
        i
      </span>
      {open && (
        <span
          className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg p-3 text-xs shadow-lg"
          style={{
            backgroundColor: theme.isDark ? theme.surface : theme.text,
            color: theme.isDark ? theme.text : theme.surface,
            border: `1px solid ${theme.textMuted}40`,
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {content}
        </span>
      )}
    </span>
  );
}
