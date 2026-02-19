"use client";

import { motion } from "framer-motion";
import { useWizard } from "../store";
import WizardCurrencyInput from "../ui/WizardCurrencyInput";
import QuickSelectChips from "../ui/QuickSelectChips";

const SAVINGS_PRESETS = [0, 50_000, 100_000, 250_000, 500_000];

export default function StepSavings() {
  const { state, dispatch, goNext, goBack } = useWizard();

  const handleChange = (value: number) => {
    dispatch({ type: "SET_TOTAL_SAVINGS", totalSavings: value });
  };

  const isValid = state.totalSavings !== null;

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
        How much do you have saved for retirement?
      </h2>

      <div className="w-full max-w-md">
        <WizardCurrencyInput
          id="wizard-savings"
          value={state.totalSavings}
          onChange={handleChange}
          label=""
          helperText="All accounts combined -- 401k, IRA, brokerage, savings. A rough estimate is fine."
          placeholder="50,000"
          step={10_000}
        />

        <QuickSelectChips
          values={SAVINGS_PRESETS}
          onSelect={handleChange}
          selectedValue={state.totalSavings}
        />

        {/* Head start indicator */}
        {state.totalSavings !== null && state.totalSavings > 0 && (
          <motion.div
            className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs uppercase tracking-wider text-emerald-400/80">
              Your Head Start
            </p>
            <p className="text-lg font-bold text-emerald-400">
              ${state.totalSavings.toLocaleString()}
            </p>
          </motion.div>
        )}
        {state.totalSavings === 0 && (
          <motion.p
            className="mt-4 text-center text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Everyone starts somewhere. Let&apos;s see what&apos;s possible.
          </motion.p>
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
