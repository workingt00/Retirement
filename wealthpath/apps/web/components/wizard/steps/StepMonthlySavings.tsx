"use client";

import { motion } from "framer-motion";
import { useWizard } from "../store";
import WizardCurrencyInput from "../ui/WizardCurrencyInput";
import QuickSelectChips from "../ui/QuickSelectChips";


const SAVINGS_PRESETS = [0, 500, 1_000, 2_000, 3_000];

export default function StepMonthlySavings() {
  const { state, dispatch, goNext, goBack } = useWizard();

  const handleChange = (value: number) => {
    dispatch({ type: "SET_MONTHLY_SAVINGS", monthlySavings: value });
  };

  const isValid = state.monthlySavings !== null;
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

  const freedomRange =
    retirementAge != null
      ? retirementAge >= 90
        ? "85+"
        : ageToLabel(retirementAge)
      : null;

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
        How much are you putting toward retirement each month?
      </h2>

      <div className="w-full max-w-md">
        <WizardCurrencyInput
          id="wizard-monthly-savings"
          value={state.monthlySavings}
          onChange={handleChange}
          label=""
          helperText="401k contributions, IRA, any investing you do regularly"
          placeholder="1,000"
          step={100}
        />

        <QuickSelectChips
          values={SAVINGS_PRESETS}
          onSelect={handleChange}
          selectedValue={state.monthlySavings}
        />

        {/* Updated retirement age with counter */}
        {retirementAge && (
          <motion.div
            className="mt-6 rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-emerald-600/5 p-5 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <p className="mb-1 text-xs uppercase tracking-wider text-emerald-400/70">
              Your estimated freedom range
            </p>
            <motion.div
              className="text-3xl font-extrabold text-emerald-400 md:text-4xl"
              key={retirementAge}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {freedomRange}
            </motion.div>

            {state.monthlySavings === 0 && (
              <p className="mt-2 text-sm text-gray-400">
                Even adding a small amount each month can make a big difference
              </p>
            )}
          </motion.div>
        )}

        {/* Summary stats */}
        {state.projection && (
          <motion.div
            className="mt-4 grid grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="rounded-lg bg-gray-800/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Projected Net Worth
              </p>
              <p className="text-sm font-bold text-white">
                ${Math.round(state.projection.netWorthAtRetirement / 1000).toLocaleString()}k
              </p>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Monthly Income
              </p>
              <p className="text-sm font-bold text-white">
                ${state.projection.monthlyRetirementIncome.toLocaleString()}/mo
              </p>
            </div>
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
          See My Full Projection
        </motion.button>
      </div>
    </div>
  );
}
