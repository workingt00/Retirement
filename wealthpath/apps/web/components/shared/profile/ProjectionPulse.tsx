"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulationContext } from "@/components/shared/SimulationProvider";
import { usePlanStore } from "@/stores/planStore";
import AnimatedNumber from "@/components/charts/AnimatedNumber";

const FEASIBILITY_COLORS: Record<string, string> = {
  on_track: "#10B981",
  achievable: "#22C55E",
  moderate: "#F59E0B",
  aggressive: "#F97316",
  very_aggressive: "#EF4444",
};

const FEASIBILITY_LABELS: Record<string, string> = {
  on_track: "On Track",
  achievable: "Achievable",
  moderate: "Moderate",
  aggressive: "Aggressive",
  very_aggressive: "Very Aggressive",
};

function DeltaArrow({ direction, show }: { direction: "up" | "down"; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className="ml-1 text-xs font-bold"
          style={{ color: direction === "up" ? "#10B981" : "#EF4444" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {direction === "up" ? "\u2191" : "\u2193"}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

interface MetricState {
  netWorth: number;
  retireAge: number;
  runway: number;
  monthlyIncome: number;
}

function useDelta(current: MetricState) {
  const prev = useRef<MetricState>(current);
  const [deltas, setDeltas] = useState<Record<string, "up" | "down" | null>>({
    netWorth: null, retireAge: null, runway: null, monthlyIncome: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const newDeltas: Record<string, "up" | "down" | null> = {
      netWorth: null, retireAge: null, runway: null, monthlyIncome: null,
    };
    let hasChange = false;

    for (const key of Object.keys(newDeltas) as (keyof MetricState)[]) {
      if (current[key] !== prev.current[key]) {
        newDeltas[key] = current[key] > prev.current[key] ? "up" : "down";
        hasChange = true;
      }
    }

    prev.current = { ...current };

    if (hasChange) {
      setDeltas(newDeltas);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDeltas({ netWorth: null, retireAge: null, runway: null, monthlyIncome: null });
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current]);

  return deltas;
}

export default function ProjectionPulse({ compact = false }: { compact?: boolean }) {
  const { theme } = useMode();
  const { result, goalResult } = useSimulationContext();
  const plan = usePlanStore((s) => s.plan);

  const retireAge = plan
    ? plan.personal.currentAge + (goalResult?.yearsToRetire ?? (plan.personal.retirementAge - plan.personal.currentAge))
    : 0;
  const netWorth = result?.summary.netWorthAtRetirement ?? 0;
  const runway = result?.summary.yearsOfRunway ?? 0;
  const ssMonthly = plan?.socialSecurity.monthlyBenefitAtFRA ?? 0;
  const monthlyIncome = Math.round((netWorth * 0.04) / 12) + ssMonthly;
  const feasibility = goalResult?.feasibility ?? "moderate";

  const deltas = useDelta({ netWorth, retireAge, runway, monthlyIncome });

  const feasColor = FEASIBILITY_COLORS[feasibility] ?? "#F59E0B";
  const feasLabel = FEASIBILITY_LABELS[feasibility] ?? "Unknown";

  if (compact) {
    return (
      <div
        className="flex items-center gap-4 overflow-x-auto rounded-xl px-4 py-3"
        style={{
          backgroundColor: theme.surfaceGlass,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${theme.borderGlass}`,
        }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>Retire</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={retireAge} format="integer" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>NW</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={netWorth} format="currency" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>Monthly</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={monthlyIncome} format="currency" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `${feasColor}20`, color: feasColor }}
        >
          {feasLabel}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.borderGlass}`,
        boxShadow: theme.shadowCard,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Gradient top accent bar */}
      <div
        className="absolute left-0 right-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
        }}
      />

      <h3
        className="mb-5 text-xs font-semibold uppercase tracking-widest"
        style={{
          background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Your Projection
      </h3>

      <div className="space-y-5">
        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Retirement Age</div>
          <div className="flex items-baseline">
            <span
              className="text-3xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 20px ${theme.primary}30` : "none",
              }}
            >
              <AnimatedNumber value={retireAge} format="integer" duration={500} />
            </span>
            <DeltaArrow direction={deltas.retireAge === "down" ? "up" : "down"} show={deltas.retireAge !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Net Worth at Retirement</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: theme.fontMono,
              }}
            >
              <AnimatedNumber value={netWorth} format="currency" duration={500} />
            </span>
            <DeltaArrow direction={deltas.netWorth ?? "up"} show={deltas.netWorth !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Est. Monthly Income</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 15px ${theme.primary}20` : "none",
              }}
            >
              <AnimatedNumber value={monthlyIncome} format="currency" duration={500} />
            </span>
            <DeltaArrow direction={deltas.monthlyIncome ?? "up"} show={deltas.monthlyIncome !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Years of Runway</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 15px ${theme.primary}20` : "none",
              }}
            >
              <AnimatedNumber value={runway} format="integer" duration={500} />
            </span>
            <span className="ml-1 text-sm" style={{ color: theme.textMuted }}>years</span>
            <DeltaArrow direction={deltas.runway ?? "up"} show={deltas.runway !== null} />
          </div>
        </div>

        <div className="pt-2">
          <motion.span
            key={feasibility}
            className="inline-block rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${feasColor}20, ${feasColor}10)`,
              color: feasColor,
              border: `1px solid ${feasColor}30`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {feasLabel}
          </motion.span>
        </div>
      </div>

      <p className="mt-6 text-[10px] leading-tight" style={{ color: `${theme.textMuted}80` }}>
        For educational purposes only. Not financial advice.
      </p>
    </motion.div>
  );
}
