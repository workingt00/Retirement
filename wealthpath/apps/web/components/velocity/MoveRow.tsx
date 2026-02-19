"use client";

import { useState, useCallback } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import { useImpactPreview } from "@/hooks/useImpactPreview";
import { formatCurrency } from "@/lib/formatters";
import { moveExplanations } from "@/lib/moveExplanations";
import type { Move } from "@wealthpath/engine";

interface MoveRowProps {
  move: Move;
  hasConflict?: boolean;
}

export default function MoveRow({ move, hasConflict = false }: MoveRowProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const explanation = moveExplanations[move.id];
  const { theme } = useMode();
  const toggleMove = usePlanStore((s) => s.toggleMove);
  const updateMove = usePlanStore((s) => s.updateMove);
  const impact = useImpactPreview(move.id);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingAge, setEditingAge] = useState(false);

  const handleAmountSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const v = parseFloat(e.currentTarget.value) || 0;
        updateMove(move.id, "amount", move.unit === "%" ? v / 100 : v);
        setEditingAmount(false);
      }
      if (e.key === "Escape") setEditingAmount(false);
    },
    [move.id, move.unit, updateMove],
  );

  const handleAgeSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        updateMove(move.id, "startAge", parseInt(e.currentTarget.value) || move.startAge);
        setEditingAge(false);
      }
      if (e.key === "Escape") setEditingAge(false);
    },
    [move.id, move.startAge, updateMove],
  );

  return (
    <>
    <tr
      className="border-b transition-colors"
      style={{
        borderColor: hasConflict ? theme.danger : `${theme.textMuted}10`,
        backgroundColor: hasConflict ? `${theme.danger}08` : "transparent",
      }}
    >
      {/* Toggle */}
      <td className="px-2 py-2">
        <button
          onClick={() => toggleMove(move.id)}
          className="flex h-5 w-5 items-center justify-center rounded"
          style={{
            backgroundColor: move.enabled ? theme.primary : "transparent",
            border: `1.5px solid ${move.enabled ? theme.primary : theme.textMuted}`,
          }}
        >
          {move.enabled && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </td>
      {/* ID */}
      <td className="px-2 py-2 text-xs" style={{ fontFamily: theme.fontMono, color: theme.textMuted }}>
        {move.id}
      </td>
      {/* Name */}
      <td className="px-2 py-2 text-xs" style={{ color: move.enabled ? theme.text : theme.textMuted }}>
        <span className="flex items-center gap-1.5">
          {move.name}
          {hasConflict && (
            <span className="text-[10px]" style={{ color: theme.danger }}>CONFLICT</span>
          )}
          {explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
              style={{
                backgroundColor: showExplanation ? theme.primary : `${theme.textMuted}20`,
                color: showExplanation ? "#fff" : theme.textMuted,
              }}
              title={explanation.summary}
            >
              ?
            </button>
          )}
        </span>
        {explanation && (
          <span className="block text-[10px] mt-0.5" style={{ color: theme.textMuted }}>
            {explanation.summary}
          </span>
        )}
      </td>
      {/* Start Age */}
      <td className="px-2 py-2 text-xs" style={{ fontFamily: theme.fontMono }}>
        {editingAge ? (
          <input
            type="number"
            defaultValue={move.startAge}
            onKeyDown={handleAgeSubmit}
            onBlur={() => setEditingAge(false)}
            autoFocus
            className="w-14 rounded border px-1 py-0.5 text-xs"
            style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.primary }}
          />
        ) : (
          <span
            onClick={() => setEditingAge(true)}
            className="cursor-pointer"
            style={{ color: theme.text }}
          >
            {move.startAge}
          </span>
        )}
      </td>
      {/* Amount */}
      <td className="px-2 py-2 text-xs" style={{ fontFamily: theme.fontMono }}>
        {move.unit === "auto" || move.unit === "full_balance" ? (
          <span style={{ color: theme.textMuted }}>{move.unit}</span>
        ) : editingAmount ? (
          <input
            type="number"
            defaultValue={move.unit === "%" ? move.amount * 100 : move.amount}
            onKeyDown={handleAmountSubmit}
            onBlur={() => setEditingAmount(false)}
            autoFocus
            className="w-20 rounded border px-1 py-0.5 text-xs"
            style={{ backgroundColor: theme.bg, color: theme.text, borderColor: theme.primary }}
          />
        ) : (
          <span
            onClick={() => setEditingAmount(true)}
            className="cursor-pointer"
            style={{ color: theme.text }}
          >
            {move.unit === "%" ? `${(move.amount * 100).toFixed(1)}%` : formatCurrency(move.amount)}
          </span>
        )}
      </td>
      {/* Impact */}
      <td className="px-2 py-2 text-xs" style={{ fontFamily: theme.fontMono }}>
        {impact && (
          <span style={{ color: impact.isImprovement ? theme.success : theme.danger }}>
            {impact.deltaNWAt80 >= 0 ? "+" : ""}
            {formatCurrency(impact.deltaNWAt80)}
          </span>
        )}
      </td>
    </tr>
    {showExplanation && explanation && (
      <tr>
        <td colSpan={6} className="px-2 pb-3 pt-0">
          <div
            className="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
            style={{
              backgroundColor: `${theme.primary}08`,
              color: theme.textMuted,
              borderLeft: `3px solid ${theme.primary}`,
            }}
          >
            {explanation.detail}
            {(move.taxImpact || move.notes || move.conflicts.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: theme.textMuted }}>
                {move.taxImpact && <span><strong>Tax:</strong> {move.taxImpact}</span>}
                {move.notes && <span><strong>Note:</strong> {move.notes}</span>}
                {move.conflicts.length > 0 && <span><strong>Conflicts:</strong> {move.conflicts.join(", ")}</span>}
              </div>
            )}
          </div>
        </td>
      </tr>
    )}
    </>
  );
}
