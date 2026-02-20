"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";

interface AllocationDonutProps {
  stocks: number;
  bonds: number;
  cash: number;
  alternatives: number;
}

const SEGMENTS = [
  { key: "stocks", label: "Stocks", color: "#3B82F6" },
  { key: "bonds", label: "Bonds", color: "#10B981" },
  { key: "cash", label: "Cash", color: "#F59E0B" },
  { key: "alternatives", label: "Alternatives", color: "#8B5CF6" },
] as const;

const SIZE = 120;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AllocationDonut({ stocks, bonds, cash, alternatives }: AllocationDonutProps) {
  const { theme } = useMode();
  const values = { stocks, bonds, cash, alternatives };
  const sum = stocks + bonds + cash + alternatives;
  const isValid = sum === 100;

  const segments = useMemo(() => {
    let offset = 0;
    return SEGMENTS.map((seg) => {
      const pct = values[seg.key];
      const dashLen = (pct / 100) * CIRCUMFERENCE;
      const dashOffset = -offset;
      offset += dashLen;
      return { ...seg, pct, dashLen, dashOffset };
    });
  }, [stocks, bonds, cash, alternatives]);

  return (
    <div
      className="flex flex-col items-center gap-4"
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${theme.borderGlass}`,
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      {/* SVG ring */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`${theme.textMuted}15`}
          strokeWidth={STROKE}
        />
        {/* Segments */}
        {segments.map((seg) =>
          seg.pct > 0 ? (
            <motion.circle
              key={seg.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}`, strokeDashoffset: seg.dashOffset }}
              animate={{
                strokeDasharray: `${seg.dashLen} ${CIRCUMFERENCE - seg.dashLen}`,
                strokeDashoffset: seg.dashOffset,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          ) : null,
        )}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs" style={{ color: theme.textMuted }}>
              {seg.label}
            </span>
            <span
              className="text-xs font-semibold"
              style={{ color: theme.text, fontFamily: theme.fontMono }}
            >
              {seg.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* Allocation sum bar */}
      <div className="w-full max-w-[200px] space-y-1">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-medium"
            style={{ color: isValid ? "#10B981" : "#F59E0B" }}
          >
            Total: {sum}%
            {!isValid && " — must equal 100%"}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: `${theme.textMuted}15` }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: isValid ? `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` : "#F59E0B" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(sum, 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
