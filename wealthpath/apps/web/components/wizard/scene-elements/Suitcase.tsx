"use client";

import { motion } from "framer-motion";

interface SuitcaseProps {
  x: number;
  y: number;
  visible: boolean;
}

export default function Suitcase({ x, y, visible }: SuitcaseProps) {
  if (!visible) return null;

  return (
    <motion.g
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.6 }}
    >
      {/* Handle */}
      <rect x={x - 2} y={y - 18} width={4} height={5} fill="#A8A29E" rx={1} />
      <rect x={x - 4} y={y - 20} width={8} height={3} fill="#A8A29E" rx={1.5} />
      {/* Body */}
      <rect x={x - 9} y={y - 13} width={18} height={13} fill="#3B82F6" rx={2} />
      {/* Straps */}
      <rect x={x - 9} y={y - 8} width={18} height={2} fill="#2563EB" />
      <rect x={x - 9} y={y - 4} width={18} height={2} fill="#2563EB" />
      {/* Sticker */}
      <circle cx={x + 4} cy={y - 6} r={2.5} fill="#FBBF24" />
    </motion.g>
  );
}
