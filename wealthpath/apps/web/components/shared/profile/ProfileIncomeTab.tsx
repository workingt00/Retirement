"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import ProfileChips from "@/components/shared/profile/ProfileChips";
import InsightCard from "@/components/shared/profile/InsightCard";
import AnimatedValue from "@/components/shared/profile/AnimatedValue";
import AnimatedStack, { CollapsibleSection } from "@/components/shared/AnimatedStack";
import { staggerItem } from "@/lib/animations";
import { computeAnnualDeferral, computeEmployerMatchFromTiers, IRS_401K_ELECTIVE_LIMIT } from "@wealthpath/engine";
import type { EmployerMatchTier } from "@wealthpath/engine";

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

const DEFERRAL_MODE_OPTIONS = [
  { value: "percent", label: "% of my paycheck" },
  { value: "dollar", label: "$ per paycheck" },
];

const PAY_FREQUENCY_OPTIONS = [
  { value: "12", label: "Monthly" },
  { value: "24", label: "Semi-monthly" },
  { value: "26", label: "Biweekly" },
  { value: "52", label: "Weekly" },
];

interface MatchPreset {
  label: string;
  horizonLabel: string;
  tiers: EmployerMatchTier[];
}

const MATCH_PRESETS: MatchPreset[] = [
  { label: "No match", horizonLabel: "No match 😢", tiers: [] },
  { label: "100% up to 3%", horizonLabel: "3% dollar-for-dollar", tiers: [{ matchPct: 100, upToPct: 3 }] },
  { label: "100%/50% split", horizonLabel: "Classic 100/50 split", tiers: [{ matchPct: 100, upToPct: 3 }, { matchPct: 50, upToPct: 2 }] },
  { label: "100% up to 6%", horizonLabel: "Generous 6%", tiers: [{ matchPct: 100, upToPct: 6 }] },
];

export default function ProfileIncomeTab() {
  const { theme, mode } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);
  const addMatchTier = usePlanStore((s) => s.addMatchTier);
  const removeMatchTier = usePlanStore((s) => s.removeMatchTier);
  const updateMatchTier = usePlanStore((s) => s.updateMatchTier);
  const isHorizon = mode === "horizon";

  // All hooks must be above any early return to satisfy Rules of Hooks
  const sliderRef = useRef<HTMLInputElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [debouncedGrowth, setDebouncedGrowth] = useState(() => plan?.income.salaryGrowthRate ?? 0);
  const storeTimer = useRef<ReturnType<typeof setTimeout>>();
  const displayTimer = useRef<ReturnType<typeof setTimeout>>();
  const badgeTimer = useRef<ReturnType<typeof setTimeout>>();
  const draggingRef = useRef(false);

  const salaryGrowthRate = plan?.income.salaryGrowthRate ?? 0;

  // Sync from store only for external changes (plan load), never during drag
  useEffect(() => {
    if (draggingRef.current) return;
    if (sliderRef.current) sliderRef.current.value = String(salaryGrowthRate);
    if (badgeRef.current) badgeRef.current.textContent = `${salaryGrowthRate}%`;
    setDebouncedGrowth(salaryGrowthRate);
  }, [salaryGrowthRate]);

  // Badge updates instantly via DOM ref (zero re-renders).
  // InsightCard + store update via debounced timers only.
  const handleSliderInput = useCallback(() => {
    const v = parseFloat(sliderRef.current?.value ?? "0");
    draggingRef.current = true;

    // Show rounded whole number during drag for visual stability;
    // precise value (e.g. 6.5%) shown on release in handleSliderEnd
    if (badgeRef.current) badgeRef.current.textContent = `${Math.round(v)}%`;

    // Debounced InsightCard update (triggers AnimatedValue)
    clearTimeout(displayTimer.current);
    displayTimer.current = setTimeout(() => setDebouncedGrowth(v), 400);

    // Debounced store persist
    clearTimeout(storeTimer.current);
    storeTimer.current = setTimeout(() => updateField("income.salaryGrowthRate", v), 500);
  }, [updateField]);

  const handleSliderEnd = useCallback(() => {
    // Flush final badge value immediately on release
    clearTimeout(badgeTimer.current);
    const v = parseFloat(sliderRef.current?.value ?? "0");
    if (badgeRef.current) badgeRef.current.textContent = `${v}%`;
    // Keep dragging flag a bit longer so store sync doesn't snap slider
    setTimeout(() => { draggingRef.current = false; }, 600);
  }, []);

  if (!plan) return null;

  const { w2Salary, bonusIncome, otherIncome } = plan.income;
  const commissionIncome = plan.income.commissionIncome ?? 0;
  const rsuIncome = plan.income.rsuIncome ?? 0;
  const deferralMode = plan.income.deferralMode ?? "percent";
  const deferralPercent = plan.income.deferralPercent ?? 0;
  const deferralDollarPerPaycheck = plan.income.deferralDollarPerPaycheck ?? 0;
  const payFrequency = plan.income.payFrequency ?? 24;
  const maxDeferralPct = plan.income.maxDeferralPct ?? 0;
  const matchTiers = plan.income.employerMatchTiers ?? [];

  const totalComp = w2Salary + bonusIncome + commissionIncome + rsuIncome + otherIncome;
  // Deferral base = W2 gross comp (salary + bonus + commission); RSUs are stock-paid and excluded
  const deferralBase = w2Salary + bonusIncome + commissionIncome;
  const projectedSalary10y = w2Salary * Math.pow(1 + debouncedGrowth / 100, 10);

  // Compute live deferral + match values
  const annualDeferral = computeAnnualDeferral(
    deferralBase, deferralMode, deferralPercent,
    deferralDollarPerPaycheck, payFrequency, maxDeferralPct, IRS_401K_ELECTIVE_LIMIT,
  );
  const effectiveDeferralPct = deferralBase > 0 ? (annualDeferral / deferralBase) * 100 : 0;
  const annualMatch = computeEmployerMatchFromTiers(deferralBase, effectiveDeferralPct, matchTiers);
  const total401k = annualDeferral + annualMatch;

  // Figure out max matchable deferral from tiers
  const maxMatchablePct = matchTiers.reduce((sum, t) => sum + t.upToPct, 0);
  const leavingOnTable = effectiveDeferralPct < maxMatchablePct && matchTiers.length > 0
    ? computeEmployerMatchFromTiers(deferralBase, maxMatchablePct, matchTiers) - annualMatch
    : 0;

  // Check if current tiers match a preset
  const activePresetIdx = MATCH_PRESETS.findIndex((p) => {
    if (p.tiers.length !== matchTiers.length) return false;
    return p.tiers.every((t, i) => matchTiers[i]?.matchPct === t.matchPct && matchTiers[i]?.upToPct === t.upToPct);
  });
  const isCustomTiers = matchTiers.length > 0 && activePresetIdx === -1;

  return (
    <AnimatedStack gap={32}>
      {/* ═══════════════ SALARY ═══════════════ */}
      <motion.div variants={staggerItem}>
        <CurrencyInput
          label="Current Annual Salary"
          value={w2Salary}
          onChange={(v) => updateField("income.w2Salary", v)}
        />
      </motion.div>

      {/* ═══════════════ BONUS / COMMISSION / RSUs ═══════════════ */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-3" variants={staggerItem}>
        <CurrencyInput
          label="Annual Bonus"
          value={bonusIncome}
          onChange={(v) => updateField("income.bonusIncome", v)}
        />
        <CurrencyInput
          label="Commission"
          value={commissionIncome}
          onChange={(v) => updateField("income.commissionIncome", v)}
        />
        <CurrencyInput
          label="RSUs / Equity"
          value={rsuIncome}
          onChange={(v) => updateField("income.rsuIncome", v)}
        />
      </motion.div>

      {/* ═══════════════ OTHER INCOME ═══════════════ */}
      <motion.div variants={staggerItem}>
        <CurrencyInput
          label="Other Income (rental, freelance, passive)"
          value={otherIncome}
          onChange={(v) => updateField("income.otherIncome", v)}
        />
      </motion.div>

      {/* Total compensation insight — collapses smoothly when no salary */}
      <CollapsibleSection open={w2Salary > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="chart" variant="neutral">
            Total compensation: <strong>{fmtCurrency(totalComp)}</strong>/yr
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      {/* ═══════════════ SALARY GROWTH ═══════════════ */}
      <motion.div variants={staggerItem}>
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Expected Annual Salary Growth (%)
        </label>
        <div
          style={{
            backgroundColor: theme.surfaceGlass,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1px solid ${theme.borderGlass}`,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div className="flex items-center gap-3">
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={20}
              step={0.5}
              defaultValue={salaryGrowthRate}
              onInput={handleSliderInput}
              onMouseUp={handleSliderEnd}
              onTouchEnd={handleSliderEnd}
              className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
              style={{
                accentColor: theme.gradientFrom,
                backgroundColor: `${theme.textMuted}20`,
              }}
            />
            <span
              className="rounded-md py-1 text-center text-sm font-medium"
              style={{
                width: 50,
                minWidth: 50,
                maxWidth: 50,
                flexShrink: 0,
                overflow: "hidden",
                fontVariantNumeric: "tabular-nums",
                background: `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)`,
                backgroundClip: "padding-box",
                fontFamily: theme.fontMono,
              }}
            >
              <span
                ref={badgeRef}
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {salaryGrowthRate}%
              </span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Salary growth insight — collapses when no salary or zero growth */}
      <CollapsibleSection open={w2Salary > 0 && debouncedGrowth > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="sparkle" variant="success">
            At <strong><AnimatedValue value={`${Math.round(debouncedGrowth * 10) / 10}%`} /></strong> annual growth, projected salary in 10 years:{" "}
            <strong><AnimatedValue value={fmtCurrency(projectedSalary10y)} /></strong>
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      {/* ═══════════════ 401(k) DEFERRAL ═══════════════ */}
      <motion.div variants={staggerItem}>
        <div className="mb-3">
          <label className="block text-base font-semibold" style={{ color: theme.text }}>
            {isHorizon ? "Your 401(k) — Let's Unlock Free Money 💰" : "401(k) Optimization"}
          </label>
          <div
            style={{
              height: 2,
              width: 40,
              background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderRadius: 1,
              marginTop: 6,
              marginBottom: 4,
            }}
          />
        </div>

        {/* Deferral mode toggle */}
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          {isHorizon ? "How much are you putting in?" : "Deferral Election"}
        </label>
        <p className="mb-3 text-xs" style={{ color: theme.textMuted }}>
          {isHorizon
            ? "This is the % of each paycheck that goes straight into your 401(k) — before taxes, before you can spend it. Future you will thank present you."
            : "Pre-tax salary deferral as % of gross or $ per pay period"}
        </p>

        <ProfileChips
          options={DEFERRAL_MODE_OPTIONS}
          value={deferralMode}
          onChange={(v) => updateField("income.deferralMode", v)}
        />

        {/* Both panels always mounted; instant swap via visibility, no transition */}
        <div className="mt-3" style={{ display: "grid" }}>
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            style={{
              gridArea: "1 / 1",
              opacity: deferralMode === "percent" ? 1 : 0,
              pointerEvents: deferralMode === "percent" ? "auto" : "none",
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: theme.textMuted }}>
                Deferral (% of W2 gross)
              </label>
              <div
                style={{
                  backgroundColor: theme.surfaceGlass,
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: `1px solid ${theme.borderGlass}`,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={deferralPercent}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) updateField("income.deferralPercent", v);
                    }}
                    className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
                    style={{
                      accentColor: theme.gradientFrom,
                      backgroundColor: `${theme.textMuted}20`,
                    }}
                    tabIndex={deferralMode === "percent" ? 0 : -1}
                  />
                  <span
                    className="rounded-md py-1 text-center text-sm font-medium"
                    style={{
                      width: 50, minWidth: 50, maxWidth: 50, flexShrink: 0, overflow: "hidden",
                      fontVariantNumeric: "tabular-nums",
                      background: `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)`,
                      backgroundClip: "padding-box",
                      fontFamily: theme.fontMono,
                    }}
                  >
                    <span style={{
                      background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    }}>
                      {deferralPercent}%
                    </span>
                  </span>
                </div>
              </div>
              {deferralBase > 0 && deferralPercent > 0 && (
                <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                  {fmtCurrency(annualDeferral)}/yr
                </p>
              )}
            </div>
          </div>
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            style={{
              gridArea: "1 / 1",
              opacity: deferralMode === "dollar" ? 1 : 0,
              pointerEvents: deferralMode === "dollar" ? "auto" : "none",
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <CurrencyInput
              label="$ per paycheck"
              value={deferralDollarPerPaycheck}
              onChange={(v) => updateField("income.deferralDollarPerPaycheck", v)}
            />
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
                Pay frequency
              </label>
              <select
                value={payFrequency}
                onChange={(e) => updateField("income.payFrequency", Number(e.target.value))}
                className="w-full py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.textMuted}40`,
                  borderRadius: theme.radiusInput,
                  color: theme.text,
                  fontFamily: theme.fontFamily,
                  minHeight: "44px",
                }}
                tabIndex={deferralMode === "dollar" ? 0 : -1}
              >
                {PAY_FREQUENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {deferralBase > 0 && deferralDollarPerPaycheck > 0 && (
                <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                  ≈ {effectiveDeferralPct.toFixed(1)}% of gross ({fmtCurrency(annualDeferral)}/yr)
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Deferral insight — always rendered, content updates in place */}
      <motion.div variants={staggerItem}>
        <InsightCard
          icon={deferralBase > 0 && annualDeferral > 0 ? "chart" : "info"}
          variant={deferralBase > 0 && annualDeferral > 0 ? "info" : "neutral"}
        >
          {deferralBase > 0 && annualDeferral > 0 ? (
            isHorizon ? (
              <div>
                You&apos;re putting away <strong>{fmtCurrency(annualDeferral)}/yr</strong> — that&apos;s{" "}
                <strong>{fmtCurrency(annualDeferral / 12)}/mo</strong> working for your future self
              </div>
            ) : (
              <div>
                Annual deferral: <strong>{fmtCurrency(annualDeferral)}</strong> ({effectiveDeferralPct.toFixed(1)}% of gross)
              </div>
            )
          ) : (
            <div style={{ color: theme.textMuted }}>
              {isHorizon ? "Set your deferral above to see how much you\u2019re saving" : "Deferral not yet configured"}
            </div>
          )}
        </InsightCard>
      </motion.div>

      {/* Leaving money on table — always rendered when match tiers exist, content updates in place */}
      <CollapsibleSection open={matchTiers.length > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard
            icon={leavingOnTable > 0 ? "info" : "sparkle"}
            variant={leavingOnTable > 0 ? "neutral" : "success"}
          >
            {leavingOnTable > 0 ? (
              isHorizon ? (
                <div>
                  💡 You&apos;re only deferring {effectiveDeferralPct.toFixed(0)}% but your employer matches up to {maxMatchablePct}% — you&apos;re leaving{" "}
                  <strong>{fmtCurrency(leavingOnTable)}/yr</strong> of free money on the table!
                </div>
              ) : (
                <div>
                  ⚠️ Deferral below match ceiling — <strong>{fmtCurrency(leavingOnTable)}/yr</strong> unmatched
                </div>
              )
            ) : (
              isHorizon ? (
                <div>You&apos;re capturing your full employer match — nice work! 🎯</div>
              ) : (
                <div>Full match captured — no unmatched employer contributions</div>
              )
            )}
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      {/* ═══════════════ EMPLOYER MATCH TIERS ═══════════════ */}
      <motion.div variants={staggerItem}>
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          {isHorizon ? "What does your employer chip in?" : "Employer Match Schedule"}
        </label>
        <p className="mb-3 text-xs" style={{ color: theme.textMuted }}>
          {isHorizon
            ? "This is literally free money. Your employer adds to your 401(k) based on how much you contribute. Check your benefits portal or HR if you're not sure."
            : "Tiered match formula from your plan summary document"}
        </p>

        {/* Preset chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {MATCH_PRESETS.map((preset, idx) => {
            const isActive = idx === activePresetIdx;
            return (
              <button
                key={idx}
                onClick={() => updateField("income.employerMatchTiers", preset.tiers)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? theme.gradientFrom : theme.surfaceGlass,
                  color: isActive ? "#fff" : theme.text,
                  border: `1px solid ${isActive ? theme.gradientFrom : theme.borderGlass}`,
                  backdropFilter: isActive ? undefined : "blur(8px)",
                  WebkitBackdropFilter: isActive ? undefined : "blur(8px)",
                }}
              >
                {isHorizon ? preset.horizonLabel : preset.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              if (!isCustomTiers && matchTiers.length === 0) {
                updateField("income.employerMatchTiers", [{ matchPct: 100, upToPct: 3 }]);
              }
            }}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: isCustomTiers ? theme.gradientFrom : theme.surfaceGlass,
              color: isCustomTiers ? "#fff" : theme.text,
              border: `1px solid ${isCustomTiers ? theme.gradientFrom : theme.borderGlass}`,
              backdropFilter: isCustomTiers ? undefined : "blur(8px)",
              WebkitBackdropFilter: isCustomTiers ? undefined : "blur(8px)",
            }}
          >
            Custom
          </button>
        </div>

        {/* Tier rows */}
        {matchTiers.length > 0 && (
          <div
            className="space-y-2 rounded-xl p-3"
            style={{
              backgroundColor: theme.surfaceGlass,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${theme.borderGlass}`,
            }}
          >
            {matchTiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs" style={{ color: theme.textMuted }}>Match</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={tier.matchPct}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 200) updateMatchTier(i, "matchPct", v);
                  }}
                  className="w-16 rounded-lg border px-2 py-1.5 text-center text-sm"
                  style={{
                    backgroundColor: theme.surfaceGlass,
                    border: `1px solid ${theme.borderGlass}`,
                    color: theme.text,
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
                <span className="text-xs" style={{ color: theme.textMuted }}>% up to</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={tier.upToPct}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 0 && v <= 100) updateMatchTier(i, "upToPct", v);
                  }}
                  className="w-16 rounded-lg border px-2 py-1.5 text-center text-sm"
                  style={{
                    backgroundColor: theme.surfaceGlass,
                    border: `1px solid ${theme.borderGlass}`,
                    color: theme.text,
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
                <span className="text-xs" style={{ color: theme.textMuted }}>% of salary</span>
                <button
                  onClick={() => removeMatchTier(i)}
                  className="ml-auto rounded-full p-1 text-xs transition-colors hover:bg-red-100"
                  style={{ color: theme.textMuted }}
                  aria-label="Remove tier"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addMatchTier}
              className="mt-1 text-xs font-medium transition-colors"
              style={{ color: theme.gradientFrom }}
            >
              + Add another tier
            </button>
          </div>
        )}
      </motion.div>

      {/* Match + 401(k) total insights — collapse smoothly */}
      <CollapsibleSection open={annualMatch > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="sparkle" variant="success">
            {isHorizon ? (
              <div>
                Your employer is adding <strong>{fmtCurrency(annualMatch)}/yr</strong> for free! That&apos;s{" "}
                <strong>{fmtCurrency(annualMatch / 12)}/mo</strong> you didn&apos;t have to earn 🎉
              </div>
            ) : (
              <div>
                Employer match: <strong>{fmtCurrency(annualMatch)}/yr</strong>{" "}
                (effective {deferralBase > 0 ? ((annualMatch / deferralBase) * 100).toFixed(1) : 0}% of gross)
              </div>
            )}
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

      <CollapsibleSection open={total401k > 0}>
        <motion.div variants={staggerItem}>
          <InsightCard icon="target" variant="info">
            {isHorizon ? (
              <div>
                Together, <strong>{fmtCurrency(total401k)}/yr</strong> is flowing into your 401(k) —{" "}
                <strong>{fmtCurrency(total401k / 12)} every single month</strong> building your future
              </div>
            ) : (
              <div>
                Total 401(k) inflow: <strong>{fmtCurrency(total401k)}/yr</strong>{" "}
                ({deferralBase > 0 ? ((total401k / deferralBase) * 100).toFixed(1) : 0}% of gross)
              </div>
            )}
          </InsightCard>
        </motion.div>
      </CollapsibleSection>

    </AnimatedStack>
  );
}
