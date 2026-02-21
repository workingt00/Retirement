"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useMode } from "./ModeProvider";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export default function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = "$0",
  min = 0,
  max = 99_999_999,
  className = "",
}: CurrencyInputProps) {
  const { theme } = useMode();
  const [display, setDisplay] = useState(formatDisplay(value));
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function formatDisplay(v: number): string {
    if (v === 0) return "";
    return v.toLocaleString();
  }

  useEffect(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.]/g, "");
      setDisplay(raw);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const num = parseFloat(raw) || 0;
        const clamped = Math.min(Math.max(num, min), max);
        onChange(clamped);
      }, 150);
    },
    [onChange, min, max],
  );

  const handleBlur = useCallback(() => {
    setDisplay(formatDisplay(value));
  }, [value]);

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
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm"
          style={{ color: theme.textMuted }}
        >
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full py-2 pl-7 pr-3 text-sm outline-none transition-colors focus:ring-2"
          style={{
            backgroundColor: theme.surface,
            color: theme.text,
            borderRadius: theme.radiusInput,
            border: `1px solid ${theme.textMuted}40`,
            fontFamily: theme.fontFamily,
            minHeight: "44px",
          }}
        />
      </div>
    </div>
  );
}
