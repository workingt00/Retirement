"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import AgeInput from "@/components/shared/AgeInput";
import { STATE_TAX_RATES } from "@wealthpath/engine";

const STATES = Object.keys(STATE_TAX_RATES);

export default function ProfilePersonalTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AgeInput
          label="Current Age"
          value={plan.personal.currentAge}
          onChange={(v) => updateField("personal.currentAge", v)}
          min={18}
          max={80}
        />
        <AgeInput
          label="Target Retirement Age"
          value={plan.personal.retirementAge}
          onChange={(v) => updateField("personal.retirementAge", v)}
          min={40}
          max={80}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Gender
          </label>
          <select
            value={plan.personal.gender ?? ""}
            onChange={(e) => updateField("personal.gender", e.target.value || undefined)}
            className="w-full rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>Used for longevity modeling</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Filing Status
          </label>
          <select
            value={plan.personal.filingStatus}
            onChange={(e) => {
              const v = e.target.value;
              updateField("personal.filingStatus", v);
              const sd: Record<string, number> = { MFJ: 32200, SINGLE: 16100, MFS: 16100, HOH: 24150 };
              updateField("tax.standardDeduction", sd[v] ?? 16100);
            }}
            className="w-full rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            <option value="SINGLE">Single</option>
            <option value="MFJ">Married Filing Jointly</option>
            <option value="MFS">Married Filing Separately</option>
            <option value="HOH">Head of Household</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            Number of Dependents
          </label>
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
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
            State of Residence
          </label>
          <select
            value={plan.personal.state}
            onChange={(e) => {
              updateField("personal.state", e.target.value);
              updateField("personal.stateEffectiveRate", STATE_TAX_RATES[e.target.value] ?? 0);
            }}
            className="w-full rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="md:w-1/2">
        <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
          Planned Retirement State
        </label>
        <select
          value={plan.personal.retirementState ?? plan.personal.state}
          onChange={(e) => updateField("personal.retirementState", e.target.value)}
          className="w-full rounded-lg border py-3 pl-3 pr-8"
          style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
          Defaults to your current state if not set
        </p>
      </div>
    </div>
  );
}
