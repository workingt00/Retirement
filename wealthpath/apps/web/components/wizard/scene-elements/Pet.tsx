"use client";

import { motion } from "framer-motion";

interface PetProps {
  x: number;
  y: number;
  visible: boolean;
}

export default function Pet({ x, y, visible }: PetProps) {
  if (!visible) return null;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
    >
      {/* Dog body */}
      <ellipse cx={x} cy={y - 5} rx={10} ry={6} fill="#D4A574" />
      {/* Head */}
      <circle cx={x + 10} cy={y - 10} r={6} fill="#D4A574" />
      {/* Ear */}
      <ellipse cx={x + 14} cy={y - 14} rx={3} ry={5} fill="#B8860B" />
      {/* Eye */}
      <circle cx={x + 12} cy={y - 11} r={1.2} fill="#1A1A1A" />
      {/* Nose */}
      <circle cx={x + 15} cy={y - 9} r={1} fill="#1A1A1A" />
      {/* Tail */}
      <motion.path
        d={`M${x - 9} ${y - 7} Q${x - 15} ${y - 18} ${x - 12} ${y - 20}`}
        stroke="#D4A574"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        animate={{ d: [
          `M${x - 9} ${y - 7} Q${x - 15} ${y - 18} ${x - 12} ${y - 20}`,
          `M${x - 9} ${y - 7} Q${x - 17} ${y - 16} ${x - 15} ${y - 18}`,
          `M${x - 9} ${y - 7} Q${x - 15} ${y - 18} ${x - 12} ${y - 20}`,
        ]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Legs */}
      <rect x={x - 6} y={y - 1} width={2} height={5} fill="#C19A6B" rx={1} />
      <rect x={x + 4} y={y - 1} width={2} height={5} fill="#C19A6B" rx={1} />
    </motion.g>
  );
}
