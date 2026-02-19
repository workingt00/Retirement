"use client";

import { motion } from "framer-motion";

interface WorkspaceProps {
  x: number;
  y: number;
  incomeLevel: number; // 0-1 based on income
  scale?: number;
}

export default function Workspace({ x, y, incomeLevel, scale = 1 }: WorkspaceProps) {
  const s = scale;

  return (
    <motion.g
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Desk */}
      <rect
        x={x - 20 * s}
        y={y - 15 * s}
        width={40 * s}
        height={3 * s}
        fill="#92400E"
        rx={1}
      />
      {/* Desk legs */}
      <rect
        x={x - 18 * s}
        y={y - 12 * s}
        width={3 * s}
        height={12 * s}
        fill="#78350F"
      />
      <rect
        x={x + 15 * s}
        y={y - 12 * s}
        width={3 * s}
        height={12 * s}
        fill="#78350F"
      />

      {/* Laptop */}
      <motion.g
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        {/* Screen */}
        <rect
          x={x - 10 * s}
          y={y - 28 * s}
          width={20 * s}
          height={13 * s}
          fill="#374151"
          rx={1}
        />
        {/* Screen glow */}
        <rect
          x={x - 8 * s}
          y={y - 26 * s}
          width={16 * s}
          height={9 * s}
          fill="#60A5FA"
          opacity={0.3}
          rx={0.5}
        />
        {/* Base */}
        <rect
          x={x - 12 * s}
          y={y - 15.5 * s}
          width={24 * s}
          height={1.5 * s}
          fill="#4B5563"
          rx={0.5}
        />
      </motion.g>

      {/* Building silhouette behind (for higher income) */}
      {incomeLevel > 0.4 && (
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <rect
            x={x + 28 * s}
            y={y - 50 * s * incomeLevel}
            width={15 * s}
            height={50 * s * incomeLevel}
            fill="#475569"
            rx={1}
          />
          {/* Windows on building */}
          {Array.from({ length: Math.floor(incomeLevel * 4) }, (_, i) => (
            <rect
              key={i}
              x={x + 31 * s}
              y={y - (45 - i * 12) * s * incomeLevel}
              width={4 * s}
              height={3 * s}
              fill="#FEF3C7"
              opacity={0.6}
            />
          ))}
        </motion.g>
      )}

      {/* Briefcase (visible at moderate income) */}
      {incomeLevel > 0.3 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <rect
            x={x - 25 * s}
            y={y - 8 * s}
            width={10 * s}
            height={7 * s}
            fill="#92400E"
            rx={1}
          />
          <rect
            x={x - 22 * s}
            y={y - 10 * s}
            width={4 * s}
            height={3 * s}
            fill="#78350F"
            rx={1}
          />
        </motion.g>
      )}
    </motion.g>
  );
}
