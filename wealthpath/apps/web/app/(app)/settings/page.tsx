"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import { STATE_TAX_RATES } from "@wealthpath/engine";

const STATES = Object.keys(STATE_TAX_RATES);

function ParametersTab() {
  const { theme } = useMode();
  const plan = usePlanStore((s) => s.plan);
  const updateField = usePlanStore((s) => s.updateField);

  if (!plan) return null;

  return (
    <div className="space-y-8">
      {/* About You */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>About You</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Filing status</label>
            <select value={plan.personal.filingStatus} onChange={(e) => { const v = e.target.value; updateField("personal.filingStatus", v); const sd: Record<string,number> = { MFJ: 32200, SINGLE: 16100, MFS: 16100, HOH: 24150 }; updateField("tax.standardDeduction", sd[v] ?? 16100); }} className="w-full rounded-lg border py-3 pl-3 pr-8" style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}>
              <option value="SINGLE">Single</option>
              <option value="MFJ">Married Filing Jointly</option>
              <option value="MFS">Married Filing Separately</option>
              <option value="HOH">Head of Household</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>State</label>
            <select value={plan.personal.state} onChange={(e) => { updateField("personal.state", e.target.value); updateField("personal.stateEffectiveRate", STATE_TAX_RATES[e.target.value] ?? 0); }} className="w-full rounded-lg border py-3 pl-3 pr-8" style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Income */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Income</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CurrencyInput label="W2 salary" value={plan.income.w2Salary} onChange={(v) => updateField("income.w2Salary", v)} />
          <CurrencyInput label="Other income" value={plan.income.w9Income} onChange={(v) => updateField("income.w9Income", v)} />
        </div>
      </section>

      {/* Investment Style */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Investment Style</h2>
        <div className="flex gap-3">
          {(["conservative", "moderate", "aggressive"] as const).map((style) => (
            <button
              key={style}
              onClick={() => {
                updateField("investment.style", style);
                const rates = { conservative: [0.07, 0.08], moderate: [0.10, 0.12], aggressive: [0.13, 0.15] };
                updateField("investment.growth401k", rates[style][0]);
                updateField("investment.growthRothPortfolio", rates[style][1]);
              }}
              className="rounded-xl border-2 px-4 py-3 text-sm font-medium capitalize"
              style={{
                borderColor: plan.investment.style === style ? theme.primary : `${theme.textMuted}30`,
                backgroundColor: plan.investment.style === style ? `${theme.primary}10` : theme.surface,
                color: theme.text,
                minHeight: "48px",
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Growth Rates */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Growth Rates</h2>
        <p className="mb-3 text-sm" style={{ color: theme.textMuted }}>
          Adjust the expected annual return for each account type.
        </p>
        <div className="space-y-4">
          {[
            { label: "Traditional 401k", path: "growthRates.traditional401k", value: plan.growthRates.traditional401k },
            { label: "Roth 401k", path: "growthRates.roth401k", value: plan.growthRates.roth401k },
            { label: "Traditional IRA", path: "growthRates.traditionalIRA", value: plan.growthRates.traditionalIRA },
            { label: "Roth IRA", path: "growthRates.rothIRA", value: plan.growthRates.rothIRA },
            { label: "Brokerage portfolio", path: "growthRates.privatePortfolio", value: plan.growthRates.privatePortfolio },
            { label: "Foreign pension", path: "growthRates.foreignPension", value: plan.growthRates.foreignPension },
            { label: "529 plan", path: "growthRates.plan529", value: plan.growthRates.plan529 },
          ].map((rate) => (
            <div key={rate.path} className="flex items-center justify-between">
              <label className="text-sm" style={{ color: theme.textMuted }}>{rate.label}</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={0.2}
                  step={0.01}
                  value={rate.value}
                  onChange={(e) => updateField(rate.path, parseFloat(e.target.value))}
                  className="w-32"
                />
                <span className="w-14 text-right text-sm font-medium" style={{ fontFamily: theme.fontMono, color: theme.text }}>
                  {(rate.value * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tax Configuration */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Tax Configuration</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Tax calculation mode</label>
            <select value={plan.tax.mode} onChange={(e) => updateField("tax.mode", e.target.value)} className="w-full rounded-lg border py-3 pl-3 pr-8" style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}>
              <option value="BRACKET">Progressive brackets</option>
              <option value="FLAT">Flat rate</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Standard deduction ({plan.personal.filingStatus})</label>
            <div className="rounded-lg border px-3 py-3" style={{ backgroundColor: `${theme.textMuted}10`, color: theme.textMuted, borderColor: `${theme.textMuted}20`, fontFamily: theme.fontMono, minHeight: "48px", lineHeight: "24px" }}>
              ${plan.tax.standardDeduction.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Capital gains taxable portion</label>
            <input type="number" value={plan.tax.cgTaxablePortion} onChange={(e) => updateField("tax.cgTaxablePortion", parseFloat(e.target.value) || 0.75)} step={0.05} min={0} max={1} className="w-24 rounded-lg border px-3 py-3" style={{ backgroundColor: theme.surface, color: theme.text, borderColor: `${theme.textMuted}40`, fontFamily: theme.fontMono, minHeight: "48px" }} />
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              The fraction of portfolio withdrawals subject to capital gains tax (typically 0.75).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreferencesTab() {
  const { theme, mode, setMode } = useMode();
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [experienceTier, setExperienceTier] = useState<"basic" | "advanced">("basic");

  return (
    <div className="space-y-8">
      {/* Theme */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Appearance</h2>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Theme</label>
          <div className="flex gap-3">
            {(["horizon", "velocity"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="rounded-xl border-2 px-5 py-3 text-sm font-medium capitalize transition-colors"
                style={{
                  borderColor: mode === m ? theme.primary : `${theme.textMuted}30`,
                  backgroundColor: mode === m ? `${theme.primary}10` : "transparent",
                  color: mode === m ? theme.primary : theme.textMuted,
                }}
              >
                {m === "horizon" ? "Horizon (Warm)" : "Velocity (Dense)"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Currency */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Display</h2>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Display Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-40 rounded-lg border py-3 pl-3 pr-8"
            style={{ backgroundColor: theme.bg, color: theme.text, borderColor: `${theme.textMuted}40`, minHeight: "48px" }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Notifications</h2>
        <div className="space-y-3">
          {[
            { key: "email" as const, label: "Email notifications" },
            { key: "push" as const, label: "Push notifications" },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <button
                role="switch"
                type="button"
                aria-checked={notifications[item.key]}
                onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors"
                style={{ backgroundColor: notifications[item.key] ? theme.primary : `${theme.textMuted}40` }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                  style={{ transform: notifications[item.key] ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
              <span className="text-sm" style={{ color: theme.text }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Tier */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Experience Level</h2>
        <p className="mb-3 text-sm" style={{ color: theme.textMuted }}>
          Controls which advanced fields are visible in Scenarios and Taxes.
        </p>
        <div className="flex gap-3">
          {(["basic", "advanced"] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setExperienceTier(tier)}
              className="rounded-xl border-2 px-5 py-3 text-sm font-medium capitalize transition-colors"
              style={{
                borderColor: experienceTier === tier ? theme.primary : `${theme.textMuted}30`,
                backgroundColor: experienceTier === tier ? `${theme.primary}10` : "transparent",
                color: experienceTier === tier ? theme.primary : theme.textMuted,
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: theme.text }}>Account</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>Account Email</label>
            <div
              className="rounded-lg border px-3 py-3 text-sm"
              style={{ backgroundColor: `${theme.textMuted}10`, color: theme.textMuted, borderColor: `${theme.textMuted}20`, minHeight: "48px", lineHeight: "24px" }}
            >
              user@example.com
            </div>
          </div>
          <button
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: `${theme.textMuted}10`, color: theme.textMuted }}
          >
            Change Password
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"parameters" | "preferences">("parameters");
  const { theme } = useMode();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>Settings</h1>
      <div className="mb-6 flex gap-2">
        {([["parameters", "Quick Parameters"], ["preferences", "Preferences"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === key ? theme.primary : `${theme.textMuted}10`,
              color: tab === key ? "#fff" : theme.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "parameters" ? <ParametersTab /> : <PreferencesTab />}
    </div>
  );
}
