"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import AgeInput from "@/components/shared/AgeInput";

export default function ProfileBenefitsTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  const isMarried = plan.personal.filingStatus === "MFJ" || plan.personal.filingStatus === "MFS";

  return (
    <div className="space-y-8">
      {/* Social Security */}
      <section>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Social Security</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AgeInput
              label="Planned SS Claiming Age"
              value={plan.socialSecurity.claimingAge}
              onChange={(v) => updateField("socialSecurity.claimingAge", v)}
              min={62}
              max={70}
            />
            <CurrencyInput
              label="Expected Monthly Benefit"
              value={plan.socialSecurity.monthlyBenefitAtFRA}
              onChange={(v) => updateField("socialSecurity.monthlyBenefitAtFRA", v)}
            />
          </div>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            If blank, estimated from salary history. Check your estimate at{" "}
            <a
              href="https://www.ssa.gov/myaccount/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.primary }}
            >
              ssa.gov
            </a>
          </p>

          {isMarried && (
            <CurrencyInput
              label="Spousal / Survivor Benefit ($/mo)"
              value={plan.socialSecurity.spouseSsBenefit}
              onChange={(v) => updateField("socialSecurity.spouseSsBenefit", v)}
            />
          )}
        </div>
      </section>

      {/* Pension */}
      <section>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Pension</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              role="switch"
              type="button"
              aria-checked={plan.benefits.hasPension}
              onClick={() => updateField("benefits.hasPension", !plan.benefits.hasPension)}
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              style={{ backgroundColor: plan.benefits.hasPension ? theme.primary : `${theme.textMuted}40` }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: plan.benefits.hasPension ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
            <span className="text-sm font-medium" style={{ color: theme.text }}>
              Do you have a pension?
            </span>
          </div>

          {plan.benefits.hasPension && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                  Pension Type
                </label>
                <select
                  value={plan.benefits.pensionType ?? "defined_benefit"}
                  onChange={(e) => updateField("benefits.pensionType", e.target.value)}
                  className="w-full rounded-lg border py-3 pl-3 pr-8"
                  style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
                >
                  <option value="defined_benefit">Defined Benefit</option>
                  <option value="defined_contribution">Defined Contribution</option>
                </select>
              </div>
              <CurrencyInput
                label="Expected Monthly Pension"
                value={plan.benefits.pensionMonthlyBenefit ?? 0}
                onChange={(v) => updateField("benefits.pensionMonthlyBenefit", v)}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
