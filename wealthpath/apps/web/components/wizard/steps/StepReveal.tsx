"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useWizard } from "../store";
import AnimatedCounter from "../ui/AnimatedCounter";
import StatCard from "../ui/StatCard";
// animations used by child components (StatCard, AnimatedCounter)

// Simple inline chart - draws net worth over time
function NetWorthMiniChart({
  data,
  retirementAge,
  width = 600,
  height = 200,
}: {
  data: Array<{ age: number; netWorth: number }>;
  retirementAge: number;
  width?: number;
  height?: number;
}) {
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxNW = Math.max(...data.map((d) => d.netWorth), 1);
  const minAge = data[0]?.age ?? 0;
  const maxAge = data[data.length - 1]?.age ?? 90;

  const toX = (age: number) =>
    padding.left + ((age - minAge) / (maxAge - minAge)) * chartW;
  const toY = (nw: number) =>
    padding.top + chartH - (Math.max(nw, 0) / maxNW) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.age)} ${toY(d.netWorth)}`)
    .join(" ");

  const areaD = `${pathD} L ${toX(maxAge)} ${toY(0)} L ${toX(minAge)} ${toY(0)} Z`;

  const retireX = toX(retirementAge);

  // Y-axis labels
  const yLabels = [0, maxNW * 0.5, maxNW].map((v) => ({
    value: v,
    label:
      v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(1)}M`
        : `$${Math.round(v / 1000)}k`,
    y: toY(v),
  }));

  return (
    <motion.svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.5 }}
    >
      {/* Grid lines */}
      {yLabels.map((l, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={l.y}
            x2={padding.left + chartW}
            y2={l.y}
            stroke="#374151"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 5}
            y={l.y + 4}
            textAnchor="end"
            fill="#6B7280"
            fontSize="10"
            fontFamily="system-ui, sans-serif"
          >
            {l.label}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <motion.path
        d={areaD}
        fill="url(#chart-gradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
      />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
      />

      {/* Retirement marker */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <line
          x1={retireX}
          y1={padding.top}
          x2={retireX}
          y2={padding.top + chartH}
          stroke="#10B981"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text
          x={retireX}
          y={padding.top + chartH + 15}
          textAnchor="middle"
          fill="#10B981"
          fontSize="10"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
        >
          Retire
        </text>
      </motion.g>

      {/* X-axis labels */}
      {[minAge, Math.round((minAge + maxAge) / 2), maxAge].map((age, i) => (
        <text
          key={i}
          x={toX(age)}
          y={padding.top + chartH + 15}
          textAnchor="middle"
          fill="#6B7280"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
        >
          {age}
        </text>
      ))}
    </motion.svg>
  );
}

// Milestone teasers
const MILESTONES = [
  { age: 50, label: "Catch-up contributions unlock" },
  { age: 59, label: "Penalty-free withdrawals" },
  { age: 62, label: "Social Security optimization" },
  { age: 65, label: "Medicare" },
  { age: null, label: "Roth conversion strategies" },
  { age: null, label: "Tax optimization moves" },
];

export default function StepReveal() {
  const { state, goBack, goNext, reset } = useWizard();
  const projection = state.projection;

  const formatLargeNumber = useMemo(
    () => (v: number) => {
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
      return v.toLocaleString();
    },
    []
  );

  if (!projection) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">Calculating your projection...</p>
      </div>
    );
  }

  const { retirementAge, netWorthAtRetirement, monthlyRetirementIncome, yearsOfRunway, yearByYearData } = projection;

  // Convert an age to a descriptive label like "mid 60s", "early 70s"
  const ageToLabel = (age: number): string => {
    if (age >= 90) return "late 80s+";
    const decade = Math.floor(age / 10) * 10;
    const position = age % 10;
    const decadeStr = `${decade}s`;
    if (position <= 3) return `early ${decadeStr}`;
    if (position <= 6) return `mid ${decadeStr}`;
    return `late ${decadeStr}`;
  };

  const freedomRange = retirementAge >= 90 ? "85+" : ageToLabel(retirementAge);

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Main retirement age headline */}
      <div className="mb-8 text-center">
        <motion.p
          className="mb-2 text-sm uppercase tracking-widest text-amber-400/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your Projection
        </motion.p>
        <motion.h1
          className="mb-2 text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your estimated freedom range
        </motion.h1>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.7 }}
        >
          <span
            className="text-5xl font-extrabold md:text-6xl"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #FB923C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {freedomRange}
          </span>
        </motion.div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid w-full max-w-lg grid-cols-3 gap-3">
        <div>
          <StatCard
            label="Net Worth at Retirement"
            value={netWorthAtRetirement}
            prefix="$"
            delay={1}
            formatFn={formatLargeNumber}
          />
        </div>
        <div>
          <StatCard
            label="Monthly Income"
            value={monthlyRetirementIncome}
            prefix="$"
            delay={1.2}
          />
        </div>
        <div>
          <StatCard
            label="Years of Freedom"
            value={yearsOfRunway}
            prefix=""
            suffix=" yrs"
            delay={1.4}
            formatFn={(v) => String(v)}
          />
        </div>
      </div>

      {/* Net worth chart */}
      <div className="mb-8 w-full max-w-xl">
        <NetWorthMiniChart
          data={yearByYearData}
          retirementAge={retirementAge}
        />
      </div>

      {/* Milestone teasers */}
      <motion.div
        className="mb-8 w-full max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-gray-500">
          Unlock with your full plan
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {MILESTONES.map((m, i) => (
            <motion.span
              key={i}
              className="rounded-full border border-gray-700 bg-gray-800/40 px-3 py-1.5 text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 2.7 + i * 0.1 }}
            >
              {m.age ? `Age ${m.age}: ` : ""}
              {m.label}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Motivational message */}
      <motion.p
        className="mb-6 max-w-md text-center text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
      >
        Want to improve these numbers? There&apos;s a lot more we can do.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.2, type: "spring" }}
      >
        <button
          onClick={goNext}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-10 py-4 text-lg font-bold text-gray-900 transition-all"
        >
          {/* Animated gradient background */}
          <span
            className="absolute inset-0 transition-all group-hover:scale-110"
            style={{
              background:
                "linear-gradient(135deg, #F59E0B, #FB923C, #F59E0B)",
              backgroundSize: "200% 200%",
            }}
          />
          <motion.span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #F59E0B, #FB923C, #F59E0B)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Register Now
            <svg
              className="h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={goBack}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            Go back and adjust
          </button>
          <span className="text-gray-700">|</span>
          <button
            onClick={reset}
            className="text-sm text-gray-500 hover:text-gray-300"
          >
            Start over
          </button>
        </div>

        {/* Value props */}
        <motion.div
          className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Optimize your taxes with smart strategy moves
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Compare scenarios side by side
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Track your progress over time
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
