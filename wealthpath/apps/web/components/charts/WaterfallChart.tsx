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
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { chartColors, formatDollar, type Theme } from "./chartColors";
import type { YearResult } from "@wealthpath/engine";

interface WaterfallChartProps {
  year: YearResult;
  simplified?: boolean;
  theme: Theme;
}

interface WaterfallBar {
  name: string;
  value: number;
  start: number;
  end: number;
  isResult?: boolean;
}

function buildFullBars(y: YearResult): WaterfallBar[] {
  const bars: WaterfallBar[] = [];
  let running = 0;

  const add = (name: string, value: number, isResult = false) => {
    const start = running;
    running += value;
    bars.push({ name, value, start, end: running, isResult });
  };

  add("W2 Income", y.w2Income);
  add("Other Income", y.w9Income + y.otherIncome);
  add("Social Security", y.socialSecurity);
  add("Withdrawals", y.portfolioSellAmount);
  add("Federal Tax", -y.federalTax);
  add("State Tax", -y.stateTax);
  add("Housing", -y.housing);
  add("Living", -(y.groceries + y.bills + y.lifestyle + y.miscellaneous));
  add("Medical", -y.medical);

  // Net result
  const netCash = y.annualCashFlow;
  bars.push({ name: "Net Cash Flow", value: netCash, start: 0, end: netCash, isResult: true });

  return bars;
}

function buildSimplifiedBars(y: YearResult): WaterfallBar[] {
  const bars: WaterfallBar[] = [];
  let running = 0;

  const add = (name: string, value: number, isResult = false) => {
    const start = running;
    running += value;
    bars.push({ name, value, start, end: running, isResult });
  };

  add("Total Income", y.totalIncome + y.portfolioSellAmount);
  add("Total Taxes", -y.totalTax);
  add("Total Expenses", -y.totalExpenses);

  const whatsLeft = y.annualCashFlow;
  bars.push({ name: "What's Left", value: whatsLeft, start: 0, end: whatsLeft, isResult: true });

  return bars;
}

export default function WaterfallChart({ year, simplified = false, theme }: WaterfallChartProps) {
  const colors = chartColors[theme];

  const data = useMemo(() => {
    const bars = simplified ? buildSimplifiedBars(year) : buildFullBars(year);
    return bars.map((b) => ({
      name: b.name,
      // For stacked invisible + visible bar trick
      invisible: b.isResult ? 0 : Math.min(b.start, b.end),
      visible: Math.abs(b.value),
      value: b.value,
      isResult: b.isResult,
    }));
  }, [year, simplified]);

  const getBarColor = (entry: any) => {
    if (entry.isResult) return entry.value >= 0 ? colors.base : colors.negative;
    return entry.value >= 0 ? colors.positive : colors.negative;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-lg"
        style={{ backgroundColor: colors.background, borderColor: colors.gridLines, color: colors.text }}
      >
        <p className="font-semibold">{d.name}</p>
        <p style={{ color: d.value >= 0 ? colors.positive : colors.negative }}>
          {d.value >= 0 ? "+" : ""}{formatDollar(d.value)}
        </p>
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
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />
          <XAxis
            dataKey="name"
            stroke={colors.textMuted}
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke={colors.textMuted}
            tick={{ fill: colors.textMuted, fontSize: 12 }}
            tickFormatter={formatDollar}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke={colors.textMuted} />

          {/* Invisible spacer bar */}
          <Bar dataKey="invisible" stackId="waterfall" fill="transparent" animationDuration={0} />
          {/* Visible bar on top */}
          <Bar dataKey="visible" stackId="waterfall" animationDuration={600}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
