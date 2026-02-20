"use client";

import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";

interface GlassCardProps {
  children: React.ReactNode;
  hover?: boolean;
  gradient?: boolean;
  padding?: string;
  className?: string;
}

export default function GlassCard({
  children,
  hover = false,
  gradient = false,
  padding = "p-6",
  className = "",
}: GlassCardProps) {
  const { theme } = useMode();

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${padding} ${className}`}
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.borderGlass}`,
        boxShadow: theme.shadowCard,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={
        hover
          ? {
              boxShadow: theme.shadowCardHover,
              scale: 1.005,
            }
          : undefined
      }
    >
      {gradient && (
        <div
          className="absolute left-0 right-0 top-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
