"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { chartColors, formatDollar, type Theme } from "./chartColors";
import type { YearResult } from "@wealthpath/engine";

interface NetWorthChartProps {
  years: YearResult[];
  retirementAge: number;
  firstFailureAge: number | null;
  theme: Theme;
  onYearClick?: (age: number) => void;
}

export default function NetWorthChart({
  years,
  retirementAge,
  firstFailureAge,
  theme,
  onYearClick,
}: NetWorthChartProps) {
  const colors = chartColors[theme];

  const data = useMemo(
    () =>
      years.map((y) => ({
        age: y.age,
        taxDeferred: y.traditional401k + (y.traditionalIRA ?? 0),
        taxFree: y.roth401k + y.rothIRA + y.privatePortfolio,
        other: y.plan529 + y.foreignPension,
        total: y.totalNetWorth,
        status: y.status,
        cashFlow: y.annualCashFlow,
      })),
    [years],
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-lg"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.gridLines,
          color: colors.text,
        }}
      >
        <p className="font-semibold">Age {label}</p>
        <p>Total: {formatDollar(d.total)}</p>
        <p style={{ color: colors.taxDeferred }}>Tax-Deferred: {formatDollar(d.taxDeferred)}</p>
        <p style={{ color: colors.taxFree }}>Tax-Free: {formatDollar(d.taxFree)}</p>
        <p style={{ color: colors.other }}>Other: {formatDollar(d.other)}</p>
        <p className="mt-1">
          Cash Flow: <span style={{ color: d.cashFlow >= 0 ? colors.positive : colors.negative }}>{formatDollar(d.cashFlow)}</span>
        </p>
        {d.status === "FAIL" && <p style={{ color: colors.negative }} className="font-bold">Shortfall</p>}
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
        <AreaChart
          data={data}
          onClick={(e) => {
            if (e?.activeLabel && onYearClick) onYearClick(Number(e.activeLabel));
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />
          <XAxis
            dataKey="age"
            stroke={colors.textMuted}
            tick={{ fill: colors.textMuted, fontSize: 12 }}
          />
          <YAxis
            stroke={colors.textMuted}
            tick={{ fill: colors.textMuted, fontSize: 12 }}
            tickFormatter={formatDollar}
          />
          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine
            x={retirementAge}
            stroke={colors.textMuted}
            strokeDasharray="5 5"
            label={{ value: "Retire", fill: colors.text, fontSize: 12, position: "top" }}
          />

          {firstFailureAge !== null && (
            <ReferenceLine
              x={firstFailureAge}
              stroke={colors.negative}
              strokeDasharray="5 5"
              label={{ value: "⚠️ Shortfall", fill: colors.negative, fontSize: 12, position: "top" }}
            />
          )}

          <Area
            type="monotone"
            dataKey="other"
            stackId="1"
            fill={colors.other}
            stroke={colors.other}
            fillOpacity={0.7}
            animationDuration={800}
            animationBegin={400}
          />
          <Area
            type="monotone"
            dataKey="taxFree"
            stackId="1"
            fill={colors.taxFree}
            stroke={colors.taxFree}
            fillOpacity={0.7}
            animationDuration={800}
            animationBegin={200}
          />
          <Area
            type="monotone"
            dataKey="taxDeferred"
            stackId="1"
            fill={colors.taxDeferred}
            stroke={colors.taxDeferred}
            fillOpacity={0.7}
            animationDuration={800}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
