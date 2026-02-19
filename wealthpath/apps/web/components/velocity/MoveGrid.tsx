"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import { useSimulation } from "@/hooks/useSimulation";
import MoveRow from "./MoveRow";
import type { MoveCategory } from "@wealthpath/engine";

const CATEGORY_LABELS: Record<MoveCategory, string> = {
  contribution: "Contributions",
  conversion: "Conversions",
  withdrawal: "Withdrawals",
  income: "Income",
  social_security: "Social Security",
  lifestyle: "Lifestyle",
  rule: "Rules",
};

const CATEGORY_ORDER: MoveCategory[] = [
  "contribution",
  "conversion",
  "withdrawal",
  "income",
  "social_security",
  "lifestyle",
  "rule",
];

export default function MoveGrid() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const { conflicts } = useSimulation();
  const [collapsed, setCollapsed] = useState<Set<MoveCategory>>(new Set());

  if (!plan) return null;

  const conflictingIds = new Set(
    conflicts.flatMap((c) => [c.moveId, c.conflictsWith]),
  );

  const toggleCategory = (cat: MoveCategory) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    moves: plan.moves.filter((m) => m.category === cat),
  })).filter((g) => g.moves.length > 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ color: theme.text }}>
        <thead>
          <tr className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
            <th className="w-10 px-2 py-2">On</th>
            <th className="w-12 px-2 py-2">ID</th>
            <th className="px-2 py-2">Move</th>
            <th className="w-16 px-2 py-2">Age</th>
            <th className="w-24 px-2 py-2">Amount</th>
            <th className="w-24 px-2 py-2">Delta NW@80</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map((g) => (
            <>
              <tr
                key={g.category}
                className="cursor-pointer"
                onClick={() => toggleCategory(g.category)}
                style={{ backgroundColor: `${theme.textMuted}08` }}
              >
                <td colSpan={6} className="px-2 py-2 text-xs font-semibold" style={{ color: theme.primary }}>
                  {collapsed.has(g.category) ? "\u25B6" : "\u25BC"} {CATEGORY_LABELS[g.category]}{" "}
                  <span style={{ color: theme.textMuted }}>({g.moves.filter((m) => m.enabled).length}/{g.moves.length})</span>
                </td>
              </tr>
              {!collapsed.has(g.category) &&
                g.moves.map((move) => (
                  <MoveRow
                    key={move.id}
                    move={move}
                    hasConflict={conflictingIds.has(move.id)}
                  />
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
