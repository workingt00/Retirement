"use client";

import { motion } from "framer-motion";

interface HobbyItemsProps {
  x: number;
  y: number;
  level: number; // 0-1
}

function Easel({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      {/* Legs */}
      <line x1={x - 6} y1={y} x2={x - 3} y2={y - 25} stroke="#8B6914" strokeWidth={2} />
      <line x1={x + 6} y1={y} x2={x + 3} y2={y - 25} stroke="#8B6914" strokeWidth={2} />
      <line x1={x} y1={y} x2={x} y2={y - 18} stroke="#8B6914" strokeWidth={2} />
      {/* Canvas */}
      <rect x={x - 8} y={y - 30} width={16} height={12} fill="#FFF7ED" rx={1} />
      {/* Art splotches */}
      <circle cx={x - 3} cy={y - 26} r={2} fill="#EF4444" opacity={0.7} />
      <circle cx={x + 3} cy={y - 23} r={2.5} fill="#3B82F6" opacity={0.7} />
      <circle cx={x} cy={y - 25} r={1.5} fill="#F59E0B" opacity={0.7} />
    </motion.g>
  );
}

function GolfClub({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <line x1={x} y1={y} x2={x + 2} y2={y - 28} stroke="#A8A29E" strokeWidth={2} />
      <rect x={x - 1} y={y - 30} width={6} height={3} fill="#78716C" rx={1} />
    </motion.g>
  );
}

function Book({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <rect x={x - 5} y={y - 8} width={10} height={8} fill="#7C3AED" rx={1} />
      <rect x={x - 5} y={y - 8} width={1.5} height={8} fill="#6D28D9" />
      <rect x={x - 2} y={y - 6} width={5} height={1} fill="#DDD6FE" rx={0.5} />
      <rect x={x - 2} y={y - 4} width={4} height={1} fill="#DDD6FE" rx={0.5} />
    </motion.g>
  );
}

export default function HobbyItems({ x, y, level }: HobbyItemsProps) {
  return (
    <g>
      {level > 0.2 && <Book x={x} y={y} />}
      {level > 0.5 && <Easel x={x + 20} y={y} />}
      {level > 0.7 && <GolfClub x={x - 15} y={y} />}
    </g>
  );
}
