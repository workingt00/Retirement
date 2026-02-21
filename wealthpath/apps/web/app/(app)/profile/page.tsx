"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { useProfileCompletion } from "@/components/shared/profile/ProfileCompletion";
import ProjectionPulse from "@/components/shared/profile/ProjectionPulse";
import GlassCard from "@/components/shared/profile/GlassCard";
import AmbientGlow from "@/components/shared/profile/AmbientGlow";
import ProfilePersonalTab from "@/components/shared/profile/ProfilePersonalTab";
import ProfileIncomeTab from "@/components/shared/profile/ProfileIncomeTab";
import ProfileAccountsTab from "@/components/shared/profile/ProfileAccountsTab";
import ProfileTaxesTab from "@/components/shared/profile/ProfileTaxesTab";
import ProfileBenefitsTab from "@/components/shared/profile/ProfileBenefitsTab";
import ProfileExpensesRiskTab from "@/components/shared/profile/ProfileExpensesRiskTab";

const TABS = [
  { key: "personal" as const, label: "Personal", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
  { key: "income" as const, label: "Income", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "accounts" as const, label: "Accounts", icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" },
  { key: "taxes" as const, label: "Taxes", icon: "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { key: "benefits" as const, label: "Benefits", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  { key: "expenses" as const, label: "Expenses & Risk", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" },
] as const;

type TabKey = typeof TABS[number]["key"];

function TabProgressRing({ progress, size = 18 }: { progress: number; size?: number }) {
  const { theme } = useMode();
  const r = (size - 3) / 2;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * progress;
  const isComplete = progress >= 1;

  return (
    <svg width={size} height={size} className="shrink-0">
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={theme.gradientFrom} />
          <stop offset="100%" stopColor={theme.gradientTo} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={`${theme.textMuted}20`} strokeWidth={2}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={isComplete ? "#10B981" : "url(#progressGrad)"}
        strokeWidth={2} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={circumference - filled}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        animate={{ strokeDashoffset: circumference - filled }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {isComplete && (
        <motion.path
          d={`M${size * 0.3} ${size * 0.5} L${size * 0.45} ${size * 0.65} L${size * 0.7} ${size * 0.35}`}
          fill="none" stroke="#10B981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      )}
    </svg>
  );
}

export default function ProfilePage() {
  const { theme } = useMode();
  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const { tabCompletion } = useProfileCompletion();

  return (
    <div className="relative">
      <AmbientGlow />

      {/* Header with gradient text */}
      <motion.h1
        className="mb-1 text-2xl font-bold"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Your Financial Profile
      </motion.h1>
      <motion.p
        className="mb-6 text-sm"
        style={{ color: theme.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        Fill in your details and watch your projection update in real time
      </motion.p>

      {/* Mobile: compact projection bar */}
      <div className="mb-4 md:hidden">
        <ProjectionPulse compact activeTab={activeTab} />
      </div>

      {/* Tab navigation — glassmorphic pill bar */}
      <motion.div
        className="relative mb-6 flex flex-wrap gap-1 rounded-2xl p-1.5"
        style={{
          backgroundColor: theme.surfaceGlass,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${theme.borderGlass}`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const completion = tabCompletion[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                color: isActive ? theme.text : theme.textMuted,
              }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)`,
                    border: `1px solid ${theme.gradientFrom}30`,
                    boxShadow: theme.glowPrimary,
                  }}
                  layoutId="activeTabBg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <TabProgressRing progress={completion} />
                <svg className="hidden h-4 w-4 sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left: Tab content */}
        <div className="min-w-0 flex-1">
          <GlassCard>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "personal" && <ProfilePersonalTab />}
                {activeTab === "income" && <ProfileIncomeTab />}
                {activeTab === "accounts" && <ProfileAccountsTab />}
                {activeTab === "taxes" && <ProfileTaxesTab />}
                {activeTab === "benefits" && <ProfileBenefitsTab />}
                {activeTab === "expenses" && <ProfileExpensesRiskTab />}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Right: Projection Pulse (desktop only) */}
        <div className="hidden w-72 shrink-0 md:block lg:w-80">
          <div className="sticky top-6">
            <ProjectionPulse activeTab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
