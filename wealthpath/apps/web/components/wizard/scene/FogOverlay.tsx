"use client";

import { motion } from "framer-motion";

interface FogOverlayProps {
  opacity: number; // 0 = clear, 1 = fully fogged
  width?: number;
  height?: number;
  x?: number;
}

export default function FogOverlay({
  opacity,
  width = 400,
  height = 300,
  x = 0,
}: FogOverlayProps) {
  return (
    <motion.g
      animate={{ opacity }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <defs>
        <filter id="fog-blur">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <linearGradient id="fog-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#1a1a2e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={0}
        width={width}
        height={height}
        fill="url(#fog-gradient)"
        filter="url(#fog-blur)"
      />
      {/* Fog wisps */}
      <motion.ellipse
        cx={x + width * 0.3}
        cy={height * 0.3}
        rx={width * 0.4}
        ry={30}
        fill="#1a1a2e"
        opacity={0.4}
        animate={{
          cx: [x + width * 0.3, x + width * 0.35, x + width * 0.3],
          ry: [30, 35, 30],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.ellipse
        cx={x + width * 0.6}
        cy={height * 0.6}
        rx={width * 0.3}
        ry={25}
        fill="#1a1a2e"
        opacity={0.3}
        animate={{
          cx: [x + width * 0.6, x + width * 0.55, x + width * 0.6],
          ry: [25, 30, 25],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  );
}
