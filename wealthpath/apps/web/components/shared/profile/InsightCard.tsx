"use client";

import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";

interface InsightCardProps {
  icon?: "sparkle" | "chart" | "info" | "target";
  variant?: "info" | "success" | "neutral";
  children: React.ReactNode;
}

const ICONS: Record<string, React.ReactNode> = {
  sparkle: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
  chart: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  target: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function getVariantColors(variant: string, theme: { primary: string; textMuted: string; gradientFrom: string; gradientTo: string }) {
  switch (variant) {
    case "success":
      return { bg: "#10B98108", borderFrom: "#10B981", borderTo: "#22C55E", iconColor: "#10B981" };
    case "info":
      return { bg: `${theme.primary}08`, borderFrom: theme.gradientFrom, borderTo: theme.gradientTo, iconColor: theme.primary };
    default:
      return { bg: `${theme.textMuted}06`, borderFrom: `${theme.textMuted}60`, borderTo: `${theme.textMuted}30`, iconColor: theme.textMuted };
  }
}

export default function InsightCard({ icon = "info", variant = "info", children }: InsightCardProps) {
  const { theme } = useMode();
  const colors = getVariantColors(variant, theme);

  return (
    <motion.div
      className="relative flex items-start gap-3 overflow-hidden rounded-xl p-4 pl-6"
      style={{
        backgroundColor: colors.bg,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${colors.borderFrom}15`,
      }}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Gradient left accent stripe */}
      <div
        className="absolute bottom-0 left-0 top-0 w-[3px]"
        style={{
          background: `linear-gradient(180deg, ${colors.borderFrom}, ${colors.borderTo})`,
        }}
      />
      <span
        style={{
          color: colors.iconColor,
          filter: `drop-shadow(0 0 6px ${colors.iconColor}40)`,
        }}
        className="mt-0.5 shrink-0"
      >
        {ICONS[icon]}
      </span>
      <div className="text-sm" style={{ color: theme.text }}>
        {children}
      </div>
    </motion.div>
  );
}
