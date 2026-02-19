"use client";

import { useMemo } from "react";
import { simulate } from "@wealthpath/engine";
import { usePlanStore } from "@/stores/planStore";

export function useImpactPreview(moveId: string) {
  const plan = usePlanStore((s) => s.plan);

  return useMemo(() => {
    if (!plan) return null;
    try {
      const current = simulate(plan);
      const modified = {
        ...plan,
        moves: plan.moves.map((m) =>
          m.id === moveId ? { ...m, enabled: !m.enabled } : m,
        ),
      };
      const alt = simulate(modified);
      return {
        deltaNWAt80:
          alt.summary.netWorthAt80 - current.summary.netWorthAt80,
        deltaFailYears:
          current.summary.totalFailYears - alt.summary.totalFailYears,
        isImprovement:
          alt.summary.netWorthAt80 > current.summary.netWorthAt80,
      };
    } catch {
      return null;
    }
  }, [plan, moveId]);
}
