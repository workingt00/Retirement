"use client";

import { useState, useCallback } from "react";
import type { Scenario, SimulationResult } from "@wealthpath/engine";
import { usePlanStore } from "@/stores/planStore";
import { simulate } from "@wealthpath/engine";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const plan = usePlanStore((s) => s.plan);

  const saveScenario = useCallback(
    (name: string) => {
      if (!plan) return;
      const result = simulate(plan);
      const scenario: Scenario = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date(),
        config: { ...plan },
        result,
      };
      setScenarios((prev) => [...prev, scenario]);
      return scenario;
    },
    [plan],
  );

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const compare = useCallback(
    (current: SimulationResult) => {
      return scenarios.map((s) => ({
        scenarioId: s.id,
        deltaNWAt80: current.summary.netWorthAt80 - s.result.summary.netWorthAt80,
        deltaTotalTaxes: current.summary.totalTaxesPaid - s.result.summary.totalTaxesPaid,
        deltaFailYears: current.summary.totalFailYears - s.result.summary.totalFailYears,
        verdict: (
          current.summary.netWorthAt80 > s.result.summary.netWorthAt80 + 10000
            ? "better"
            : current.summary.netWorthAt80 < s.result.summary.netWorthAt80 - 10000
              ? "worse"
              : "similar"
        ) as "better" | "worse" | "similar",
      }));
    },
    [scenarios],
  );

  return { scenarios, saveScenario, removeScenario, compare };
}
