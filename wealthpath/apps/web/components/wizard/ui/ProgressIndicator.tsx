"use client";

import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;

        return (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: isActive ? 28 : 8,
              height: 8,
              backgroundColor: isActive
                ? "#F59E0B"
                : isCompleted
                ? "#D97706"
                : "#374151",
            }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </div>
  );
}
