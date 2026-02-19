"use client";

import { useMode } from "@/components/shared/ModeProvider";
import MoveCard from "./MoveCard";
import type { Move } from "@wealthpath/engine";

interface PhaseSectionProps {
  title: string;
  description: string;
  moves: Move[];
  conflictingMoveIds: string[];
}

export default function PhaseSection({
  title,
  description,
  moves,
  conflictingMoveIds,
}: PhaseSectionProps) {
  const { theme } = useMode();

  if (moves.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="mb-1 text-lg font-bold" style={{ color: theme.text }}>
        {title}
      </h3>
      <p className="mb-4 text-sm" style={{ color: theme.textMuted }}>
        {description}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {moves.map((move) => (
          <MoveCard
            key={move.id}
            move={move}
            hasConflict={conflictingMoveIds.includes(move.id)}
          />
        ))}
      </div>
    </section>
  );
}
