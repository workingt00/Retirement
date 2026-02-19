"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WizardProvider, useWizard } from "./store";
import ProgressIndicator from "./ui/ProgressIndicator";
import SceneContainer from "./scene/SceneContainer";
import StepAvatar from "./steps/StepAvatar";
import StepAge from "./steps/StepAge";
import StepIncome from "./steps/StepIncome";
import StepSavings from "./steps/StepSavings";
import StepSpending from "./steps/StepSpending";
import StepMonthlySavings from "./steps/StepMonthlySavings";
import StepReveal from "./steps/StepReveal";
import StepSignup from "./steps/StepSignup";

const STEPS = [
  StepAvatar,
  StepAge,
  StepIncome,
  StepSavings,
  StepSpending,
  StepMonthlySavings,
  StepReveal,
  StepSignup,
];

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const fadeTransition = {
  duration: 0.575,
  ease: [0.4, 0, 0.6, 1],
};

function WizardInner() {
  const { state, goBack, reset } = useWizard();
  const { currentStep } = state;
  const prevStepRef = useRef(currentStep);
  const isPopstateRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isPopstateRef.current = true;
      if (currentStep > 0) {
        goBack();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentStep, goBack]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPopstateRef.current) {
      isPopstateRef.current = false;
    } else if (currentStep === 0) {
      window.history.replaceState({ step: 0 }, "");
    } else if (currentStep > prevStepRef.current) {
      window.history.pushState({ step: currentStep }, "");
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  const handleReset = useCallback(() => {
    reset();
    if (typeof window !== "undefined") {
      window.history.replaceState({ step: 0 }, "");
    }
  }, [reset]);

  const CurrentStepComponent = STEPS[currentStep] ?? StepAvatar;
  const isAvatarStep = currentStep === 0;
  const isRevealStep = currentStep === 6;
  const isSignupStep = currentStep === 7;
  const showScene = !isAvatarStep && !isSignupStep;
  const showProgress = !isAvatarStep && !isRevealStep && !isSignupStep;

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "#0f172a" }}>
      {/* Start Over button */}
      {currentStep > 0 && (
        <button
          onClick={handleReset}
          className="absolute right-4 top-4 z-50 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-100"
          style={{
            color: "#94a3b8",
            backgroundColor: "rgba(148, 163, 184, 0.1)",
            opacity: 0.7,
          }}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Start Over
        </button>
      )}

      {/* Scene panel */}
      <motion.div
        className="relative w-full shrink-0 overflow-hidden"
        animate={{
          height: showScene ? (isRevealStep ? "45vh" : "clamp(200px, 40vh, 340px)") : "0px",
          opacity: showScene ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <SceneContainer />
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        className="overflow-hidden"
        animate={{
          height: showProgress ? "auto" : 0,
          opacity: showProgress ? 1 : 0,
          paddingTop: showProgress ? 16 : 0,
          paddingBottom: showProgress ? 16 : 0,
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <ProgressIndicator currentStep={currentStep} totalSteps={7} />
      </motion.div>

      {/* Question panel — pure fade, no movement */}
      <div className="relative flex-1 overflow-hidden w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            className="w-full h-full overflow-y-auto"
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={fadeTransition}
          >
            <CurrentStepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function WizardContainer() {
  return (
    <WizardProvider>
      <WizardInner />
    </WizardProvider>
  );
}
