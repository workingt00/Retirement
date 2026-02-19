"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../store";
import QuickSelectChips from "../ui/QuickSelectChips";

const AGE_PRESETS = [25, 30, 35, 40, 50];

export default function StepAge() {
  const { state, dispatch, goNext, goBack } = useWizard();
  const [localAge, setLocalAge] = useState<string>(
    state.age ? String(state.age) : ""
  );
  const [error, setError] = useState<string>("");

  // Sync local state when store value changes (reset, back navigation)
  useEffect(() => {
    setLocalAge(state.age ? String(state.age) : "");
    setError("");
  }, [state.age]);

  const setAge = useCallback(
    (num: number | null) => {
      if (num !== null && num >= 18 && num <= 80) {
        setLocalAge(String(num));
        dispatch({ type: "SET_AGE", age: num });
      } else {
        dispatch({ type: "SET_AGE", age: null });
      }
      setError("");
    },
    [dispatch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setLocalAge(raw);
      setError("");

      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= 18 && num <= 80) {
        dispatch({ type: "SET_AGE", age: num });
      } else {
        dispatch({ type: "SET_AGE", age: null });
      }
    },
    [dispatch]
  );

  const handleIncrement = useCallback(() => {
    const current = parseInt(localAge, 10);
    if (isNaN(current) || current < 18) {
      setAge(18);
    } else if (current < 80) {
      setAge(current + 1);
    }
  }, [localAge, setAge]);

  const handleDecrement = useCallback(() => {
    const current = parseInt(localAge, 10);
    if (isNaN(current) || current > 80) {
      setAge(80);
    } else if (current > 18) {
      setAge(current - 1);
    }
  }, [localAge, setAge]);

  const handleContinue = () => {
    const num = parseInt(localAge, 10);
    if (isNaN(num) || num < 18 || num > 80) {
      setError("WealthPath is designed for planning between ages 18 and 80");
      return;
    }
    dispatch({ type: "SET_AGE", age: num });
    goNext();
  };

  const isValid = (() => {
    const num = parseInt(localAge, 10);
    return !isNaN(num) && num >= 18 && num <= 80;
  })();

  const currentNum = parseInt(localAge, 10);
  const canDecrement = !isNaN(currentNum) && currentNum > 18;
  const canIncrement = isNaN(currentNum) || currentNum < 80;

  // Long-press support: 400ms delay then repeat every 80ms
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRepeat = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startRepeat = useCallback((action: () => void) => {
    action();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(action, 80);
    }, 400);
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">
        How old are you?
      </h2>
      <p className="mb-8 text-gray-400">
        This anchors your timeline
      </p>

      <div className="w-full max-w-xs">
        <div className="flex items-center gap-3">
          {/* Decrement button */}
          <button
            onPointerDown={() => startRepeat(handleDecrement)}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            disabled={!canDecrement}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-900/80 text-gray-400 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:hover:border-gray-700 disabled:hover:text-gray-400"
            aria-label="Decrease age"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <input
            id="wizard-age"
            type="text"
            inputMode="numeric"
            value={localAge}
            onChange={handleChange}
            placeholder="30"
            maxLength={2}
            autoComplete="off"
            className="w-full rounded-xl border-2 border-gray-700 bg-gray-900/80 py-4 text-center text-5xl font-bold text-white outline-none transition-all placeholder:text-gray-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            style={{ minHeight: "80px" }}
            aria-label="Your age"
            aria-describedby="age-range"
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) handleContinue();
              if (e.key === "ArrowUp") { e.preventDefault(); handleIncrement(); }
              if (e.key === "ArrowDown") { e.preventDefault(); handleDecrement(); }
            }}
          />

          {/* Increment button */}
          <button
            onPointerDown={() => startRepeat(handleIncrement)}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            disabled={!canIncrement}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-gray-700 bg-gray-900/80 text-gray-400 transition-colors hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:hover:border-gray-700 disabled:hover:text-gray-400"
            aria-label="Increase age"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        <p
          id="age-range"
          className="mt-2 text-center text-sm text-gray-500"
        >
          Between 18 and 80
        </p>

        <QuickSelectChips
          values={AGE_PRESETS}
          onSelect={setAge}
          selectedValue={state.age}
          formatFn={(v) => String(v)}
        />
        {error && (
          <motion.p
            className="mt-2 text-center text-sm text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <motion.button
          className="rounded-xl border border-gray-600 px-6 py-3 font-medium text-gray-300 hover:border-gray-400 hover:text-white"
          onClick={goBack}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ minHeight: "48px" }}
        >
          Back
        </motion.button>
        <motion.button
          className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500"
          onClick={handleContinue}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.03 } : undefined}
          whileTap={isValid ? { scale: 0.97 } : undefined}
          style={{ minHeight: "48px" }}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
