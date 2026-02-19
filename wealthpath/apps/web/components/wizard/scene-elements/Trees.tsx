"use client";

import { motion } from "framer-motion";

interface TreesProps {
  x: number;
  y: number;
  count?: number;
  scale?: number;
}

function Tree({
  x,
  y,
  height,
  delay,
}: {
  x: number;
  y: number;
  height: number;
  delay: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.6, delay }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      {/* Trunk */}
      <rect
        x={x - 3}
        y={y - height * 0.4}
        width={6}
        height={height * 0.4}
        fill="#8B6914"
        rx={2}
      />
      {/* Foliage layers */}
      <ellipse
        cx={x}
        cy={y - height * 0.55}
        rx={height * 0.22}
        ry={height * 0.2}
        fill="#166534"
      />
      <ellipse
        cx={x}
        cy={y - height * 0.7}
        rx={height * 0.17}
        ry={height * 0.18}
        fill="#15803D"
      />
      <ellipse
        cx={x}
        cy={y - height * 0.85}
        rx={height * 0.11}
        ry={height * 0.13}
        fill="#22C55E"
        opacity={0.8}
      />
    </motion.g>
  );
}

export default function Trees({ x, y, count = 2, scale = 1 }: TreesProps) {
  const trees = Array.from({ length: count }, (_, i) => ({
    offsetX: (i - (count - 1) / 2) * 30 * scale,
    height: (50 + Math.random() * 20) * scale,
    delay: 0.3 + i * 0.15,
  }));

  return (
    <g>
      {trees.map((tree, i) => (
        <Tree
          key={i}
          x={x + tree.offsetX}
          y={y}
          height={tree.height}
          delay={tree.delay}
        />
      ))}
    </g>
  );
}
