"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";

export default function ProfileIncomeTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CurrencyInput
          label="Current Annual Salary"
          value={plan.income.w2Salary}
          onChange={(v) => updateField("income.w2Salary", v)}
        />
        <CurrencyInput
          label="Annual Bonus / Commission / RSUs"
          value={plan.income.bonusIncome}
          onChange={(v) => updateField("income.bonusIncome", v)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CurrencyInput
          label="Other Income (rental, freelance, passive)"
          value={plan.income.otherIncome}
          onChange={(v) => updateField("income.otherIncome", v)}
        />
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Expected Annual Salary Growth (%)
          </label>
          <input
            type="number"
            value={plan.income.salaryGrowthRate}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= 20) updateField("income.salaryGrowthRate", v);
            }}
            min={0}
            max={20}
            step={0.5}
            className="w-24 rounded-lg border px-3 py-3"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Employer 401(k) Match (%)
          </label>
          <input
            type="number"
            value={plan.income.employerMatchPct}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= 100) updateField("income.employerMatchPct", v);
            }}
            min={0}
            max={100}
            step={1}
            className="w-24 rounded-lg border px-3 py-3"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
          />
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>e.g., 50% match</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Match Cap (% of salary)
          </label>
          <input
            type="number"
            value={plan.income.employerMatchCapPct}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 0 && v <= 100) updateField("income.employerMatchCapPct", v);
            }}
            min={0}
            max={100}
            step={1}
            className="w-24 rounded-lg border px-3 py-3"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
          />
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>e.g., up to 6% of salary</p>
        </div>
      </div>
    </div>
  );
}
