"use client";

import { useState, useEffect } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import { DEFAULT_PLAN } from "@wealthpath/engine";
import OnboardingWizard from "@/components/horizon/OnboardingWizard";
import QuickSetup from "@/components/velocity/QuickSetup";

export default function OnboardingPage() {
  const [tab, setTab] = useState<"guided" | "quick">("guided");
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const setPlan = usePlanStore((s) => s.setPlan);

  useEffect(() => {
    if (!plan) {
      setPlan({
        ...DEFAULT_PLAN,
        id: crypto.randomUUID(),
        mode: "horizon",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [plan, setPlan]);

  return (
    <div>
      <div className="mb-6 flex justify-center gap-2">
        {([["guided", "Guided Setup"], ["quick", "Quick Setup"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === key ? theme.primary : `${theme.textMuted}10`,
              color: tab === key ? "#fff" : theme.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "guided" ? <OnboardingWizard /> : <QuickSetup />}
    </div>
  );
}
