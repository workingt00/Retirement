"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import type { ProfileAccount, AccountType } from "@wealthpath/engine";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  "401k": "401(k)",
  "403b": "403(b)",
  traditional_ira: "Traditional IRA",
  roth_ira: "Roth IRA",
  sep_ira: "SEP IRA",
  simple_ira: "SIMPLE IRA",
  taxable_brokerage: "Taxable Brokerage",
  hsa: "HSA",
};

const STRATEGY_PRESETS = [
  { key: "conservative" as const, label: "Conservative", rate: 4.0, color: "#3B82F6" },
  { key: "moderate" as const, label: "Moderate", rate: 6.0, color: "#22C55E" },
  { key: "aggressive" as const, label: "Aggressive", rate: 8.5, color: "#F97316" },
];

function AccountCard({ account }: { account: ProfileAccount }) {
  const { theme } = useMode();
  const updateAccount = usePlanStore((s) => s.updateAccount);
  const removeAccount = usePlanStore((s) => s.removeAccount);
  const accountCount = usePlanStore((s) => s.plan?.accounts.length ?? 0);

  const handleStrategyClick = (preset: typeof STRATEGY_PRESETS[number]) => {
    updateAccount(account.id, "investmentStrategyPreset", preset.key);
    updateAccount(account.id, "expectedReturnRate", preset.rate);
  };

  const handleSliderChange = (value: number) => {
    updateAccount(account.id, "expectedReturnRate", value);
    const matchingPreset = STRATEGY_PRESETS.find((p) => p.rate === value);
    updateAccount(account.id, "investmentStrategyPreset", matchingPreset ? matchingPreset.key : "custom");
  };

  return (
    <div
      className="rounded-xl border p-5"
      style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}20` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <select
          value={account.accountType}
          onChange={(e) => updateAccount(account.id, "accountType", e.target.value)}
          className="rounded-lg border py-2 pl-3 pr-8 text-sm font-medium"
          style={{ backgroundColor: theme.bg, color: theme.text, borderColor: `${theme.textMuted}40` }}
        >
          {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {accountCount > 1 && (
          <button
            onClick={() => removeAccount(account.id)}
            className="rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: "#EF4444", backgroundColor: "#EF444415" }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CurrencyInput
          label="Current Balance"
          value={account.currentBalance}
          onChange={(v) => updateAccount(account.id, "currentBalance", v)}
        />
        <CurrencyInput
          label="Annual Contribution"
          value={account.annualContribution}
          onChange={(v) => updateAccount(account.id, "annualContribution", v)}
        />
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Investment Strategy
        </label>
        <div className="mb-3 flex gap-2">
          {STRATEGY_PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handleStrategyClick(preset)}
              className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: account.investmentStrategyPreset === preset.key ? preset.color : `${theme.textMuted}30`,
                backgroundColor: account.investmentStrategyPreset === preset.key ? `${preset.color}15` : "transparent",
                color: account.investmentStrategyPreset === preset.key ? preset.color : theme.textMuted,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1.0}
            max={15.0}
            step={0.1}
            value={account.expectedReturnRate}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span
            className="w-16 text-right text-sm font-medium"
            style={{ fontFamily: theme.fontMono, color: theme.text }}
          >
            {account.expectedReturnRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProfileAccountsTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const addAccount = usePlanStore((s) => s.addAccount);

  if (!plan) return null;

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: `${theme.primary}08`, border: `1px solid ${theme.primary}20` }}
      >
        <p className="text-sm" style={{ color: theme.primary }}>
          We've pre-filled your savings info from setup. Split this into individual accounts for more accurate projections.
        </p>
      </div>

      {plan.accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}

      <button
        onClick={addAccount}
        className="w-full rounded-xl border-2 border-dashed py-4 text-sm font-medium transition-colors hover:opacity-80"
        style={{ borderColor: `${theme.primary}40`, color: theme.primary }}
      >
        + Add Account
      </button>
    </div>
  );
}
