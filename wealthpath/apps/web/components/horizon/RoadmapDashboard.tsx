"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlanStore } from "@/stores/planStore";
import { NetWorthChart, SensitivityFan, AnimatedNumber } from "@/components/charts";
import StatusBadge from "@/components/shared/StatusBadge";
import Tooltip from "@/components/shared/Tooltip";
import { formatCurrency, formatPercentFromDecimal } from "@/lib/formatters";
import Link from "next/link";

type ChartView = "tax" | "account" | "sensitivity";

export default function RoadmapDashboard() {
  const { theme } = useMode();
  const [chartView, setChartView] = useState<ChartView>("tax");
  const { result, goalResult } = useSimulation();
  const plan = usePlanStore((s) => s.plan);

  if (!result || !plan) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p style={{ color: theme.textMuted }}>Loading your roadmap...</p>
      </div>
    );
  }

  const { summary } = result;
  const isOnTrack = summary.firstFailureAge === null;
  const status = isOnTrack ? "OK" : summary.firstFailureAge! > 75 ? "warning" : "FAIL";

  return (
    <div>
      {/* Metric Strip */}
      <div
        className="mb-6 grid grid-cols-3 gap-3 md:grid-cols-6"
      >
        {[
          { label: "Failure Age", value: summary.firstFailureAge === null ? "∞" : String(summary.firstFailureAge), color: summary.firstFailureAge === null ? theme.success : theme.danger },
          { label: "NW @ Retire", value: formatCurrency(summary.netWorthAtRetirement), color: theme.primary },
          { label: "Runway", value: `${summary.yearsOfRunway} yrs`, color: theme.text },
          { label: "Bear Fail", value: summary.bearFirstFailureAge === null ? "∞" : String(summary.bearFirstFailureAge), color: summary.bearFirstFailureAge === null ? theme.success : theme.danger },
          { label: "Eff. Tax", value: formatPercentFromDecimal(summary.effectiveTaxRate), color: theme.text },
          { label: "Active Moves", value: String(plan.moves.filter((m) => m.enabled).length), color: theme.secondary },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
          >
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>{m.label}</p>
            <p className="text-sm font-bold" style={{ fontFamily: theme.fontMono, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Hero */}
      <div
        className="mb-8 rounded-2xl p-6 md:p-8"
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.textMuted}15`,
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <StatusBadge status={status} className="mb-3" />
            <h1 className="text-2xl font-bold md:text-3xl" style={{ color: theme.text }}>
              {isOnTrack
                ? "Your retirement is on track"
                : `Your plan needs attention at age ${summary.firstFailureAge}`}
            </h1>
            {!isOnTrack && (
              <p className="mt-2 text-sm" style={{ color: theme.textMuted }}>
                Don't worry -- small adjustments can fix this.{" "}
                <Link href="/strategy" style={{ color: theme.primary }}>
                  See Smart Moves
                </Link>
              </p>
            )}
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Net worth at retirement
              </p>
              <p className="text-xl font-bold" style={{ fontFamily: theme.fontMono, color: theme.primary }}>
                <AnimatedNumber value={summary.netWorthAtRetirement} format="currency" />
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Years of runway
              </p>
              <p className="text-xl font-bold" style={{ fontFamily: theme.fontMono, color: theme.text }}>
                <AnimatedNumber value={summary.yearsOfRunway} format="integer" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart with view tabs */}
      <div
        className="mb-8 rounded-2xl p-4 md:p-6"
        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: theme.text }}>
            <Tooltip term="net_worth">Your Net Worth Over Time</Tooltip>
          </h2>
          <div className="flex gap-1">
            {([
              { key: "tax" as const, label: "By Tax Treatment" },
              { key: "account" as const, label: "By Account" },
              { key: "sensitivity" as const, label: "Sensitivity" },
            ]).map((v) => (
              <button
                key={v.key}
                onClick={() => setChartView(v.key)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: chartView === v.key ? `${theme.primary}15` : "transparent",
                  color: chartView === v.key ? theme.primary : theme.textMuted,
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        {chartView === "sensitivity" ? (
          <SensitivityFan years={result.years} theme="horizon" />
        ) : (
          <NetWorthChart
            years={result.years}
            retirementAge={plan.personal.retirementAge}
            firstFailureAge={summary.firstFailureAge}
            theme="horizon"
          />
        )}
      </div>

      {/* Cash Flow by Phase & Account Balances */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Cash Flow by Phase */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: theme.text }}>
            <Tooltip term="cash_flow">Cash Flow by Phase</Tooltip>
          </h2>
          {(() => {
            const retAge = plan.personal.retirementAge;
            const ssAge = plan.socialSecurity.claimingAge;
            const phases = [
              { label: "Working years", range: `Now - ${retAge}`, income: result.years[0]?.totalIncome ?? 0, expenses: result.years[0]?.totalExpenses ?? 0 },
              { label: "Early retirement", range: `${retAge} - ${ssAge}`, income: result.years[retAge - plan.personal.currentAge]?.totalIncome ?? 0, expenses: result.years[retAge - plan.personal.currentAge]?.totalExpenses ?? 0 },
              { label: "With Social Security", range: `${ssAge}+`, income: result.years[ssAge - plan.personal.currentAge]?.totalIncome ?? 0, expenses: result.years[ssAge - plan.personal.currentAge]?.totalExpenses ?? 0 },
            ];
            return (
              <div className="space-y-3">
                {phases.map((p) => (
                  <div key={p.label} className="rounded-xl p-3" style={{ backgroundColor: `${theme.textMuted}08` }}>
                    <div className="flex justify-between text-sm font-medium" style={{ color: theme.text }}>
                      <span>{p.label}</span>
                      <span style={{ color: theme.textMuted }}>{p.range}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-xs" style={{ color: theme.textMuted }}>
                      <span>Income: <strong style={{ color: theme.success }}>{formatCurrency(p.income)}</strong></span>
                      <span>Expenses: <strong style={{ color: theme.danger }}>{formatCurrency(p.expenses)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Account Balances at Retirement */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-lg font-semibold" style={{ color: theme.text }}>
            Account Balances at Retirement
          </h2>
          {(() => {
            const retIdx = plan.personal.retirementAge - plan.personal.currentAge;
            const yr = result.years[retIdx];
            if (!yr) return <p style={{ color: theme.textMuted }}>Not enough data</p>;
            const accounts = [
              { label: "Traditional 401k", value: yr.traditional401k ?? 0 },
              { label: "Roth IRA", value: yr.rothIRA ?? 0 },
              { label: "Brokerage portfolio", value: yr.privatePortfolio ?? 0 },
              { label: "Foreign pension", value: yr.foreignPension ?? 0 },
              { label: "529 plan", value: yr.plan529 ?? 0 },
            ];
            const total = accounts.reduce((s, a) => s + a.value, 0);
            return (
              <div className="space-y-2">
                {accounts.filter(a => a.value > 0).map((a) => (
                  <div key={a.label} className="flex items-center justify-between text-sm">
                    <span style={{ color: theme.textMuted }}>{a.label}</span>
                    <span style={{ fontFamily: theme.fontMono, color: theme.text }}>{formatCurrency(a.value)}</span>
                  </div>
                ))}
                <div className="mt-2 border-t pt-2" style={{ borderColor: `${theme.textMuted}20` }}>
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span style={{ color: theme.text }}>Total</span>
                    <span style={{ fontFamily: theme.fontMono, color: theme.primary }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* CG Intelligence */}
      <div
        className="mb-8 rounded-2xl p-5"
        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
      >
        <h2 className="mb-3 text-lg font-semibold" style={{ color: theme.text }}>
          <Tooltip term="capital_gains">Capital Gains Intelligence</Tooltip>
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>CG Rate @ Retirement</p>
            <p className="text-lg font-bold" style={{ fontFamily: theme.fontMono, color: summary.cgRateAtRetirement === 0 ? theme.success : theme.text }}>
              {formatPercentFromDecimal(summary.cgRateAtRetirement)}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Years at 0% CG</p>
            <p className="text-lg font-bold" style={{ fontFamily: theme.fontMono, color: theme.success }}>
              {summary.yearsAt0CG}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Annual 0% Harvest</p>
            <p className="text-lg font-bold" style={{ fontFamily: theme.fontMono, color: theme.text }}>
              {formatCurrency(summary.annual0CGHarvestCapacity)}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Insight Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Tax Savings */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="capital_gains">Tax Savings Opportunity</Tooltip>
          </h3>
          <p className="text-sm" style={{ color: theme.text }}>
            {summary.yearsAt0CG > 0
              ? `You'll have ${summary.yearsAt0CG} years at 0% capital gains tax in retirement. That's free money from selling investments!`
              : "Your income may be too high for 0% capital gains. Roth conversions could help."}
          </p>
          <p className="mt-2 text-xs" style={{ color: theme.textMuted }}>
            Effective tax rate: {formatPercentFromDecimal(summary.effectiveTaxRate)}
          </p>
        </div>

        {/* Social Security */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="social_security">Social Security</Tooltip>
          </h3>
          <p className="text-sm" style={{ color: theme.text }}>
            Claiming at age {plan.socialSecurity.claimingAge} gives you{" "}
            <strong>{formatCurrency(summary.totalSSReceived)}</strong> in total benefits.
          </p>
          <Link href="/insights" className="mt-2 block text-xs font-medium" style={{ color: theme.primary }}>
            Compare claiming ages
          </Link>
        </div>

        {/* Stress Test */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="bear_case">Stress Test</Tooltip>
          </h3>
          <p className="text-sm" style={{ color: theme.text }}>
            {summary.bearFirstFailureAge === null
              ? "Even in a bad market, your plan survives. Well done!"
              : `In a downturn, your plan could run short at age ${summary.bearFirstFailureAge}. Consider building more cushion.`}
          </p>
          <p className="mt-2 text-xs" style={{ color: theme.textMuted }}>
            Bear case net worth at 80: {formatCurrency(summary.bearNWAt80)}
          </p>
        </div>

        {/* Smart Moves */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: theme.secondary }}>
            Smart Moves
          </h3>
          <p className="text-sm" style={{ color: theme.text }}>
            {plan.moves.filter((m) => m.enabled).length} active moves shaping your plan.
          </p>
          <Link href="/strategy" className="mt-2 block text-xs font-medium" style={{ color: theme.primary }}>
            Review your strategy
          </Link>
        </div>
      </div>
    </div>
  );
}
