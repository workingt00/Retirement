"use client";

import { useEffect } from "react";
import { usePlanStore } from "@/stores/planStore";
import { DEFAULT_PLAN } from "@wealthpath/engine";

export function usePlan() {
  const { plan, setPlan, updateField, toggleMove, updateMove, isDirty } =
    usePlanStore();

  useEffect(() => {
    // Load plan from server on mount
    fetch("/api/trpc/plan.get")
      .then((r) => r.json())
      .then((data) => {
        if (data?.result?.data) {
          setPlan(data.result.data);
        } else {
          // No saved plan - use defaults
          setPlan({
            ...DEFAULT_PLAN,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      })
      .catch(() => {
        setPlan({
          ...DEFAULT_PLAN,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
  }, [setPlan]);

  return { plan, updateField, toggleMove, updateMove, isDirty };
}
