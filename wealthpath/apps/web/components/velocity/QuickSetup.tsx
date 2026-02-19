"use client";

import { useRouter } from "next/navigation";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import AgeInput from "@/components/shared/AgeInput";
import { STATE_TAX_RATES, DEFAULT_PLAN } from "@wealthpath/engine";

const STATES = Object.keys(STATE_TAX_RATES);

export default function QuickSetup() {
  const { theme } = useMode();
  const router = useRouter();
  const { plan, updateField } = usePlanStore();

  if (!plan) return null;

  const handleDefaults = () => {
    usePlanStore.getState().setPlan({
      ...DEFAULT_PLAN,
      id: plan.id,
      mode: "velocity",
      createdAt: plan.createdAt,
      updatedAt: new Date(),
    });
    router.push("/dashboard");
  };

  return (
    <div style={{ fontFamily: theme.fontFamily }}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: theme.text }}>
          Quick Setup
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Essentials */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Essentials
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <AgeInput label="Age" value={plan.personal.currentAge} onChange={(v) => updateField("personal.currentAge", v)} />
            <AgeInput label="Retire at" value={plan.personal.retirementAge} onChange={(v) => updateField("personal.retirementAge", v)} min={30} max={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>Filing</label>
              <select
                value={plan.personal.filingStatus}
                onChange={(e) => {
                  const v = e.target.value;
                  updateField("personal.filingStatus", v);
                  const sd: Record<string,number> = { MFJ: 32200, SINGLE: 16100, MFS: 16100, HOH: 24150 };
                  updateField("tax.standardDeduction", sd[v] ?? 16100);
                }}
                className="w-full rounded border py-2 pl-2 pr-7 text-sm"
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40` }}
              >
                <option value="SINGLE">Single</option>
                <option value="MFJ">Married Filing Jointly</option>
                <option value="MFS">Married Filing Separately</option>
                <option value="HOH">Head of Household</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>State</label>
              <select
                value={plan.personal.state}
                onChange={(e) => {
                  updateField("personal.state", e.target.value);
                  updateField("personal.stateEffectiveRate", STATE_TAX_RATES[e.target.value] ?? 0);
                }}
                className="w-full rounded border py-2 pl-2 pr-7 text-sm"
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40` }}
              >
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <CurrencyInput label="W2 Salary" value={plan.income.w2Salary} onChange={(v) => updateField("income.w2Salary", v)} />
          <CurrencyInput label="1099 Income" value={plan.income.w9Income} onChange={(v) => updateField("income.w9Income", v)} />
          <div>
            <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>Annual raise %</label>
            <input
              type="number"
              value={plan.income.annualRaise}
              onChange={(e) => updateField("income.annualRaise", parseFloat(e.target.value) || 0)}
              step={0.5}
              className="w-20 rounded border px-2 py-1 text-sm"
              style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono }}
            />
          </div>
          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Social Security
          </h2>
          <CurrencyInput label="Monthly benefit at FRA" value={plan.socialSecurity.monthlyBenefitAtFRA} onChange={(v) => updateField("socialSecurity.monthlyBenefitAtFRA", v)} />
          <div className="grid grid-cols-2 gap-3">
            <AgeInput label="Claim age" value={plan.socialSecurity.claimingAge} onChange={(v) => updateField("socialSecurity.claimingAge", v)} min={62} max={70} />
            <div>
              <label className="mb-1 block text-xs" style={{ color: theme.textMuted }}>Quarters</label>
              <input
                type="number"
                value={plan.socialSecurity.quartersEarned}
                onChange={(e) => updateField("socialSecurity.quartersEarned", Math.min(parseInt(e.target.value) || 0, 40))}
                className="w-20 rounded border px-2 py-1 text-sm"
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono }}
              />
            </div>
          </div>
        </div>

        {/* Right: Accounts + Expenses */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Account Balances
          </h2>
          <CurrencyInput label="Trad 401k" value={plan.balances.traditional401k} onChange={(v) => updateField("balances.traditional401k", v)} />
          <CurrencyInput label="Roth IRA" value={plan.balances.rothIRA} onChange={(v) => updateField("balances.rothIRA", v)} />
          <CurrencyInput label="Private Portfolio" value={plan.balances.privatePortfolio} onChange={(v) => updateField("balances.privatePortfolio", v)} />
          <CurrencyInput label="Foreign Pension" value={plan.balances.foreignPension} onChange={(v) => updateField("balances.foreignPension", v)} />
          <CurrencyInput label="529 Plan" value={plan.balances.plan529} onChange={(v) => updateField("balances.plan529", v)} />

          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Housing
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label="Monthly mortgage" value={plan.housing.monthlyMortgage} onChange={(v) => updateField("housing.monthlyMortgage", v)} />
            <CurrencyInput label="Property tax" value={plan.housing.monthlyPropertyTax} onChange={(v) => updateField("housing.monthlyPropertyTax", v)} />
            <CurrencyInput label="Insurance" value={plan.housing.monthlyInsurance} onChange={(v) => updateField("housing.monthlyInsurance", v)} />
            <CurrencyInput label="HOA" value={plan.housing.monthlyHOA} onChange={(v) => updateField("housing.monthlyHOA", v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label="Mortgage balance" value={plan.housing.mortgageBalance} onChange={(v) => updateField("housing.mortgageBalance", v)} />
            <AgeInput label="Mortgage paid off age" value={plan.housing.mortgageEndAge} onChange={(v) => updateField("housing.mortgageEndAge", v)} min={30} max={80} />
          </div>

          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Monthly Expenses
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <CurrencyInput label="Groceries" value={plan.expenses.groceries} onChange={(v) => updateField("expenses.groceries", v)} />
            <CurrencyInput label="Dining out" value={plan.expenses.diningOut} onChange={(v) => updateField("expenses.diningOut", v)} />
            <CurrencyInput label="Kids expenses" value={plan.expenses.kidsExpenses} onChange={(v) => updateField("expenses.kidsExpenses", v)} />
            <CurrencyInput label="Healthcare premium" value={plan.healthcare.monthlyPremium} onChange={(v) => updateField("healthcare.monthlyPremium", v)} />
          </div>
          <CurrencyInput label="Travel & hobbies (annual)" value={plan.lifestyle.annualTravelHobby} onChange={(v) => updateField("lifestyle.annualTravelHobby", v)} />

          <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
            Investment Style
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {(["conservative", "moderate", "aggressive"] as const).map((style) => (
              <button
                key={style}
                onClick={() => {
                  updateField("investment.style", style);
                  const g = { conservative: [0.07, 0.08], moderate: [0.10, 0.12], aggressive: [0.13, 0.15] }[style];
                  updateField("investment.growth401k", g[0]);
                  updateField("investment.growthRothPortfolio", g[1]);
                }}
                className="rounded border px-2 py-2 text-xs font-medium capitalize"
                style={{
                  borderColor: plan.investment.style === style ? theme.primary : `${theme.textMuted}30`,
                  backgroundColor: plan.investment.style === style ? `${theme.primary}15` : "transparent",
                  color: plan.investment.style === style ? theme.primary : theme.textMuted,
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={handleDefaults}
          className="rounded px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: `${theme.textMuted}20`, color: theme.textMuted }}
        >
          Start with defaults
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded px-6 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: theme.primary }}
        >
          Launch Dashboard
        </button>
      </div>
    </div>
  );
}
