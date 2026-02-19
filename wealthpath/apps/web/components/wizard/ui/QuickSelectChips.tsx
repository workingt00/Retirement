"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "../utils/formatCurrency";

interface QuickSelectChipsProps {
  values: number[];
  onSelect: (value: number) => void;
  selectedValue: number | null;
  formatFn?: (v: number) => string;
}

export default function QuickSelectChips({
  values,
  onSelect,
  selectedValue,
  formatFn,
}: QuickSelectChipsProps) {
  const format = formatFn ?? formatCurrency;

  return (
    <motion.div
      className="mt-3 flex flex-wrap gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      role="group"
      aria-label="Quick select values"
    >
      {values.map((val, i) => {
        const isSelected = selectedValue === val;
        return (
          <motion.button
            key={val}
            type="button"
            onClick={() => onSelect(val)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isSelected
                ? "bg-amber-500 text-gray-900"
                : "border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-amber-500/50 hover:text-white"
            }`}
            style={{ minHeight: "40px" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={isSelected}
          >
            {format(val)}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
