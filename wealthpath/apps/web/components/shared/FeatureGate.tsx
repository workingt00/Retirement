"use client";

import { useMode } from "./ModeProvider";

interface FeatureGateProps {
  feature: "moveSystem" | "sensitivity" | "cgInsights" | "monteCarlo";
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userTier?: "free" | "pro" | "premium";
}

const FEATURE_TIERS: Record<string, "free" | "pro" | "premium"> = {
  moveSystem: "pro",
  sensitivity: "pro",
  cgInsights: "pro",
  monteCarlo: "premium",
};

export default function FeatureGate({
  feature,
  children,
  fallback,
  userTier = "pro",
}: FeatureGateProps) {
  const { theme } = useMode();
  const requiredTier = FEATURE_TIERS[feature];
  const tierRank = { free: 0, pro: 1, premium: 2 };

  if (tierRank[userTier] >= tierRank[requiredTier]) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      style={{
        borderColor: theme.primary,
        backgroundColor: `${theme.primary}10`,
      }}
    >
      <p className="mb-2 text-sm font-medium" style={{ color: theme.text }}>
        Upgrade to {requiredTier === "premium" ? "Premium" : "Pro"}
      </p>
      <p className="text-xs" style={{ color: theme.textMuted }}>
        This feature requires a {requiredTier} subscription.
      </p>
      <button
        className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: theme.primary }}
      >
        Upgrade Now
      </button>
    </div>
  );
}
