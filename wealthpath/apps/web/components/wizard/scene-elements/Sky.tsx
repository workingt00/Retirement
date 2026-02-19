"use client";

import { motion } from "framer-motion";

interface SkyProps {
  phase: "dawn" | "morning" | "golden";
  width?: number;
  height?: number;
}

const SKY_GRADIENTS = {
  dawn: { top: "#1a1a2e", mid: "#2d1b4e", bottom: "#4a2066" },
  morning: { top: "#1e3a5f", mid: "#c2956b", bottom: "#f4a261" },
  golden: { top: "#1a6fa0", mid: "#4a9fd4", bottom: "#87CEEB" },
};

export default function Sky({ phase, width = 800, height = 300 }: SkyProps) {
  const colors = SKY_GRADIENTS[phase];
  const gradientId = `sky-gradient-${phase}`;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <motion.stop
            offset="0%"
            animate={{ stopColor: colors.top }}
            transition={{ duration: 1.5 }}
          />
          <motion.stop
            offset="50%"
            animate={{ stopColor: colors.mid }}
            transition={{ duration: 1.5 }}
          />
          <motion.stop
            offset="100%"
            animate={{ stopColor: colors.bottom }}
            transition={{ duration: 1.5 }}
          />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${gradientId})`} />
    </motion.g>
  );
}
