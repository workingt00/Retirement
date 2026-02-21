"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import { useSimulationContext } from "@/components/shared/SimulationProvider";
import CurrencyInput from "@/components/shared/CurrencyInput";
import InsightCard from "@/components/shared/profile/InsightCard";
import ProfileChips from "@/components/shared/profile/ProfileChips";
import AnimatedStack, { CollapsibleSection } from "@/components/shared/AnimatedStack";
import { staggerItem } from "@/lib/animations";

const CONTRIBUTION_OPTIONS = [
  { value: "traditional", label: "Traditional" },
  { value: "roth", label: "Roth" },
  { value: "both", label: "Both" },
];

const CONTRIBUTION_DESCRIPTIONS: Record<string, string> = {
  traditional: "Deducted from taxable income now",
  roth: "Withdrawals are tax-free in retirement",
  both: "Split between both strategies",
};

export default function ProfileTaxesTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);
  const { result } = useSimulationContext();
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!plan) return null;

  const standardDeductionAmount = plan.tax.standardDeduction
    ? `$${plan.tax.standardDeduction.toLocaleString()}`
    : "$16,100";

  return (
    <AnimatedStack gap={32}>
      {/* Deduction Type Cards */}
      <motion.div variants={staggerItem}>
        <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Deduction Type
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => updateField("tax.deductionType", "standard")}
            className="rounded-xl border-2 p-4 text-left transition-colors"
            style={{
              backgroundColor: theme.surfaceGlass,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${theme.borderGlass}`,
              ...(plan.tax.deductionType === "standard"
                ? {
                    borderColor: theme.gradientFrom + "50",
                    boxShadow: theme.glowPrimary,
                  }
                : {}),
            }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-semibold" style={{ color: theme.text }}>
              Standard Deduction
            </p>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              {standardDeductionAmount}
            </p>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => updateField("tax.deductionType", "itemized")}
            className="rounded-xl border-2 p-4 text-left transition-colors"
            style={{
              backgroundColor: theme.surfaceGlass,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid ${theme.borderGlass}`,
              ...(plan.tax.deductionType === "itemized"
                ? {
                    borderColor: theme.gradientFrom + "50",
                    boxShadow: theme.glowPrimary,
                  }
                : {}),
            }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-semibold" style={{ color: theme.text }}>
              Itemized Deductions
            </p>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              Enter your individual deduction amounts
            </p>
          </motion.button>
        </div>
      </motion.div>

      {/* Contribution Preference */}
      <motion.div variants={staggerItem}>
        <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Contribution Preference
        </label>
        <ProfileChips
          options={CONTRIBUTION_OPTIONS}
          value={plan.tax.contributionPreference}
          onChange={(v) => updateField("tax.contributionPreference", v)}
        />
        <p className="mt-2 text-xs" style={{ color: theme.textMuted }}>
          {CONTRIBUTION_DESCRIPTIONS[plan.tax.contributionPreference] ?? ""}
        </p>
      </motion.div>

      {/* Expected Retirement Tax Rate */}
      <motion.div variants={staggerItem} className="md:w-1/2">
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Expected Tax Rate in Retirement (%)
        </label>
        <input
          type="number"
          value={plan.tax.expectedRetirementTaxRate ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? undefined : parseFloat(e.target.value);
            if (v === undefined || (!isNaN(v) && v >= 0 && v <= 50)) {
              updateField("tax.expectedRetirementTaxRate", v);
            }
          }}
          min={0}
          max={50}
          step={1}
          placeholder="Auto-modeled"
          className="w-32 rounded-lg border px-3 py-3"
          style={{
            backgroundColor: theme.surfaceGlass,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: theme.text,
            borderColor: `${theme.textMuted}40`,
            fontFamily: theme.fontFamily,
            minHeight: "48px",
          }}
        />
        <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
          If blank, modeled from projected income
        </p>
      </motion.div>

      {/* Simulation Insight */}
      <CollapsibleSection open={result?.summary?.effectiveTaxRate != null}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="chart" variant="info">
            Estimated effective tax rate: <strong>{result?.summary?.effectiveTaxRate?.toFixed(1) ?? 0}%</strong>
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      {/* Advanced Toggle */}
      <motion.div variants={staggerItem}>
        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradientFrom}10, ${theme.gradientTo}10)`,
            color: theme.primary,
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="h-4 w-4 transition-transform"
            style={{ transform: showAdvanced ? "rotate(90deg)" : "rotate(0deg)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          I want more precision
        </motion.button>
      </motion.div>

      {/* Advanced Fields */}
      <CollapsibleSection open={showAdvanced}>
        <div
          className="space-y-4 rounded-xl p-5"
          style={{
            backgroundColor: theme.surfaceGlass,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${theme.borderGlass}`,
            boxShadow: theme.shadowCard,
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                Federal Marginal Tax Bracket (%)
              </label>
              <select
                value={plan.tax.federalTaxBracket ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : parseFloat(e.target.value);
                  updateField("tax.federalTaxBracket", v);
                }}
                className="w-full rounded-lg border py-3 pl-3 pr-8"
                style={{
                  backgroundColor: theme.surfaceGlass,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: theme.text,
                  borderColor: `${theme.textMuted}40`,
                  minHeight: "48px",
                }}
              >
                <option value="">Auto-derived from income</option>
                {[10, 12, 22, 24, 32, 35, 37].map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                State Tax Rate (%)
              </label>
              <input
                type="number"
                value={plan.tax.stateTaxRate ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : parseFloat(e.target.value);
                  if (v === undefined || (!isNaN(v) && v >= 0 && v <= 15)) {
                    updateField("tax.stateTaxRate", v);
                  }
                }}
                min={0}
                max={15}
                step={0.1}
                placeholder="Auto-derived"
                className="w-32 rounded-lg border px-3 py-3"
                style={{
                  backgroundColor: theme.surfaceGlass,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  color: theme.text,
                  borderColor: `${theme.textMuted}40`,
                  fontFamily: theme.fontFamily,
                  minHeight: "48px",
                }}
              />
            </div>
          </div>

          {plan.tax.deductionType === "itemized" && (
            <CurrencyInput
              label="Total Itemized Deductions"
              value={plan.tax.itemizedDeductions ?? 0}
              onChange={(v) => updateField("tax.itemizedDeductions", v)}
            />
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CurrencyInput
              label="Taxable Brokerage Balance"
              value={plan.tax.taxableBrokerageBalance}
              onChange={(v) => updateField("tax.taxableBrokerageBalance", v)}
            />
            <div className="flex items-center gap-3 pt-6">
              <button
                role="switch"
                type="button"
                aria-checked={plan.tax.amtApplicable}
                onClick={() => updateField("tax.amtApplicable", !plan.tax.amtApplicable)}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                style={{ backgroundColor: plan.tax.amtApplicable ? theme.primary : `${theme.textMuted}40` }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: plan.tax.amtApplicable ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
              <span className="text-sm" style={{ color: theme.text }}>Subject to AMT</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </AnimatedStack>
  );
}
