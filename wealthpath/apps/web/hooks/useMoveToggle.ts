"use client";

import { useCallback } from "react";
import { usePlanStore } from "@/stores/planStore";

export function useMoveToggle() {
  const toggleMove = usePlanStore((s) => s.toggleMove);
  const moves = usePlanStore((s) => s.plan?.moves ?? []);

  const toggle = useCallback(
    (moveId: string) => {
      const move = moves.find((m) => m.id === moveId);
      if (!move) return;

      // Find which conflicts will be disabled
      const disabledConflicts = !move.enabled
        ? moves
            .filter((m) => move.conflicts.includes(m.id) && m.enabled)
            .map((m) => m.name)
        : [];

      toggleMove(moveId);

      return { disabledConflicts };
    },
    [moves, toggleMove],
  );

  return { toggle, moves };
}
