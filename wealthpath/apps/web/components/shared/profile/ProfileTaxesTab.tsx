"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";

export default function ProfileTaxesTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Always Visible */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Deduction Type
          </label>
          <select
            value={plan.tax.deductionType}
            onChange={(e) => updateField("tax.deductionType", e.target.value)}
            className="w-full rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            <option value="standard">Standard</option>
            <option value="itemized">Itemized</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Contribution Preference
          </label>
          <select
            value={plan.tax.contributionPreference}
            onChange={(e) => updateField("tax.contributionPreference", e.target.value)}
            className="w-full rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            <option value="traditional">Traditional (pre-tax)</option>
            <option value="roth">Roth (after-tax)</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      <div className="md:w-1/2">
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
          style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
        />
        <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
          If blank, modeled from projected income
        </p>
      </div>

      {/* Advanced Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        style={{ backgroundColor: `${theme.primary}10`, color: theme.primary }}
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
      </button>

      {showAdvanced && (
        <div className="space-y-4 rounded-xl border p-5" style={{ borderColor: `${theme.textMuted}20` }}>
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
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
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
                style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
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
      )}
    </div>
  );
}
