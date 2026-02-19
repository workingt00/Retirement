"use client";

import { useMemo } from "react";
import { simulate, solveGoal, detectConflicts } from "@wealthpath/engine";
import { usePlanStore } from "@/stores/planStore";

export function useSimulation() {
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

  return { result, goalResult, conflicts };
}
