"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { accountColors, chartColors, formatDollar, type Theme } from "./chartColors";
import type { YearResult } from "@wealthpath/engine";

interface AccountCompositionProps {
  years: YearResult[];
  theme: Theme;
}

const MILESTONE_AGES = [45, 50, 55, 60, 65, 70, 75, 80];

export default function AccountComposition({ years, theme }: AccountCompositionProps) {
  const colors = chartColors[theme];
  const acctColors = accountColors[theme];

  const data = useMemo(() => {
    return MILESTONE_AGES.map((age) => {
      const y = years.find((yr) => yr.age === age);
      if (!y) return null;
      return {
        age: `Age ${age}`,
        "Trad 401k": y.traditional401k,
        "Roth 401k": y.roth401k,
        "Trad IRA": y.traditionalIRA,
        "Roth IRA": y.rothIRA,
        Portfolio: y.privatePortfolio,
        "529": y.plan529,
        Foreign: y.foreignPension,
      };
    }).filter(Boolean);
  }, [years]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value ?? 0), 0);
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-lg"
        style={{ backgroundColor: colors.background, borderColor: colors.gridLines, color: colors.text }}
      >
        <p className="font-semibold">{label}</p>
        <p className="mb-1">Total: {formatDollar(total)}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.fill }}>
            {p.dataKey}: {formatDollar(p.value)}
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
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />
          <XAxis dataKey="age" stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} />
          <YAxis stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} tickFormatter={formatDollar} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: colors.text, fontSize: 11 }} />

          <Bar dataKey="Trad 401k" stackId="a" fill={acctColors.trad401k} animationDuration={600} />
          <Bar dataKey="Roth 401k" stackId="a" fill={acctColors.roth401k} animationDuration={600} animationBegin={50} />
          <Bar dataKey="Trad IRA" stackId="a" fill={acctColors.tradIRA} animationDuration={600} animationBegin={100} />
          <Bar dataKey="Roth IRA" stackId="a" fill={acctColors.rothIRA} animationDuration={600} animationBegin={150} />
          <Bar dataKey="Portfolio" stackId="a" fill={acctColors.portfolio} animationDuration={600} animationBegin={200} />
          <Bar dataKey="529" stackId="a" fill={acctColors.plan529} animationDuration={600} animationBegin={250} />
          <Bar dataKey="Foreign" stackId="a" fill={acctColors.foreign} animationDuration={600} animationBegin={300} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
