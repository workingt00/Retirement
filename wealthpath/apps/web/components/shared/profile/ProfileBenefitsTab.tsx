"use client";

import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import SSClaimingSlider from "@/components/shared/profile/SSClaimingSlider";
import InsightCard from "@/components/shared/profile/InsightCard";
import AnimatedStack, { CollapsibleSection } from "@/components/shared/AnimatedStack";
import { staggerItem } from "@/lib/animations";

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

export default function ProfileBenefitsTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  const isMarried = plan.personal.filingStatus === "MFJ" || plan.personal.filingStatus === "MFS";
  const monthlyBenefit = plan.socialSecurity.monthlyBenefitAtFRA;
  const claimingAge = plan.socialSecurity.claimingAge;

  return (
    <AnimatedStack gap={32}>
      {/* Social Security */}
      <motion.section variants={staggerItem}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Social Security</h3>
        <div className="space-y-4">
          <SSClaimingSlider
            value={claimingAge}
            onChange={(v) => updateField("socialSecurity.claimingAge", v)}
          />

          <CurrencyInput
            label="Expected Monthly Benefit"
            value={monthlyBenefit}
            onChange={(v) => updateField("socialSecurity.monthlyBenefitAtFRA", v)}
          />

          {monthlyBenefit > 0 && (
            <InsightCard icon="chart" variant="info">
              Annual Social Security income: <strong>{fmtCurrency(monthlyBenefit * 12)}</strong> starting at age <strong>{claimingAge}</strong>
            </InsightCard>
          )}

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
      </motion.section>

      {/* Pension */}
      <motion.section variants={staggerItem}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Pension</h3>
        <div className="space-y-4">
          <motion.div
            className="flex items-center gap-3"
            animate={
              plan.benefits.hasPension
                ? { scale: [1, 1.05, 1] }
                : undefined
            }
            transition={{ duration: 0.3 }}
          >
            <button
              role="switch"
              type="button"
              aria-checked={plan.benefits.hasPension}
              onClick={() => updateField("benefits.hasPension", !plan.benefits.hasPension)}
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
              style={{ background: plan.benefits.hasPension ? `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})` : `${theme.textMuted}40` }}
            >
              <span
                className="inline-block h-5 w-5 rounded-full shadow transition-transform"
                style={{
                  transform: plan.benefits.hasPension ? "translateX(22px)" : "translateX(2px)",
                  background: plan.benefits.hasPension ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` : "white",
                }}
              />
            </button>
            <span className="text-sm font-medium" style={{ color: theme.text }}>
              Do you have a pension?
            </span>
          </motion.div>

          <CollapsibleSection open={plan.benefits.hasPension}>
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
              style={{
                backgroundColor: theme.surfaceGlass,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: `1px solid ${theme.borderGlass}`,
                borderRadius: "16px",
                padding: "16px",
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                  Pension Type
                </label>
                <select
                  value={plan.benefits.pensionType ?? "defined_benefit"}
                  onChange={(e) => updateField("benefits.pensionType", e.target.value)}
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
          </CollapsibleSection>
        </div>
      </motion.section>
    </AnimatedStack>
  );
}
