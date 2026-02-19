"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulation } from "@/hooks/useSimulation";
import { useScenarios } from "@/hooks/useScenarios";
import { AnimatedNumber } from "@/components/charts";
import { formatCurrency } from "@/lib/formatters";

export default function ScenariosPage() {
  const { mode, theme } = useMode();
  const { result } = useSimulation();
  const { scenarios, saveScenario, removeScenario, compare } = useScenarios();
  const [name, setName] = useState("");

  if (!result) return null;

  const deltas = compare(result);

  const handleSave = () => {
    if (!name.trim()) return;
    saveScenario(name.trim());
    setName("");
  };

  return (
    <div>
      <h1
        className="mb-4 text-xl font-bold md:text-2xl"
        style={{ color: theme.text }}
      >
        What-If Explorer
      </h1>

      {/* Current plan summary */}
      <div
        className="mb-6 rounded-xl p-5"
        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
      >
        <h2 className="mb-3 text-sm font-semibold" style={{ color: theme.textMuted }}>
          Current Plan
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>NW @ 80</p>
            <p style={{ fontFamily: theme.fontMono, color: theme.text }}>
              <AnimatedNumber value={result.summary.netWorthAt80} format="currency" />
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>Total Taxes</p>
            <p style={{ fontFamily: theme.fontMono, color: theme.text }}>
              {formatCurrency(result.summary.totalTaxesPaid)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>Fail Years</p>
            <p style={{ fontFamily: theme.fontMono, color: result.summary.totalFailYears === 0 ? theme.success : theme.danger }}>
              {result.summary.totalFailYears}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>First Failure</p>
            <p style={{ fontFamily: theme.fontMono, color: result.summary.firstFailureAge === null ? theme.success : theme.danger }}>
              {result.summary.firstFailureAge ?? "\u221E"}
            </p>
          </div>
        </div>
      </div>

      {/* Save scenario */}
      <div className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this scenario..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40` }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: theme.primary }}
        >
          Save
        </button>
      </div>

      {/* Scenario comparison */}
      {scenarios.length > 0 ? (
        <div className="space-y-3">
          {scenarios.map((s, i) => {
            const delta = deltas[i];
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl p-4"
                style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
              >
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>
                    {s.name}
                  </h3>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    NW@80: {formatCurrency(s.result.summary.netWorthAt80)} | Taxes: {formatCurrency(s.result.summary.totalTaxesPaid)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {delta && (
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor:
                          delta.verdict === "better"
                            ? `${theme.success}20`
                            : delta.verdict === "worse"
                              ? `${theme.danger}20`
                              : `${theme.textMuted}20`,
                        color:
                          delta.verdict === "better"
                            ? theme.success
                            : delta.verdict === "worse"
                              ? theme.danger
                              : theme.textMuted,
                      }}
                    >
                      {delta.verdict === "better"
                        ? "Current is better"
                        : delta.verdict === "worse"
                          ? "Was better before"
                          : "About the same"}
                    </span>
                  )}
                  <button
                    onClick={() => removeScenario(s.id)}
                    className="text-xs"
                    style={{ color: theme.danger }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-sm" style={{ color: theme.textMuted }}>
          Try changing some settings, then save a scenario to compare.
        </p>
      )}
    </div>
  );
}
