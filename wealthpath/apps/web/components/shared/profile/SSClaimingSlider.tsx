"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { motion, AnimatePresence } from "framer-motion";

interface SSClaimingSliderProps {
  value: number;
  onChange: (v: number) => void;
}

const SS_INFO: Record<number, string> = {
  62: "~30% reduction from FRA benefit",
  63: "~25% reduction from FRA benefit",
  64: "~20% reduction from FRA benefit",
  65: "~13% reduction from FRA benefit",
  66: "~7% reduction from FRA benefit",
  67: "Full Retirement Age (FRA) benefit",
  68: "~8% increase over FRA benefit",
  69: "~16% increase over FRA benefit",
  70: "~24% increase over FRA benefit",
};

const STOPS = [62, 64, 66, 67, 68, 70];

export default function SSClaimingSlider({ value, onChange }: SSClaimingSliderProps) {
  const { theme } = useMode();

  const pct = ((value - 62) / (70 - 62)) * 100;

  return (
    <div
      className="w-full space-y-3"
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${theme.borderGlass}`,
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      {/* Current value display */}
      <div className="text-center">
        <motion.span
          key={value}
          className="text-3xl font-bold"
          style={{
            background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          Age {value}
        </motion.span>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={62}
          max={70}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="ss-slider w-full cursor-pointer appearance-none"
          style={
            {
              "--slider-primary": theme.gradientFrom,
              "--slider-pct": `${pct}%`,
              "--slider-muted": `${theme.textMuted}30`,
              accentColor: theme.gradientFrom,
            } as React.CSSProperties
          }
        />
        <style>{`
          .ss-slider {
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(
              to right,
              var(--slider-primary) 0%,
              var(--slider-primary) var(--slider-pct),
              var(--slider-muted) var(--slider-pct),
              var(--slider-muted) 100%
            );
            outline: none;
          }
          .ss-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--slider-primary);
            border: 3px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.15s;
          }
          .ss-slider::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          .ss-slider::-moz-range-thumb {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--slider-primary);
            border: 3px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
        `}</style>
      </div>

      {/* Labeled stops */}
      <div className="relative flex justify-between px-1">
        {STOPS.map((age) => (
          <span
            key={age}
            className="text-xs font-medium"
            style={age === value ? {
              background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 700,
            } : {
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            {age}
          </span>
        ))}
      </div>

      {/* SS adjustment info */}
      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          className="text-center text-sm"
          style={{
            color: value >= 67 ? "#10B981" : theme.textMuted,
            fontWeight: 500,
          }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {SS_INFO[value]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
