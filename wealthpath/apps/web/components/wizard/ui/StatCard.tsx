"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  formatFn?: (v: number) => string;
}

export default function StatCard({
  label,
  value,
  prefix = "$",
  suffix = "",
  delay = 0,
  formatFn,
}: StatCardProps) {
  return (
    <motion.div
      className="rounded-xl border border-gray-700/50 bg-gray-800/60 p-4 text-center backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-2xl font-bold text-white"
        formatFn={formatFn}
        duration={1.2}
      />
    </motion.div>
  );
}
