"use client";

import { motion } from "framer-motion";
import { useWizard } from "../store";
import WizardCurrencyInput from "../ui/WizardCurrencyInput";
import QuickSelectChips from "../ui/QuickSelectChips";

const INCOME_PRESETS = [50_000, 100_000, 150_000, 200_000];

export default function StepIncome() {
  const { state, dispatch, goNext, goBack } = useWizard();

  const handleChange = (value: number) => {
    dispatch({ type: "SET_ANNUAL_INCOME", annualIncome: value });
  };

  const isValid = state.annualIncome !== null && state.annualIncome >= 0;

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
        What&apos;s your annual household income?
      </h2>

      <div className="w-full max-w-md">
        <WizardCurrencyInput
          id="wizard-income"
          value={state.annualIncome}
          onChange={handleChange}
          label=""
          helperText="Before taxes -- your total salary or combined if married"
          placeholder="100,000"
          step={5_000}
        />

        <QuickSelectChips
          values={INCOME_PRESETS}
          onSelect={handleChange}
          selectedValue={state.annualIncome}
        />

        {/* Earning power stat card */}
        {state.annualIncome !== null && state.annualIncome > 0 && (
          <motion.div
            className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs uppercase tracking-wider text-amber-400/80">
              Earning Power
            </p>
            <p className="text-lg font-bold text-amber-400">
              ${state.annualIncome.toLocaleString()}/yr
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
