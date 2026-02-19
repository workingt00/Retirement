"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import { useSimulation } from "@/hooks/useSimulation";
import PhaseSection from "@/components/horizon/PhaseSection";
import MoveGrid from "@/components/velocity/MoveGrid";
import Tooltip from "@/components/shared/Tooltip";

function HorizonStrategy() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const { conflicts } = useSimulation();

  if (!plan) return null;

  const conflictingIds = conflicts.flatMap((c) => [c.moveId, c.conflictsWith]);

  const phases = [
    {
      title: "While you're still working",
      description: "Build your nest egg with smart contributions",
      moveIds: ["C1", "C2", "C3", "C4", "C5", "C7", "C8"],
    },
    {
      title: "When you retire",
      description: "Withdraw money in the most tax-efficient way",
      moveIds: ["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11"],
    },
    {
      title: "Optimizing your taxes",
      description: "Convert and move money to reduce your lifetime tax bill",
      moveIds: ["X1", "X2", "X3", "X4"],
    },
    {
      title: "Life changes",
      description: "Major decisions that affect your plan",
      moveIds: ["S1", "I1", "I2", "I3", "L1", "L2", "L3", "L4", "L5", "L6"],
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>
        <Tooltip term="goal_solver">Smart Moves</Tooltip>
      </h1>
      {phases.map((phase) => (
        <PhaseSection
          key={phase.title}
          title={phase.title}
          description={phase.description}
          moves={plan.moves.filter((m) => phase.moveIds.includes(m.id))}
          conflictingMoveIds={conflictingIds}
        />
      ))}
    </div>
  );
}

function VelocityStrategy() {
  const { theme } = useMode();

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold" style={{ color: theme.text }}>
        Move Console
      </h1>
      <div
        className="rounded-lg"
        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
      >
        <MoveGrid />
      </div>
    </div>
  );
}

export default function StrategyPage() {
  const [tab, setTab] = useState<"smart" | "console">("smart");
  const { theme } = useMode();

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {([["smart", "Smart Moves"], ["console", "Move Console"]] as const).map(([key, label]) => (
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
      {tab === "smart" ? <HorizonStrategy /> : <VelocityStrategy />}
    </div>
  );
}
