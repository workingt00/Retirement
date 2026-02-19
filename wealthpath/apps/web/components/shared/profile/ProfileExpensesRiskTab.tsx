"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import type { MajorExpenditure } from "@wealthpath/engine";

const RISK_PRESETS: Record<string, { stocks: number; bonds: number; cash: number }> = {
  low: { stocks: 30, bonds: 50, cash: 20 },
  medium: { stocks: 60, bonds: 30, cash: 10 },
  high: { stocks: 80, bonds: 15, cash: 5 },
};

export default function ProfileExpensesRiskTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  const er = plan.expensesRisk;
  const allocationSum = er.stocksPct + er.bondsPct + er.cashPct + er.alternativesPct;
  const allocationValid = allocationSum === 100;

  const addExpenditure = () => {
    const newExp: MajorExpenditure = { label: "", year: new Date().getFullYear() + 5, amount: 0 };
    updateField("expensesRisk.majorExpenditures", [...er.majorExpenditures, newExp]);
  };

  const updateExpenditure = (index: number, field: keyof MajorExpenditure, value: string | number) => {
    const updated = er.majorExpenditures.map((e, i) =>
      i === index ? { ...e, [field]: value } : e,
    );
    updateField("expensesRisk.majorExpenditures", updated);
  };

  const removeExpenditure = (index: number) => {
    updateField("expensesRisk.majorExpenditures", er.majorExpenditures.filter((_, i) => i !== index));
  };

  const handleRiskChange = (risk: "low" | "medium" | "high") => {
    updateField("expensesRisk.riskTolerance", risk);
    const preset = RISK_PRESETS[risk];
    updateField("expensesRisk.stocksPct", preset.stocks);
    updateField("expensesRisk.bondsPct", preset.bonds);
    updateField("expensesRisk.cashPct", preset.cash);
    updateField("expensesRisk.alternativesPct", 0);
  };

  return (
    <div className="space-y-8">
      {/* Expenses */}
      <section>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Expenses</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CurrencyInput
              label="Annual Living Expenses"
              value={er.annualLivingExpenses}
              onChange={(v) => updateField("expensesRisk.annualLivingExpenses", v)}
            />
            <CurrencyInput
              label="Healthcare / LTC in Retirement ($/yr)"
              value={er.healthcareExpenses}
              onChange={(v) => updateField("expensesRisk.healthcareExpenses", v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                Inflation Assumption (%)
              </label>
              <input
                type="number"
                value={er.inflationRate}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 0 && v <= 10) updateField("expensesRisk.inflationRate", v);
                }}
                min={0}
                max={10}
                step={0.5}
                className="w-24 rounded-lg border px-3 py-3"
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
              />
            </div>
            <CurrencyInput
              label="Mortgage Balance"
              value={er.mortgageBalance}
              onChange={(v) => updateField("expensesRisk.mortgageBalance", v)}
            />
            <CurrencyInput
              label="Other Annual Debt Payments"
              value={er.otherDebt}
              onChange={(v) => updateField("expensesRisk.otherDebt", v)}
            />
          </div>

          {/* Major Expenditures */}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Planned Major Expenditures
            </label>
            {er.majorExpenditures.map((exp, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  value={exp.label}
                  onChange={(e) => updateExpenditure(i, "label", e.target.value)}
                  placeholder="e.g., Kids' College"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40` }}
                />
                <input
                  type="number"
                  value={exp.year}
                  onChange={(e) => updateExpenditure(i, "year", parseInt(e.target.value) || 0)}
                  placeholder="Year"
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono }}
                />
                <input
                  type="number"
                  value={exp.amount}
                  onChange={(e) => updateExpenditure(i, "amount", parseFloat(e.target.value) || 0)}
                  placeholder="Amount"
                  className="w-32 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono }}
                />
                <button
                  onClick={() => removeExpenditure(i)}
                  className="rounded px-2 py-1 text-xs"
                  style={{ color: "#EF4444" }}
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={addExpenditure}
              className="mt-1 text-sm font-medium"
              style={{ color: theme.primary }}
            >
              + Add expenditure
            </button>
          </div>
        </div>
      </section>

      {/* Risk & Allocation */}
      <section>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Risk & Allocation</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Risk Tolerance
            </label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleRiskChange(level)}
                  className="rounded-xl border-2 px-5 py-3 text-sm font-medium capitalize transition-colors"
                  style={{
                    borderColor: er.riskTolerance === level ? theme.primary : `${theme.textMuted}30`,
                    backgroundColor: er.riskTolerance === level ? `${theme.primary}10` : "transparent",
                    color: er.riskTolerance === level ? theme.primary : theme.textMuted,
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Stocks (%)", key: "stocksPct" as const },
              { label: "Bonds (%)", key: "bondsPct" as const },
              { label: "Cash (%)", key: "cashPct" as const },
              { label: "Alternatives (%)", key: "alternativesPct" as const },
            ].map((item) => (
              <div key={item.key}>
                <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                  {item.label}
                </label>
                <input
                  type="number"
                  value={er[item.key]}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 100) {
                      updateField(`expensesRisk.${item.key}`, v);
                    }
                  }}
                  min={0}
                  max={100}
                  className="w-full rounded-lg border px-3 py-3"
                  style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
                />
              </div>
            ))}
          </div>
          {!allocationValid && (
            <p className="text-sm font-medium" style={{ color: "#EF4444" }}>
              Allocation must sum to 100% (currently {allocationSum}%)
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              role="switch"
              type="button"
              aria-checked={er.preferTaxEfficient}
              onClick={() => updateField("expensesRisk.preferTaxEfficient", !er.preferTaxEfficient)}
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              style={{ backgroundColor: er.preferTaxEfficient ? theme.primary : `${theme.textMuted}40` }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: er.preferTaxEfficient ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-sm" style={{ color: theme.text }}>Prefer Tax-Efficient Investments</span>
          </div>
        </div>
      </section>
    </div>
  );
}
