"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import CurrencyInput from "@/components/shared/CurrencyInput";
import AgeInput from "@/components/shared/AgeInput";
import { STATE_TAX_RATES } from "@wealthpath/engine";

const STATES = Object.keys(STATE_TAX_RATES);

export default function OnboardingWizard() {
  const { theme } = useMode();
  const router = useRouter();
  const { plan, updateField } = usePlanStore();
  const [step, setStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const next = useCallback(() => {
    if (step < 4) setStep(step + 1);
    else {
      setShowCelebration(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }, [step, router]);

  const back = useCallback(() => {
    if (step > 0) setStep(step - 1);
  }, [step]);

  if (!plan) return null;

  if (showCelebration) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4" style={{ backgroundColor: theme.bg }}>
        <div className="text-6xl">&#127881;</div>
        <h1 className="text-3xl font-bold" style={{ color: theme.primary }}>
          You're all set!
        </h1>
        <p style={{ color: theme.textMuted }}>Loading your retirement roadmap...</p>
      </div>
    );
  }

  const stepTitles = [
    "Let's get to know you",
    "Your income and work",
    "What you've saved so far",
    "Your monthly spending",
    "Social Security",
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8" style={{ fontFamily: theme.fontFamily }}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm" style={{ color: theme.textMuted }}>
          <span>Step {step + 1} of 5</span>
          <span>{stepTitles[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${theme.textMuted}20` }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / 5) * 100}%`, backgroundColor: theme.primary }}
          />
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>
        {stepTitles[step]}
      </h2>

      {/* Step 1: About You */}
      {step === 0 && (
        <div className="space-y-6">
          <AgeInput
            label="How old are you?"
            value={plan.personal.currentAge}
            onChange={(v) => updateField("personal.currentAge", v)}
            min={18}
            max={80}
          />
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Filing status
            </label>
            <div className="grid grid-cols-2 gap-4">
              {([
                { value: "SINGLE", label: "Single" },
                { value: "MFJ", label: "Married Filing Jointly" },
                { value: "MFS", label: "Married Filing Separately" },
                { value: "HOH", label: "Head of Household" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateField("personal.filingStatus", opt.value);
                    const sd: Record<string,number> = { MFJ: 32200, SINGLE: 16100, MFS: 16100, HOH: 24150 };
                    updateField("tax.standardDeduction", sd[opt.value]);
                  }}
                  className="rounded-xl border-2 p-4 text-center font-medium transition-colors"
                  style={{
                    borderColor: plan.personal.filingStatus === opt.value ? theme.primary : `${theme.textMuted}30`,
                    backgroundColor: plan.personal.filingStatus === opt.value ? `${theme.primary}10` : theme.surface,
                    color: theme.text,
                    minHeight: "48px",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              State
            </label>
            <select
              value={plan.personal.state}
              onChange={(e) => {
                updateField("personal.state", e.target.value);
                updateField("personal.stateEffectiveRate", STATE_TAX_RATES[e.target.value] ?? 0);
              }}
              className="w-full rounded-lg border py-3 pl-3 pr-8"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: `${theme.textMuted}40`,
                minHeight: "48px",
              }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              We use your state to estimate taxes. You can change this later.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Income */}
      {step === 1 && (
        <div className="space-y-6">
          <CurrencyInput
            label="Annual salary"
            value={plan.income.w2Salary}
            onChange={(v) => updateField("income.w2Salary", v)}
          />
          <CurrencyInput
            label="Other income (freelance, side business)"
            value={plan.income.w9Income}
            onChange={(v) => updateField("income.w9Income", v)}
          />
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              When do you want to retire?
            </label>
            <input
              type="range"
              min={50}
              max={75}
              value={plan.personal.retirementAge}
              onChange={(e) => updateField("personal.retirementAge", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-sm" style={{ color: theme.textMuted }}>
              <span>50</span>
              <span className="font-bold" style={{ color: theme.primary }}>
                Age {plan.personal.retirementAge}
              </span>
              <span>75</span>
            </div>
            <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              This is the age you stop earning a paycheck.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Expected annual raise (%)
            </label>
            <input
              type="number"
              value={plan.income.annualRaise}
              onChange={(e) => updateField("income.annualRaise", parseFloat(e.target.value) || 0)}
              min={0}
              max={20}
              step={0.5}
              className="w-24 rounded-lg border px-3 py-2"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: `${theme.textMuted}40`,
                fontFamily: theme.fontMono,
              }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Savings */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Enter the current balance for each account you have. Skip any you don't use.
          </p>
          <CurrencyInput
            label="401k / 403b (from your employer)"
            value={plan.balances.traditional401k}
            onChange={(v) => updateField("balances.traditional401k", v)}
          />
          <CurrencyInput
            label="Roth IRA (your tax-free account)"
            value={plan.balances.rothIRA}
            onChange={(v) => updateField("balances.rothIRA", v)}
          />
          <CurrencyInput
            label="Brokerage (stocks, bonds, mutual funds)"
            value={plan.balances.privatePortfolio}
            onChange={(v) => updateField("balances.privatePortfolio", v)}
          />
          <CurrencyInput
            label="Foreign pension or other accounts"
            value={plan.balances.foreignPension}
            onChange={(v) => updateField("balances.foreignPension", v)}
          />
          <CurrencyInput
            label="529 plan (college savings)"
            value={plan.balances.plan529}
            onChange={(v) => updateField("balances.plan529", v)}
          />
        </div>
      )}

      {/* Step 4: Monthly Spending */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Round to the nearest $100 -- the ballpark is what matters.
          </p>
          <CurrencyInput
            label="Mortgage / rent"
            value={plan.housing.monthlyMortgage}
            onChange={(v) => updateField("housing.monthlyMortgage", v)}
          />
          <CurrencyInput
            label="Property tax (monthly)"
            value={plan.housing.monthlyPropertyTax}
            onChange={(v) => updateField("housing.monthlyPropertyTax", v)}
          />
          <CurrencyInput
            label="Home insurance (monthly)"
            value={plan.housing.monthlyInsurance}
            onChange={(v) => updateField("housing.monthlyInsurance", v)}
          />
          <CurrencyInput
            label="HOA (monthly)"
            value={plan.housing.monthlyHOA}
            onChange={(v) => updateField("housing.monthlyHOA", v)}
          />
          <CurrencyInput
            label="Groceries & dining"
            value={plan.expenses.groceries + plan.expenses.diningOut}
            onChange={(v) => {
              updateField("expenses.groceries", Math.round(v * 0.65));
              updateField("expenses.diningOut", Math.round(v * 0.35));
            }}
          />
          <CurrencyInput
            label="Travel & hobbies (annual)"
            value={plan.lifestyle.annualTravelHobby}
            onChange={(v) => updateField("lifestyle.annualTravelHobby", v)}
          />
          <CurrencyInput
            label="Healthcare premium (monthly)"
            value={plan.healthcare.monthlyPremium}
            onChange={(v) => updateField("healthcare.monthlyPremium", v)}
          />
          <CurrencyInput
            label="Kids expenses (monthly)"
            value={plan.expenses.kidsExpenses}
            onChange={(v) => updateField("expenses.kidsExpenses", v)}
          />
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}30` }}
          >
            <p className="text-sm font-medium" style={{ color: theme.primary }}>
              Estimated monthly total:{" "}
              <span style={{ fontFamily: theme.fontMono }}>
                ${(
                  plan.housing.monthlyMortgage +
                  plan.housing.monthlyPropertyTax +
                  plan.housing.monthlyInsurance +
                  plan.housing.monthlyHOA +
                  plan.expenses.groceries +
                  plan.expenses.diningOut +
                  plan.healthcare.monthlyPremium +
                  plan.expenses.kidsExpenses +
                  Math.round(plan.lifestyle.annualTravelHobby / 12)
                ).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Step 5: Social Security */}
      {step === 4 && (
        <div className="space-y-6">
          <CurrencyInput
            label="Estimated monthly benefit at age 67"
            value={plan.socialSecurity.monthlyBenefitAtFRA}
            onChange={(v) => updateField("socialSecurity.monthlyBenefitAtFRA", v)}
          />
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Check your estimate at{" "}
            <a
              href="https://www.ssa.gov/myaccount/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.primary }}
            >
              ssa.gov
            </a>
          </p>
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: theme.textMuted }}>
              When do you want to claim?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { age: 62, label: "62", desc: "Reduced" },
                { age: 67, label: "67", desc: "Full benefit" },
                { age: 70, label: "70", desc: "Maximum" },
              ].map((opt) => (
                <button
                  key={opt.age}
                  onClick={() => {
                    updateField("socialSecurity.claimingAge", opt.age);
                    // Update the S1 move startAge
                    const s1 = plan.moves.find((m) => m.id === "S1");
                    if (s1) {
                      usePlanStore.getState().updateMove("S1", "startAge", opt.age);
                    }
                  }}
                  className="rounded-xl border-2 p-4 text-center transition-colors"
                  style={{
                    borderColor: plan.socialSecurity.claimingAge === opt.age ? theme.primary : `${theme.textMuted}30`,
                    backgroundColor: plan.socialSecurity.claimingAge === opt.age ? `${theme.primary}10` : theme.surface,
                    color: theme.text,
                    minHeight: "48px",
                  }}
                >
                  <div className="text-2xl font-bold">{opt.label}</div>
                  <div className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: theme.textMuted }}>
              Years you've worked (at least 10 for SS eligibility)
            </label>
            <input
              type="number"
              value={Math.round(plan.socialSecurity.quartersEarned / 4)}
              onChange={(e) =>
                updateField("socialSecurity.quartersEarned", Math.min((parseInt(e.target.value) || 0) * 4, 40))
              }
              min={0}
              max={10}
              className="w-24 rounded-lg border px-3 py-2"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: `${theme.textMuted}40`,
                fontFamily: theme.fontMono,
              }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="rounded-lg px-6 py-3 text-sm font-medium transition-colors disabled:opacity-30"
          style={{ color: theme.textMuted, minHeight: "48px" }}
        >
          Back
        </button>
        <button
          onClick={next}
          className="rounded-lg px-8 py-3 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: theme.primary, minHeight: "48px", borderRadius: theme.radius }}
        >
          {step === 4 ? "See My Plan" : "Continue"}
        </button>
      </div>
    </div>
  );
}
