"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from "recharts";
import { motion } from "framer-motion";
import { chartColors, formatDollar, type Theme } from "./chartColors";

interface SSComparisonProps {
  monthlyBenefitFRA: number;
  quartersEarned: number;
  theme: Theme;
}

function computeSSBenefit(monthlyFRA: number, claimAge: number): number {
  // FRA = 67. Early: -6.67%/yr for first 3 yrs, -5%/yr after. Late: +8%/yr.
  if (claimAge === 67) return monthlyFRA * 12;
  if (claimAge < 67) {
    const monthsEarly = (67 - claimAge) * 12;
    const first36 = Math.min(monthsEarly, 36);
    const remaining = Math.max(0, monthsEarly - 36);
    const reduction = first36 * (5 / 900) + remaining * (5 / 1200);
    return monthlyFRA * (1 - reduction) * 12;
  }
  // Delayed credits
  const yearsLate = claimAge - 67;
  return monthlyFRA * (1 + 0.08 * yearsLate) * 12;
}

export default function SSComparison({ monthlyBenefitFRA, quartersEarned, theme }: SSComparisonProps) {
  const colors = chartColors[theme];

  const lineColors = {
    62: colors.negative,
    67: colors.neutral,
    70: colors.positive,
  };

  const { data, breakevens } = useMemo(() => {
    const ages = [62, 67, 70] as const;
    const annuals = Object.fromEntries(
      ages.map((a) => [a, computeSSBenefit(monthlyBenefitFRA, a)]),
    ) as Record<62 | 67 | 70, number>;

    const rows: Array<{ age: number; claim62: number | null; claim67: number | null; claim70: number | null }> = [];
    const cumulative = { 62: 0, 67: 0, 70: 0 };
    const be: Array<{ age: number; value: number; label: string }> = [];

    for (let age = 62; age <= 85; age++) {
      for (const ca of ages) {
        if (age >= ca) cumulative[ca] += annuals[ca];
      }
      rows.push({
        age,
        claim62: age >= 62 ? cumulative[62] : null,
        claim67: age >= 67 ? cumulative[67] : null,
        claim70: age >= 70 ? cumulative[70] : null,
      });
    }

    // Find breakeven points (where later claiming overtakes earlier)
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      if (prev.claim67 !== null && prev.claim62 !== null && curr.claim67! >= curr.claim62! && prev.claim67! < prev.claim62!) {
        be.push({ age: curr.age, value: curr.claim67!, label: "67 beats 62" });
      }
      if (prev.claim70 !== null && prev.claim67 !== null && curr.claim70! >= curr.claim67! && prev.claim70! < prev.claim67!) {
        be.push({ age: curr.age, value: curr.claim70!, label: "70 beats 67" });
      }
    }

    return { data: rows, breakevens: be };
  }, [monthlyBenefitFRA]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-lg"
        style={{ backgroundColor: colors.background, borderColor: colors.gridLines, color: colors.text }}
      >
        <p className="font-semibold">Age {label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.stroke }}>
            {p.name}: {p.value !== null ? formatDollar(p.value) : "N/A"}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />
          <XAxis dataKey="age" stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} />
          <YAxis stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} tickFormatter={formatDollar} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: colors.text, fontSize: 12 }} />

          <Line
            name="Claim at 62"
            type="monotone"
            dataKey="claim62"
            stroke={lineColors[62]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            animationDuration={800}
          />
          <Line
            name="Claim at 67"
            type="monotone"
            dataKey="claim67"
            stroke={lineColors[67]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            animationDuration={800}
            animationBegin={200}
          />
          <Line
            name="Claim at 70"
            type="monotone"
            dataKey="claim70"
            stroke={lineColors[70]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            animationDuration={800}
            animationBegin={400}
          />

          {breakevens.map((be, i) => (
            <ReferenceDot
              key={i}
              x={be.age}
              y={be.value}
              r={5}
              fill={colors.text}
              stroke={colors.text}
              label={{
                value: be.label,
                fill: colors.textMuted,
                fontSize: 10,
                position: "top",
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
