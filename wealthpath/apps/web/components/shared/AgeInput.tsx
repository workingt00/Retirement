"use client";

import { useMode } from "./ModeProvider";

interface AgeInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function AgeInput({
  value,
  onChange,
  label,
  min = 18,
  max = 100,
  className = "",
}: AgeInputProps) {
  const { theme } = useMode();

  return (
    <div className={className}>
      {label && (
        <label
          className="mb-1 block text-sm font-medium"
          style={{ color: theme.textMuted }}
        >
          {label}
        </label>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n) && n >= min && n <= max) onChange(n);
        }}
        min={min}
        max={max}
        className="w-full py-2 px-3 text-sm outline-none transition-colors focus:ring-2"
        style={{
          backgroundColor: theme.surface,
          color: theme.text,
          borderRadius: theme.radiusInput,
          border: `1px solid ${theme.textMuted}40`,
          fontFamily: theme.fontMono,
          minHeight: "44px",
        }}
      />
    </div>
  );
}
