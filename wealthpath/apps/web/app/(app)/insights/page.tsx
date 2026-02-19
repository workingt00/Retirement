"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlanStore } from "@/stores/planStore";
import { SSComparison, TaxBracketVisualizer, SensitivityFan, AnimatedNumber } from "@/components/charts";
import Tooltip from "@/components/shared/Tooltip";
import { formatCurrency, formatPercentFromDecimal } from "@/lib/formatters";
import Link from "next/link";

function HorizonInsights() {
  const { theme } = useMode();
  const { result } = useSimulation();
  const plan = usePlanStore((s) => s.plan);

  if (!result || !plan) return null;
  const { summary } = result;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>
        Insights
      </h1>
      <div className="space-y-4">
        {/* Tax Savings */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="capital_gains">Tax Savings Opportunities</Tooltip>
          </h2>
          <p className="mb-3 text-sm" style={{ color: theme.text }}>
            {summary.yearsAt0CG > 0
              ? `Great news! You'll have ${summary.yearsAt0CG} years where you can sell investments at 0% capital gains tax. This could save you tens of thousands.`
              : "Your income in retirement may be above the 0% capital gains threshold. Consider Roth conversions to create lower-income years."}
          </p>
          <p className="text-sm" style={{ color: theme.text }}>
            Your lifetime effective tax rate is{" "}
            <strong>{formatPercentFromDecimal(summary.effectiveTaxRate)}</strong>. Total taxes paid:{" "}
            <strong>{formatCurrency(summary.totalTaxesPaid)}</strong>.
          </p>
          <div className="mt-4">
            <TaxBracketVisualizer
              ordinaryIncome={result.years[0]?.ordinaryTaxableIncome ?? 0}
              rothConversion={result.years[0]?.rothConversionAmount ?? 0}
              filingStatus={plan.personal.filingStatus}
              onConversionChange={() => {}}
              theme="horizon"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 rounded-xl p-3 text-center text-sm" style={{ backgroundColor: `${theme.textMuted}08` }}>
            <div>
              <p className="text-xs" style={{ color: theme.textMuted }}>Roth X1 amount</p>
              <p className="font-bold" style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatCurrency(plan.moves.find((m) => m.id === "X1")?.amount ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: theme.textMuted }}>CG rate @ retire</p>
              <p className="font-bold" style={{ fontFamily: theme.fontMono, color: summary.cgRateAtRetirement === 0 ? theme.success : theme.text }}>
                {formatPercentFromDecimal(summary.cgRateAtRetirement)}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: theme.textMuted }}>0% harvest/yr</p>
              <p className="font-bold" style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatCurrency(summary.annual0CGHarvestCapacity)}
              </p>
            </div>
          </div>
          <Link href="/strategy" className="mt-3 inline-block text-sm font-medium" style={{ color: theme.primary, minHeight: "48px", lineHeight: "48px" }}>
            Take Action
          </Link>
        </div>

        {/* Social Security */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="social_security">Social Security Options</Tooltip>
          </h2>
          <p className="mb-3 text-sm" style={{ color: theme.text }}>
            Currently claiming at age {plan.socialSecurity.claimingAge}. Total lifetime SS:{" "}
            <strong>{formatCurrency(summary.totalSSReceived)}</strong>.
          </p>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Claiming at 62 means smaller checks earlier. Claiming at 70 means 24% larger checks.
            The best choice depends on your health and other income.
          </p>
          <div className="mt-4">
            <SSComparison
              monthlyBenefitFRA={plan.socialSecurity.monthlyBenefitAtFRA}
              quartersEarned={plan.socialSecurity.quartersEarned ?? 40}
              theme="horizon"
            />
          </div>
          <Link href="/strategy" className="mt-3 inline-block text-sm font-medium" style={{ color: theme.primary, minHeight: "48px", lineHeight: "48px" }}>
            Adjust Claiming Age
          </Link>
        </div>

        {/* Stress Test */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: theme.secondary }}>
            <Tooltip term="sensitivity">How Resilient Is Your Plan?</Tooltip>
          </h2>
          <p className="text-sm" style={{ color: theme.text }}>
            {summary.bearFirstFailureAge === null
              ? "Even in a tough market, your plan holds strong through age 80. You've built a solid foundation."
              : `In a down market, your plan could struggle at age ${summary.bearFirstFailureAge}. Adding a small buffer now makes a big difference.`}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p style={{ color: theme.textMuted }}>Bear</p>
              <p className="font-bold" style={{ color: theme.danger }}>{formatCurrency(summary.bearNWAt80)}</p>
            </div>
            <div>
              <p style={{ color: theme.textMuted }}>Base</p>
              <p className="font-bold" style={{ color: theme.primary }}>{formatCurrency(summary.netWorthAt80)}</p>
            </div>
            <div>
              <p style={{ color: theme.textMuted }}>Bull</p>
              <p className="font-bold" style={{ color: theme.success }}>{formatCurrency(summary.bullNWAt80)}</p>
            </div>
          </div>
          <div className="mt-4">
            <SensitivityFan
              years={result.years}
              theme="horizon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function VelocityInsights() {
  const { theme } = useMode();
  const { result } = useSimulation();
  const plan = usePlanStore((s) => s.plan);

  if (!result || !plan) return null;
  const { summary } = result;

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold" style={{ color: theme.text }}>
        Tax Alpha Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Roth Conversion Optimizer */}
        <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            <Tooltip term="roth_conversion">Roth Conversion Optimizer</Tooltip>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span style={{ color: theme.textMuted }}>Current X1 amount</span>
              <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatCurrency(plan.moves.find((m) => m.id === "X1")?.amount ?? 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.textMuted }}>Effective tax rate</span>
              <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatPercentFromDecimal(summary.effectiveTaxRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: theme.textMuted }}>Total taxes paid</span>
              <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatCurrency(summary.totalTaxesPaid)}
              </span>
            </div>
          </div>
          <TaxBracketVisualizer
            ordinaryIncome={result.years[0]?.ordinaryTaxableIncome ?? 0}
            rothConversion={result.years[0]?.rothConversionAmount ?? 0}
            filingStatus={plan.personal.filingStatus}
            onConversionChange={() => {}}
            theme="velocity"
          />
        </div>

        {/* CG Bracket Visualizer */}
        <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            <Tooltip term="capital_gains">CG Bracket Analysis</Tooltip>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span style={{ color: theme.textMuted }}>CG rate @ retirement</span>
              <span style={{ fontFamily: theme.fontMono, color: summary.cgRateAtRetirement === 0 ? theme.success : theme.text }}>
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
              <span style={{ color: theme.textMuted }}>0% harvest capacity/yr</span>
              <span style={{ fontFamily: theme.fontMono, color: theme.text }}>
                {formatCurrency(summary.annual0CGHarvestCapacity)}
              </span>
            </div>
          </div>
        </div>

        {/* SS Comparison */}
        <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            <Tooltip term="social_security">SS Optimizer</Tooltip>
          </h2>
          <SSComparison
            monthlyBenefitFRA={plan.socialSecurity.monthlyBenefitAtFRA}
            quartersEarned={plan.socialSecurity.quartersEarned ?? 40}
            theme="velocity"
          />
        </div>

        {/* Sensitivity */}
        <div className="rounded-lg p-4" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            <Tooltip term="sensitivity">Sensitivity Analysis</Tooltip>
          </h2>
          <div className="space-y-2 text-xs">
            {[
              { label: "Bear fail", value: summary.bearFirstFailureAge === null ? "\u221E" : String(summary.bearFirstFailureAge), color: summary.bearFirstFailureAge === null ? theme.success : theme.danger },
              { label: "Base fail", value: summary.firstFailureAge === null ? "\u221E" : String(summary.firstFailureAge), color: summary.firstFailureAge === null ? theme.success : theme.danger },
              { label: "Bull fail", value: summary.bullFirstFailureAge === null ? "\u221E" : String(summary.bullFirstFailureAge), color: summary.bullFirstFailureAge === null ? theme.success : theme.text },
              { label: "Bear NW@80", value: formatCurrency(summary.bearNWAt80), color: summary.bearNWAt80 > 0 ? theme.success : theme.danger },
              { label: "Bull NW@80", value: formatCurrency(summary.bullNWAt80), color: theme.success },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span style={{ color: theme.textMuted }}>{r.label}</span>
                <span style={{ fontFamily: theme.fontMono, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <SensitivityFan
              years={result.years}
              theme="velocity"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [tab, setTab] = useState<"insights" | "tax-alpha">("insights");
  const { theme } = useMode();

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {([["insights", "Insights"], ["tax-alpha", "Tax Alpha"]] as const).map(([key, label]) => (
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
      {tab === "insights" ? <HorizonInsights /> : <VelocityInsights />}
    </div>
  );
}
