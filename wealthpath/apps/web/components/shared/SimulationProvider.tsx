"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { simulate, solveGoal, detectConflicts } from "@wealthpath/engine";
import type { SimulationResult, GoalSolverResult } from "@wealthpath/engine";
import { usePlanStore } from "@/stores/planStore";

interface SimulationContextValue {
  result: SimulationResult | null;
  goalResult: GoalSolverResult | null;
  conflicts: Array<{ moveId: string; conflictsWith: string }>;
}

const SimulationContext = createContext<SimulationContextValue>({
  result: null,
  goalResult: null,
  conflicts: [],
});

export function SimulationProvider({ children }: { children: ReactNode }) {
  const plan = usePlanStore((s) => s.plan);

  const result = useMemo(() => {
    if (!plan) return null;
    try {
      return simulate(plan);
    } catch {
      return null;
    }
  }, [plan]);

  const goalResult = useMemo(() => {
    if (!plan) return null;
    try {
      return solveGoal(plan);
    } catch {
      return null;
    }
  }, [plan]);

  const conflicts = useMemo(() => {
    if (!plan) return [];
    try {
      return detectConflicts(plan.moves);
    } catch {
      return [];
    }
  }, [plan]);

  return (
    <SimulationContext.Provider value={{ result, goalResult, conflicts }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  return useContext(SimulationContext);
}
