"use client";

import { motion } from "framer-motion";

interface CloudsProps {
  width?: number;
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.15, 0.25, 0.15],
        x: [x, x + 15, x],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        <ellipse cx="0" cy="0" rx="30" ry="12" fill="white" opacity="0.2" />
        <ellipse cx="-15" cy="3" rx="20" ry="10" fill="white" opacity="0.15" />
        <ellipse cx="15" cy="4" rx="22" ry="9" fill="white" opacity="0.15" />
      </g>
    </motion.g>
  );
}

export default function Clouds({ width = 800 }: CloudsProps) {
  return (
    <g>
      <Cloud x={width * 0.15} y={30} scale={1} />
      <Cloud x={width * 0.45} y={50} scale={0.7} />
      <Cloud x={width * 0.75} y={25} scale={0.85} />
    </g>
  );
}
