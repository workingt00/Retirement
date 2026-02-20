"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TabCompletionBurstProps {
  /** Set to a unique key (e.g., tab name) to trigger the burst */
  trigger: string | null;
}

const PARTICLE_COUNT = 6;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function TabCompletionBurst({ trigger }: TabCompletionBurstProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string; size: number }>
  >([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ["#10B981", "#22C55E", "#34D399", "#6EE7B7", "#F59E0B", "#FBBF24"];
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: Date.now() + i,
      x: randomBetween(-30, 30),
      y: randomBetween(-30, -10),
      color: colors[i % colors.length],
      size: randomBetween(4, 7),
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute"
          style={{
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}
