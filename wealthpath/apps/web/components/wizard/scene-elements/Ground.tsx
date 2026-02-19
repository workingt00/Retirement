"use client";

import { motion } from "framer-motion";

interface GroundProps {
  y: number;
  width?: number;
  height?: number;
  color?: string;
}

export default function Ground({
  y,
  width = 800,
  height = 80,
  color = "#2D5016",
}: GroundProps) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <defs>
        <linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#1a3a0a" />
        </linearGradient>
      </defs>
      <ellipse
        cx={width / 2}
        cy={y + 10}
        rx={width * 0.55}
        ry={height * 0.5}
        fill="url(#ground-grad)"
      />
    </motion.g>
  );
}
