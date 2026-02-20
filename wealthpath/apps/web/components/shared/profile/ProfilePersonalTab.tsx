"use client";

import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import AgeInput from "@/components/shared/AgeInput";
import ProfileChips from "@/components/shared/profile/ProfileChips";
import InsightCard from "@/components/shared/profile/InsightCard";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { STATE_TAX_RATES } from "@wealthpath/engine";

const STATES = Object.keys(STATE_TAX_RATES);

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const FILING_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MFJ", label: "Married Filing Jointly" },
  { value: "MFS", label: "Married Filing Separately" },
  { value: "HOH", label: "Head of Household" },
];

const STANDARD_DEDUCTIONS: Record<string, number> = {
  MFJ: 32200,
  SINGLE: 16100,
  MFS: 16100,
  HOH: 24150,
};

export default function ProfilePersonalTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  const { currentAge, retirementAge, state } = plan.personal;
  const bothAgesSet = currentAge > 0 && retirementAge > 0;
  const yearsUntilRetirement = retirementAge - currentAge;
  const stateRate = STATE_TAX_RATES[state];

  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Ages */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <AgeInput
          label="Current Age"
          value={currentAge}
          onChange={(v) => updateField("personal.currentAge", v)}
          min={18}
          max={80}
        />
        <AgeInput
          label="Target Retirement Age"
          value={retirementAge}
          onChange={(v) => updateField("personal.retirementAge", v)}
          min={40}
          max={80}
        />
      </motion.div>

      {/* Years until retirement insight */}
      {bothAgesSet && yearsUntilRetirement > 0 && (
        <motion.div variants={staggerItem}>
          <InsightCard icon="target" variant="info">
            <strong>{yearsUntilRetirement} years</strong> until your target retirement
          </InsightCard>
        </motion.div>
      )}

      {/* Gender + Filing Status */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Gender
          </label>
          <div
            style={{
              height: 2,
              width: 40,
              background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderRadius: 1,
              marginBottom: 8,
            }}
          />
          <ProfileChips
            options={GENDER_OPTIONS}
            value={plan.personal.gender}
            onChange={(v) => updateField("personal.gender", v)}
          />
          <p className="mt-1.5 text-xs" style={{ color: theme.textMuted }}>
            Used for longevity modeling
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Filing Status
          </label>
          <div
            style={{
              height: 2,
              width: 40,
              background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderRadius: 1,
              marginBottom: 8,
            }}
          />
          <ProfileChips
            options={FILING_STATUS_OPTIONS}
            value={plan.personal.filingStatus}
            onChange={(v) => {
              updateField("personal.filingStatus", v);
              updateField("tax.standardDeduction", STANDARD_DEDUCTIONS[v] ?? 16100);
            }}
          />
        </div>
      </motion.div>

      {/* Dependents + State */}
      <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={staggerItem}>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Number of Dependents
          </label>
          <div
            style={{
              height: 2,
              width: 40,
              background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderRadius: 1,
              marginBottom: 8,
            }}
          />
          <input
            type="number"
            value={plan.personal.dependents}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              if (!isNaN(n) && n >= 0 && n <= 20) updateField("personal.dependents", n);
            }}
            min={0}
            max={20}
            className="w-24 rounded-lg border px-3 py-3"
            style={{
              backgroundColor: theme.surfaceGlass,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${theme.borderGlass}`,
              color: theme.text,
              fontFamily: theme.fontFamily,
              minHeight: "48px",
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            State of Residence
          </label>
          <div
            style={{
              height: 2,
              width: 40,
              background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              borderRadius: 1,
              marginBottom: 8,
            }}
          />
          <select
            value={state}
            onChange={(e) => {
              updateField("personal.state", e.target.value);
              updateField("personal.stateEffectiveRate", STATE_TAX_RATES[e.target.value] ?? 0);
            }}
            className="w-full rounded-lg py-3 pl-3 pr-8"
            style={{
              backgroundColor: theme.surfaceGlass,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${theme.borderGlass}`,
              color: theme.text,
              minHeight: "48px",
            }}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* State tax rate insight */}
      {state && stateRate !== undefined && (
        <motion.div variants={staggerItem}>
          <InsightCard icon="info" variant="neutral">
            {state} state income tax rate: <strong>{stateRate}%</strong>
          </InsightCard>
        </motion.div>
      )}

      {/* Retirement State */}
      <motion.div className="md:w-1/2" variants={staggerItem}>
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Planned Retirement State
        </label>
        <div
          style={{
            height: 2,
            width: 40,
            background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
            borderRadius: 1,
            marginBottom: 8,
          }}
        />
        <select
          value={plan.personal.retirementState ?? plan.personal.state}
          onChange={(e) => updateField("personal.retirementState", e.target.value)}
          className="w-full rounded-lg py-3 pl-3 pr-8"
          style={{
            backgroundColor: theme.surfaceGlass,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1px solid ${theme.borderGlass}`,
            color: theme.text,
            minHeight: "48px",
          }}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
          Defaults to your current state if not set
        </p>
      </motion.div>
    </motion.div>
  );
}
