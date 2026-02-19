"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { formatInputDisplay, parseCurrencyInput } from "../utils/formatCurrency";

interface WizardCurrencyInputProps {
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  helperText?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  id: string;
  /** Step amount for the up/down arrows. If set, arrows are shown. */
  step?: number;
}

export default function WizardCurrencyInput({
  value,
  onChange,
  label,
  helperText,
  placeholder = "0",
  min = 0,
  max = 99_999_999,
  id,
  step,
}: WizardCurrencyInputProps) {
  const [display, setDisplay] = useState(value != null ? formatInputDisplay(value) : "");
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const longPressRef = useRef<ReturnType<typeof setTimeout>>();
  const repeatRef = useRef<ReturnType<typeof setInterval>>();
  // Track latest value in a ref so the repeat interval always reads the current value
  const valueRef = useRef(value);
  valueRef.current = value;

  // Sync display from external value changes (back navigation, reset, chip selection)
  useEffect(() => {
    if (!isFocused) {
      setDisplay(value != null ? formatInputDisplay(value) : "");
    }
  }, [value, isFocused]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow only digits and commas
      const cleaned = raw.replace(/[^0-9,]/g, "");
      setDisplay(cleaned);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const num = parseCurrencyInput(cleaned);
        const clamped = Math.min(Math.max(num, min), max);
        onChange(clamped);
      }, 150);
    },
    [onChange, min, max]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (value != null) {
      setDisplay(formatInputDisplay(value));
    } else {
      setDisplay("");
    }
  }, [value]);

  const doStep = useCallback(
    (direction: 1 | -1) => {
      if (!step) return;
      const current = valueRef.current ?? 0;
      const next = Math.min(Math.max(current + step * direction, min), max);
      onChange(next);
    },
    [step, onChange, min, max]
  );

  const stopLongPress = useCallback(() => {
    clearTimeout(longPressRef.current);
    clearInterval(repeatRef.current);
  }, []);

  const startLongPress = useCallback(
    (direction: 1 | -1) => {
      // Fire once immediately
      doStep(direction);
      // After 400ms initial delay, repeat every 80ms
      longPressRef.current = setTimeout(() => {
        repeatRef.current = setInterval(() => doStep(direction), 80);
      }, 400);
    },
    [doStep]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimeout(longPressRef.current);
      clearInterval(repeatRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <label
        htmlFor={id}
        className="mb-2 block text-lg font-semibold text-white"
      >
        {label}
      </label>
      {helperText && (
        <p className="mb-3 text-sm text-gray-400">{helperText}</p>
      )}
      <div className="flex items-center gap-2">
        {step && (
          <button
            type="button"
            onPointerDown={() => startLongPress(-1)}
            onPointerUp={stopLongPress}
            onPointerLeave={stopLongPress}
            onContextMenu={(e) => e.preventDefault()}
            disabled={value != null && value <= min}
            className="flex h-14 w-10 shrink-0 select-none items-center justify-center rounded-lg border border-gray-600 bg-gray-800 text-gray-300 transition-colors hover:border-amber-400 hover:text-amber-400 active:bg-gray-700 disabled:opacity-30 disabled:hover:border-gray-600 disabled:hover:text-gray-300"
            aria-label="Decrease amount"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="relative flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-amber-400"
            aria-hidden="true"
          >
            $
          </span>
          <input
            id={id}
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-xl border-2 bg-gray-900/80 py-4 pl-10 pr-4 text-2xl font-semibold text-white outline-none transition-all placeholder:text-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            style={{
              borderColor: isFocused ? "#F59E0B" : "#374151",
              minHeight: "56px",
            }}
            aria-describedby={helperText ? `${id}-helper` : undefined}
          />
          {helperText && (
            <span id={`${id}-helper`} className="sr-only">
              {helperText}
            </span>
          )}
        </div>
        {step && (
          <button
            type="button"
            onPointerDown={() => startLongPress(1)}
            onPointerUp={stopLongPress}
            onPointerLeave={stopLongPress}
            onContextMenu={(e) => e.preventDefault()}
            disabled={value != null && value >= max}
            className="flex h-14 w-10 shrink-0 select-none items-center justify-center rounded-lg border border-gray-600 bg-gray-800 text-gray-300 transition-colors hover:border-amber-400 hover:text-amber-400 active:bg-gray-700 disabled:opacity-30 disabled:hover:border-gray-600 disabled:hover:text-gray-300"
            aria-label="Increase amount"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
