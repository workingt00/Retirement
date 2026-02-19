"use client";

import { useEffect } from "react";
import { usePlanStore } from "@/stores/planStore";
import { DEFAULT_PLAN } from "@wealthpath/engine";

export function usePlan() {
  const { plan, setPlan, updateField, toggleMove, updateMove, isDirty } =
    usePlanStore();

  useEffect(() => {
    // Load user's plans from server — use the most recent one
    fetch("/api/trpc/plan.list")
      .then((r) => r.json())
      .then((data) => {
        const plans = data?.result?.data;
        if (plans && plans.length > 0) {
          // Plans are ordered by updatedAt desc — use the first one
          const dbPlan = plans[0];
          const planData = dbPlan.data as unknown as typeof DEFAULT_PLAN;
          setPlan(planData, dbPlan.id);
        } else {
          // No plans exist — create one
          const newPlan = {
            ...DEFAULT_PLAN,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          fetch("/api/trpc/plan.create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "My Plan", data: newPlan }),
          })
            .then((r) => r.json())
            .then((createData) => {
              const created = createData?.result?.data;
              if (created) {
                setPlan(newPlan, created.id);
              } else {
                // Fallback: use plan locally without DB persistence
                setPlan(newPlan);
              }
            })
            .catch(() => {
              setPlan(newPlan);
            });
        }
      })
      .catch(() => {
        // Offline or not logged in — use defaults locally
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
