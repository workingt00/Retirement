"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import ProfileChips from "@/components/shared/profile/ProfileChips";
import InsightCard from "@/components/shared/profile/InsightCard";
import AnimatedValue from "@/components/shared/profile/AnimatedValue";
import { staggerContainer, staggerItem } from "@/lib/animations";

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

const SALARY_QUICK_OPTIONS = [
  { value: "50000", label: "$50K" },
  { value: "75000", label: "$75K" },
  { value: "100000", label: "$100K" },
  { value: "150000", label: "$150K" },
  { value: "200000", label: "$200K" },
  { value: "300000", label: "$300K" },
];

export default function ProfileIncomeTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  // All hooks must be above any early return to satisfy Rules of Hooks
  const sliderRef = useRef<HTMLInputElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const [debouncedGrowth, setDebouncedGrowth] = useState(0);
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

  const { w2Salary, bonusIncome, otherIncome, employerMatchPct, employerMatchCapPct } = plan.income;

  const totalComp = w2Salary + bonusIncome + otherIncome;
  const matchValue = w2Salary * (employerMatchCapPct / 100) * (employerMatchPct / 100);
  const projectedSalary10y = w2Salary * Math.pow(1 + debouncedGrowth / 100, 10);

  const selectedSalaryChip = SALARY_QUICK_OPTIONS.find((o) => Number(o.value) === w2Salary)?.value ?? null;

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Salary + Bonus */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <CurrencyInput
          label="Current Annual Salary"
          value={w2Salary}
          onChange={(v) => updateField("income.w2Salary", v)}
        />
        <CurrencyInput
          label="Annual Bonus / Commission / RSUs"
          value={bonusIncome}
          onChange={(v) => updateField("income.bonusIncome", v)}
        />
      </motion.div>

      {/* Salary quick-select chips */}
      <motion.div variants={staggerItem}>
        <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Quick select salary
        </label>
        <ProfileChips
          options={SALARY_QUICK_OPTIONS}
          value={selectedSalaryChip}
          onChange={(v) => updateField("income.w2Salary", Number(v))}
        />
      </motion.div>

      {/* Other Income + Growth Rate */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <CurrencyInput
          label="Other Income (rental, freelance, passive)"
          value={otherIncome}
          onChange={(v) => updateField("income.otherIncome", v)}
        />
        <div>
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
        </div>
      </motion.div>

      {/* Match % + Cap % */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Employer 401(k) Match (%)
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
                max={100}
                step={1}
                value={employerMatchPct}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) updateField("income.employerMatchPct", v);
                }}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full"
                style={{
                  accentColor: theme.gradientFrom,
                  backgroundColor: `${theme.textMuted}20`,
                }}
              />
              <span
                className="min-w-[3rem] rounded-md px-2 py-1 text-center text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)`,
                  backgroundClip: "padding-box",
                  fontFamily: theme.fontMono,
                }}
              >
                <span
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {employerMatchPct}%
                </span>
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>e.g., 50% match</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Match Cap (% of salary)
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
                max={100}
                step={1}
                value={employerMatchCapPct}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) updateField("income.employerMatchCapPct", v);
                }}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full"
                style={{
                  accentColor: theme.gradientFrom,
                  backgroundColor: `${theme.textMuted}20`,
                }}
              />
              <span
                className="min-w-[3rem] rounded-md px-2 py-1 text-center text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom}15, ${theme.gradientTo}15)`,
                  backgroundClip: "padding-box",
                  fontFamily: theme.fontMono,
                }}
              >
                <span
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {employerMatchCapPct}%
                </span>
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>e.g., up to 6% of salary</p>
        </div>
      </motion.div>

      {/* Total compensation insight */}
      {w2Salary > 0 && (
        <motion.div variants={staggerItem}>
          <InsightCard icon="chart" variant="info">
            <div>
              Total compensation: <strong>{fmtCurrency(totalComp)}</strong> per year
              {matchValue > 0 && (
                <>
                  <br />
                  Employer match value: <strong>{fmtCurrency(matchValue)}</strong> per year
                </>
              )}
            </div>
          </InsightCard>
        </motion.div>
      )}

      {/* Salary growth preview insight */}
      {w2Salary > 0 && debouncedGrowth > 0 && (
        <motion.div variants={staggerItem}>
          <InsightCard icon="sparkle" variant="success">
            At <strong><AnimatedValue value={`${debouncedGrowth}%`} /></strong> annual growth, projected salary in 10 years:{" "}
            <strong><AnimatedValue value={fmtCurrency(projectedSalary10y)} /></strong>
          </InsightCard>
        </motion.div>
      )}
    </motion.div>
  );
}
