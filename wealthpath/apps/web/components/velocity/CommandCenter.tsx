"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlanStore } from "@/stores/planStore";
import { NetWorthChart, SensitivityFan, AccountComposition, AnimatedNumber } from "@/components/charts";
import Tooltip from "@/components/shared/Tooltip";
import { formatCurrency, formatPercentFromDecimal } from "@/lib/formatters";

type ChartView = "tax" | "account" | "sensitivity";

export default function CommandCenter() {
  const { theme } = useMode();
  const { result, goalResult } = useSimulation();
  const plan = usePlanStore((s) => s.plan);
  const [chartView, setChartView] = useState<ChartView>("tax");

  if (!result || !plan) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p style={{ color: theme.textMuted }}>Loading...</p>
      </div>
    );
  }

  const { summary } = result;
  const activeMoveCount = plan.moves.filter((m) => m.enabled).length;

  const metrics = [
    {
      label: "Failure Age",
      value: summary.firstFailureAge,
      display: summary.firstFailureAge === null ? "\u221E" : String(summary.firstFailureAge),
      color: summary.firstFailureAge === null ? theme.success : theme.danger,
      tooltip: "first_failure_age",
    },
    {
      label: "NW @ Retire",
      value: summary.netWorthAtRetirement,
      display: formatCurrency(summary.netWorthAtRetirement),
      color: theme.primary,
      tooltip: "net_worth",
    },
    {
      label: "Runway",
      value: summary.yearsOfRunway,
      display: `${summary.yearsOfRunway}yr`,
      color: theme.text,
      tooltip: "cash_flow",
    },
    {
      label: "Bear Fail",
      value: summary.bearFirstFailureAge,
      display: summary.bearFirstFailureAge === null ? "\u221E" : String(summary.bearFirstFailureAge),
      color: summary.bearFirstFailureAge === null ? theme.success : theme.danger,
      tooltip: "bear_case",
    },
    {
      label: "Eff. Tax",
      value: summary.effectiveTaxRate,
      display: formatPercentFromDecimal(summary.effectiveTaxRate),
      color: theme.secondary,
      tooltip: "effective_tax_rate",
    },
    {
      label: "Moves",
      value: activeMoveCount,
      display: String(activeMoveCount),
      color: theme.textMuted,
      tooltip: "",
    },
  ];

  return (
    <div>
      {/* Metric strip */}
      <div className="mb-4 grid grid-cols-3 gap-2 md:grid-cols-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg p-3"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            <p className="text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>
              {m.tooltip ? <Tooltip term={m.tooltip}>{m.label}</Tooltip> : m.label}
            </p>
            <p
              className="mt-1 text-lg font-bold"
              style={{ color: m.color, fontFamily: theme.fontMono }}
            >
              {m.display}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Left: Charts (60%) */}
        <div className="lg:col-span-3">
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            {/* Chart view toggles */}
            <div className="mb-3 flex gap-1">
              {(
                [
                  { key: "tax", label: "By Tax Treatment" },
                  { key: "account", label: "By Account" },
                  { key: "sensitivity", label: "Sensitivity" },
                ] as const
              ).map((v) => (
                <button
                  key={v.key}
                  onClick={() => setChartView(v.key)}
                  className="rounded px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: chartView === v.key ? `${theme.primary}20` : "transparent",
                    color: chartView === v.key ? theme.primary : theme.textMuted,
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {chartView === "sensitivity" ? (
              <SensitivityFan
                years={result.years}
                theme="velocity"
              />
            ) : (
              <NetWorthChart
                years={result.years}
                retirementAge={plan.personal.retirementAge}
                firstFailureAge={summary.firstFailureAge}
                theme="velocity"
              />
            )}
          </div>
        </div>

        {/* Right: Data panels (40%) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Account balances at retirement */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Balances @ Retirement
            </h3>
            <div className="space-y-2">
              {[
                { label: "Trad 401k", value: summary.balancesAtRetirement.traditional401k },
                { label: "Roth IRA", value: summary.balancesAtRetirement.rothIRA },
                { label: "Portfolio", value: summary.balancesAtRetirement.privatePortfolio },
                { label: "Foreign", value: summary.balancesAtRetirement.foreignPension },
                { label: "529", value: summary.balancesAtRetirement.plan529 },
              ].map((a) => (
                <div key={a.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: theme.textMuted }}>{a.label}</span>
                  <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                    {formatCurrency(a.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cash flow by phase */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              Cash Flow by Phase
            </h3>
            <div className="space-y-2">
              {[
                { label: "Working", value: summary.cashFlowWorking },
                { label: "Early Retire", value: summary.cashFlowEarlyRetire },
                { label: "Pre-SS", value: summary.cashFlowPreSS },
                { label: "SS Years", value: summary.cashFlowSSYears },
                { label: "Late Retire", value: summary.cashFlowLateRetire },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: theme.textMuted }}>{p.label}</span>
                  <span
                    style={{
                      fontFamily: theme.fontMono,
                      color: p.value >= 0 ? theme.success : theme.danger,
                    }}
                  >
                    {formatCurrency(p.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CG Intelligence */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
              <Tooltip term="capital_gains">CG Intelligence</Tooltip>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: theme.textMuted }}>CG rate @ retire</span>
                <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                  {formatPercentFromDecimal(summary.cgRateAtRetirement)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.textMuted }}>Years at 0% CG</span>
                <span style={{ fontFamily: theme.fontMono, color: theme.success }}>
                  {summary.yearsAt0CG}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: theme.textMuted }}>Annual 0% harvest</span>
                <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                  {formatCurrency(summary.annual0CGHarvestCapacity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
