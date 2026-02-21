"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import InsightCard from "@/components/shared/profile/InsightCard";
import AnimatedStack, { CollapsibleSection } from "@/components/shared/AnimatedStack";
import { staggerItem, scaleIn } from "@/lib/animations";
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

  const monthlyContribution = Math.round(account.annualContribution / 12);

  return (
    <motion.div
      className="rounded-xl p-5"
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${theme.borderGlass}`,
        boxShadow: theme.shadowCard,
      }}
      whileHover={{ boxShadow: theme.shadowCardHover }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <select
          value={account.accountType}
          onChange={(e) => updateAccount(account.id, "accountType", e.target.value)}
          className="rounded-lg border py-2 pl-3 pr-8 text-sm font-medium"
          style={{
            backgroundColor: theme.surfaceGlass,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: theme.text,
            borderColor: `${theme.textMuted}40`,
          }}
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
        <div>
          <CurrencyInput
            label="Annual Contribution"
            value={account.annualContribution}
            onChange={(v) => updateAccount(account.id, "annualContribution", v)}
          />
          {account.annualContribution > 0 && (
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              <strong>${monthlyContribution.toLocaleString()}/month</strong>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Investment Strategy
        </label>
        <div className="mb-3 flex gap-2">
          {STRATEGY_PRESETS.map((preset) => {
            const isSelected = account.investmentStrategyPreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handleStrategyClick(preset)}
                className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: isSelected ? `${preset.color}40` : `${theme.textMuted}30`,
                  backgroundColor: isSelected ? "transparent" : "transparent",
                  backgroundImage: isSelected
                    ? `linear-gradient(135deg, ${preset.color}20, ${preset.color}10)`
                    : "none",
                  color: isSelected ? preset.color : theme.textMuted,
                  boxShadow: isSelected ? `0 0 12px ${preset.color}20` : "none",
                }}
              >
                {preset.label}
              </button>
            );
          })}
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
    </motion.div>
  );
}

export default function ProfileAccountsTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const addAccount = usePlanStore((s) => s.addAccount);

  if (!plan) return null;

  const totalBalance = plan.accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <AnimatedStack gap={16}>
      <motion.div variants={staggerItem}>
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: `${theme.primary}08`, border: `1px solid ${theme.primary}20` }}
        >
          <p className="text-sm" style={{ color: theme.primary }}>
            We've pre-filled your savings info from setup. Split this into individual accounts for more accurate projections.
          </p>
        </div>
      </motion.div>

      <CollapsibleSection open={totalBalance > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="chart" variant="info">
            Total portfolio balance: <strong>${totalBalance.toLocaleString()}</strong>
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      <AnimatePresence mode="popLayout">
        {plan.accounts.map((account) => (
          <motion.div
            key={account.id}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <AccountCard account={account} />
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.div variants={staggerItem}>
        <motion.button
          onClick={addAccount}
          className="w-full rounded-xl border-2 border-dashed py-4 text-sm font-medium transition-colors"
          style={{ borderColor: theme.gradientFrom, color: theme.primary }}
          whileHover={{ boxShadow: theme.glowPrimary }}
          transition={{ duration: 0.2 }}
        >
          + Add Account
        </motion.button>
      </motion.div>
    </AnimatedStack>
  );
}
