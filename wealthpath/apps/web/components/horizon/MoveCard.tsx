"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import ToggleSwitch from "@/components/shared/ToggleSwitch";
import CurrencyInput from "@/components/shared/CurrencyInput";
import AgeInput from "@/components/shared/AgeInput";
import Tooltip from "@/components/shared/Tooltip";
import { useImpactPreview } from "@/hooks/useImpactPreview";
import { usePlanStore } from "@/stores/planStore";
import { formatCurrency } from "@/lib/formatters";
import { moveExplanations } from "@/lib/moveExplanations";
import type { Move } from "@wealthpath/engine";

interface MoveCardProps {
  move: Move;
  hasConflict?: boolean;
}

export default function MoveCard({ move, hasConflict = false }: MoveCardProps) {
  const { theme } = useMode();
  const [expanded, setExpanded] = useState(false);
  const toggleMove = usePlanStore((s) => s.toggleMove);
  const updateMove = usePlanStore((s) => s.updateMove);
  const impact = useImpactPreview(move.id);
  const explanation = moveExplanations[move.id];

  return (
    <div
      className="rounded-2xl p-5 transition-shadow"
      style={{
        backgroundColor: theme.surface,
        border: hasConflict
          ? `2px solid ${theme.danger}`
          : `1px solid ${theme.textMuted}15`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold" style={{ color: theme.text }}>
              {move.name}
            </h4>
            {move.id === "W0" && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${theme.success}20`, color: theme.success }}
              >
                Recommended
              </span>
            )}
          </div>
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            {move.description}
          </p>
        </div>
        <ToggleSwitch
          checked={move.enabled}
          onChange={() => toggleMove(move.id)}
        />
      </div>

      {move.enabled && move.unit !== "auto" && move.unit !== "full_balance" && (
        <div className="mt-4 flex gap-4">
          {move.unit === "$" && (
            <CurrencyInput
              label="Amount"
              value={move.amount}
              onChange={(v) => updateMove(move.id, "amount", v)}
              className="flex-1"
            />
          )}
          {move.unit === "%" && (
            <div className="flex-1">
              <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>Rate (%)</label>
              <input
                type="number"
                value={move.amount * 100}
                onChange={(e) => updateMove(move.id, "amount", (parseFloat(e.target.value) || 0) / 100)}
                step={0.1}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  backgroundColor: theme.surface,
                  color: theme.text,
                  borderColor: `${theme.textMuted}40`,
                  fontFamily: theme.fontMono,
                }}
              />
            </div>
          )}
          <AgeInput
            label="Start age"
            value={move.startAge}
            onChange={(v) => updateMove(move.id, "startAge", v)}
            className="w-28"
          />
        </div>
      )}

      {/* Impact preview */}
      {impact && (
        <div
          className="mt-3 rounded-lg px-3 py-2 text-xs"
          style={{
            backgroundColor: impact.isImprovement ? `${theme.success}10` : `${theme.danger}10`,
            color: impact.isImprovement ? theme.success : theme.danger,
          }}
        >
          {move.enabled ? "Disabling" : "Enabling"} this{" "}
          {impact.isImprovement ? "adds" : "costs"}{" "}
          <strong>{formatCurrency(Math.abs(impact.deltaNWAt80))}</strong> at age 80
        </div>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-medium"
        style={{ color: theme.primary, minHeight: "48px" }}
      >
        {expanded ? "Hide details" : "What is this?"}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 text-xs leading-relaxed" style={{ color: theme.textMuted }}>
          {explanation && (
            <p
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: `${theme.primary}08`, borderLeft: `3px solid ${theme.primary}` }}
            >
              {explanation.detail}
            </p>
          )}
          <p><strong>Tax impact:</strong> {move.taxImpact}</p>
          {move.notes && <p><strong>Note:</strong> {move.notes}</p>}
          {move.conflicts.length > 0 && (
            <p><strong>Conflicts with:</strong> {move.conflicts.join(", ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
