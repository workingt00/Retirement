"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ComposedChart,
} from "recharts";
import { motion } from "framer-motion";
import { chartColors, formatDollar, type Theme } from "./chartColors";
import type { YearResult } from "@wealthpath/engine";

interface SensitivityFanProps {
  years: YearResult[];
  theme: Theme;
}

export default function SensitivityFan({ years, theme }: SensitivityFanProps) {
  const colors = chartColors[theme];

  const data = useMemo(
    () =>
      years.map((y) => ({
        age: y.age,
        base: y.totalNetWorth,
        bear: y.bearNetWorth,
        bull: y.bullNetWorth,
        // For the shaded band area between bear and bull
        band: [y.bearNetWorth, y.bullNetWorth],
      })),
    [years],
  );

  const bearFailureAge = useMemo(() => {
    const fail = years.find((y) => y.bearStatus === "FAIL");
    return fail?.age ?? null;
  }, [years]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const bearDelta = d.bear - d.base;
    const bullDelta = d.bull - d.base;
    return (
      <div
        className="rounded-lg border px-3 py-2 text-sm shadow-lg"
        style={{ backgroundColor: colors.background, borderColor: colors.gridLines, color: colors.text }}
      >
        <p className="font-semibold">Age {label}</p>
        <p style={{ color: colors.base }}>Base: {formatDollar(d.base)}</p>
        <p style={{ color: colors.bear }}>
          Bear: {formatDollar(d.bear)} ({formatDollar(bearDelta)})
        </p>
        <p style={{ color: colors.bull }}>
          Bull: {formatDollar(d.bull)} (+{formatDollar(bullDelta)})
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
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridLines} />
          <XAxis dataKey="age" stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} />
          <YAxis stroke={colors.textMuted} tick={{ fill: colors.textMuted, fontSize: 12 }} tickFormatter={formatDollar} />
          <Tooltip content={<CustomTooltip />} />

          {/* Shaded band between bear and bull */}
          <Area
            type="monotone"
            dataKey="bull"
            fill={colors.base}
            fillOpacity={0.1}
            stroke="none"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="bear"
            fill={colors.background}
            fillOpacity={1}
            stroke="none"
            animationDuration={800}
          />

          {/* Lines */}
          <Line
            type="monotone"
            dataKey="bear"
            stroke={colors.bear}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="base"
            stroke={colors.base}
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="bull"
            stroke={colors.bull}
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            animationDuration={800}
          />

          {bearFailureAge !== null && (
            <ReferenceDot
              x={bearFailureAge}
              y={0}
              r={6}
              fill={colors.bear}
              stroke={colors.bear}
              label={{
                value: `Bear failure: age ${bearFailureAge}`,
                fill: colors.bear,
                fontSize: 11,
                position: "top",
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
