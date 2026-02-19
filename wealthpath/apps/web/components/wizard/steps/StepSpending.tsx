"use client";

import { motion } from "framer-motion";
import { useWizard } from "../store";
import WizardCurrencyInput from "../ui/WizardCurrencyInput";
import QuickSelectChips from "../ui/QuickSelectChips";

const SPENDING_PRESETS = [2_000, 4_000, 6_000, 8_000, 10_000];

export default function StepSpending() {
  const { state, dispatch, goNext, goBack } = useWizard();

  const handleChange = (value: number) => {
    dispatch({ type: "SET_MONTHLY_SPENDING", monthlySpending: value });
  };

  const isValid = state.monthlySpending !== null && state.monthlySpending > 0;

  // Show retirement age hint if projection is available
  const retirementAge = state.projection?.retirementAge;

  // Convert an age to a descriptive label like "mid 60s", "early 70s"
  const ageToLabel = (age: number): string => {
    if (age >= 90) return "late 80s+";
    const decade = Math.floor(age / 10) * 10;
    const position = age % 10;
    const decadeStr = `${decade}s`;
    if (position <= 3) return `early ${decadeStr}`;
    if (position <= 6) return `mid ${decadeStr}`;
    return `late ${decadeStr}`;
  };

  // Always show a single expression like "mid 60s" based on the retirement age
  const freedomRange =
    retirementAge != null
      ? retirementAge >= 90
        ? "85+"
        : ageToLabel(retirementAge)
      : null;

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
        Roughly how much do you spend per month?
      </h2>

      <div className="w-full max-w-md">
        <WizardCurrencyInput
          id="wizard-spending"
          value={state.monthlySpending}
          onChange={handleChange}
          label=""
          helperText="Include housing, food, bills, everything. A ballpark works."
          placeholder="4,000"
          step={500}
        />

        <QuickSelectChips
          values={SPENDING_PRESETS}
          onSelect={handleChange}
          selectedValue={state.monthlySpending}
        />

        {/* First retirement age reveal */}
        {retirementAge && (
          <motion.div
            className="mt-6 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-amber-600/5 p-5 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <p className="mb-1 text-xs uppercase tracking-wider text-amber-400/70">
              Your estimated freedom range
            </p>
            <motion.p
              className="text-3xl font-extrabold text-amber-400 md:text-4xl"
              key={retirementAge}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {freedomRange}
            </motion.p>
            <p className="mt-1 text-sm text-gray-400">
              {retirementAge >= 85
                ? "Let's work on improving this together"
                : retirementAge >= 70
                ? "There's room to improve -- let's keep going"
                : "You're on a great trajectory"}
            </p>
          </motion.div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <motion.button
          className="rounded-xl border border-gray-600 px-6 py-3 font-medium text-gray-300 hover:border-gray-400 hover:text-white"
          onClick={goBack}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ minHeight: "48px" }}
        >
          Back
        </motion.button>
        <motion.button
          className="rounded-xl bg-amber-500 px-8 py-3 font-semibold text-gray-900 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500"
          onClick={goNext}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.03 } : undefined}
          whileTap={isValid ? { scale: 0.97 } : undefined}
          style={{ minHeight: "48px" }}
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}
