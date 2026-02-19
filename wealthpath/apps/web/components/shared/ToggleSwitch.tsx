"use client";

import { useMode } from "./ModeProvider";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  className = "",
}: ToggleSwitchProps) {
  const { theme } = useMode();

  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 ${className}`}
      style={{ minHeight: "48px" }}
    >
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
        style={{
          backgroundColor: checked ? theme.primary : `${theme.textMuted}40`,
        }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </button>
      {label && (
        <span className="text-sm" style={{ color: theme.text }}>
          {label}
        </span>
      )}
    </label>
  );
}
