"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface SunProps {
  x: number;
  y: number;
  brightness?: number; // 0-1
  phase?: "dawn" | "morning" | "golden";
  offsetX?: number;
}

export default function Sun({ x, y, brightness = 0.5, phase = "dawn", offsetX = 0 }: SunProps) {
  const springX = useSpring(x + offsetX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    springX.set(x + offsetX);
  }, [x, offsetX, springX]);

  const isMoon = phase === "dawn";
  const size = isMoon ? 22 : 20 + brightness * 20;
  const glowSize = size * 2.5;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
    >
      {/* Moon (visible during dawn) */}
      <motion.g
        animate={{ opacity: isMoon ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        {/* Moon glow */}
        <motion.circle
          cx={springX}
          cy={y}
          r={glowSize * 0.8}
          fill="rgba(200, 210, 230, 0.05)"
          animate={{
            r: [glowSize * 0.8, glowSize * 0.88, glowSize * 0.8],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Moon body (crescent) */}
        <defs>
          <mask id="moon-crescent">
            <motion.circle cx={springX} cy={y} r={22} fill="white" />
            <motion.circle cx={useTransform(springX, v => v + 13)} cy={y - 5} r={18} fill="black" />
          </mask>
        </defs>
        <motion.circle cx={springX} cy={y} r={22} fill="#D1D5DB" mask="url(#moon-crescent)" />
        <motion.circle cx={useTransform(springX, v => v - 5)} cy={y + 3} r={2.5} fill="#B0B8C4" mask="url(#moon-crescent)" opacity={0.5} />
        <motion.circle cx={useTransform(springX, v => v - 2)} cy={y - 6} r={1.8} fill="#B0B8C4" mask="url(#moon-crescent)" opacity={0.4} />
      </motion.g>

      {/* Sun (visible during morning/golden) */}
      <motion.g
        animate={{ opacity: isMoon ? 0 : 1 }}
        transition={{ duration: 1 }}
      >
        {/* Sun glow */}
        <motion.circle
          cx={springX}
          cy={y}
          animate={{
            r: [glowSize, glowSize * 1.1, glowSize],
            fill: phase === "golden"
              ? "rgba(251, 191, 36, 0.12)"
              : "rgba(251, 191, 36, 0.06)",
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx={springX}
          cy={y}
          animate={{
            r: [glowSize * 0.5, glowSize * 0.6, glowSize * 0.5],
            fill: phase === "golden"
              ? "rgba(251, 191, 36, 0.2)"
              : "rgba(251, 191, 36, 0.1)",
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Sun body — grows with brightness */}
        <motion.circle
          cx={springX}
          cy={y}
          animate={{ r: size }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          fill="#FBBF24"
        />
        <motion.circle
          cx={springX}
          cy={y}
          animate={{ r: size * 0.85 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          fill="#FCD34D"
        />
      </motion.g>
    </motion.g>
  );
}
