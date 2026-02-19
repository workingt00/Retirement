"use client";

import { useMode } from "./ModeProvider";

interface StatusBadgeProps {
  status: "OK" | "FAIL" | "warning";
  label?: string;
  className?: string;
}

export default function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const { theme, mode } = useMode();

  const colors = {
    OK: { bg: `${theme.success}20`, text: theme.success },
    FAIL: { bg: `${theme.danger}20`, text: theme.danger },
    warning: { bg: `${theme.secondary}20`, text: theme.secondary },
  };

  const defaultLabels = {
    OK: mode === "horizon" ? "On Track" : "OK",
    FAIL: mode === "horizon" ? "Needs Attention" : "FAIL",
    warning: mode === "horizon" ? "Review" : "WARN",
  };

  const c = colors[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {label || defaultLabels[status]}
    </span>
  );
}
