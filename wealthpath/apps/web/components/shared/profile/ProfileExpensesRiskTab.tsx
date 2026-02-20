"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import InsightCard from "@/components/shared/profile/InsightCard";
import AllocationDonut from "@/components/shared/profile/AllocationDonut";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { MajorExpenditure } from "@wealthpath/engine";

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

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
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Expenses */}
      <motion.section variants={staggerItem}>
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

          {er.annualLivingExpenses > 0 && (
            <InsightCard icon="info" variant="info">
              Monthly living expenses: <strong>{fmtCurrency(Math.round(er.annualLivingExpenses / 12))}/month</strong>
            </InsightCard>
          )}

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
                style={{ backgroundColor: theme.surfaceGlass, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: theme.text, borderColor: theme.borderGlass, fontFamily: theme.fontFamily, minHeight: "48px" }}
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
                  style={{ backgroundColor: theme.surfaceGlass, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: theme.text, borderColor: theme.borderGlass }}
                />
                <input
                  type="number"
                  value={exp.year}
                  onChange={(e) => updateExpenditure(i, "year", parseInt(e.target.value) || 0)}
                  placeholder="Year"
                  className="w-24 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: theme.surfaceGlass, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: theme.text, borderColor: theme.borderGlass, fontFamily: theme.fontFamily }}
                />
                <input
                  type="number"
                  value={exp.amount}
                  onChange={(e) => updateExpenditure(i, "amount", parseFloat(e.target.value) || 0)}
                  placeholder="Amount"
                  className="w-32 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: theme.surfaceGlass, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: theme.text, borderColor: theme.borderGlass, fontFamily: theme.fontFamily }}
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
      </motion.section>

      {/* Risk & Allocation */}
      <motion.section variants={staggerItem}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Risk & Allocation</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Risk Tolerance
            </label>
            <div className="flex gap-3">
              {(["low", "medium", "high"] as const).map((level) => (
                <motion.button
                  key={level}
                  onClick={() => handleRiskChange(level)}
                  className="rounded-xl border-2 px-5 py-3 text-sm font-medium capitalize transition-colors"
                  style={{
                    borderColor: er.riskTolerance === level ? `${theme.gradientFrom}50` : `${theme.textMuted}30`,
                    background: er.riskTolerance === level ? `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)` : "transparent",
                    color: er.riskTolerance === level ? "transparent" : theme.textMuted,
                    boxShadow: er.riskTolerance === level ? theme.glowPrimary : "none",
                    ...(er.riskTolerance === level ? {
                      backgroundClip: "padding-box",
                    } : {}),
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {er.riskTolerance === level ? (
                    <span style={{
                      background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      {level}
                    </span>
                  ) : level}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Allocation Donut */}
          <AllocationDonut
            stocks={er.stocksPct}
            bonds={er.bondsPct}
            cash={er.cashPct}
            alternatives={er.alternativesPct}
          />

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
                  style={{ backgroundColor: theme.surfaceGlass, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: theme.text, borderColor: theme.borderGlass, fontFamily: theme.fontFamily, minHeight: "48px" }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              role="switch"
              type="button"
              aria-checked={er.preferTaxEfficient}
              onClick={() => updateField("expensesRisk.preferTaxEfficient", !er.preferTaxEfficient)}
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              style={{ background: er.preferTaxEfficient ? `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` : `${theme.textMuted}40` }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full shadow transition-transform"
                style={{
                  transform: er.preferTaxEfficient ? "translateX(22px)" : "translateX(2px)",
                  background: er.preferTaxEfficient ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` : "white",
                }}
              />
            </button>
            <span className="text-sm" style={{ color: theme.text }}>Prefer Tax-Efficient Investments</span>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
