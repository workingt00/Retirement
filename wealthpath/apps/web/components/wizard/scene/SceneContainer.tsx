"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import Sky from "../scene-elements/Sky";
import Clouds from "../scene-elements/Clouds";
import Sun from "../scene-elements/Sun";
import Avatar, { AVATAR_PRESETS } from "../scene-elements/Avatar";
import { getCarOriginXForTarget, CAR_SCALE } from "../scene-elements/Car";
import TodayScene from "./TodayScene";
import FutureScene from "./FutureScene";
import Timeline, { ageToX } from "./Timeline";
import { useWizard } from "../store";

const BIG_AVATAR = 204;
const SMALL_AVATAR = 48;

export default function SceneContainer() {
  const { state } = useWizard();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: 300,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const {
    avatarId,
    age,
    annualIncome,
    totalSavings,
    monthlySpending,
    monthlySavings,
    projection,
    currentStep,
  } = state;

  // Derive scene configuration from wizard state
  const sceneConfig = useMemo(() => {
    const hasIncome = annualIncome !== null && annualIncome > 0;
    const hasSavings = totalSavings !== null;
    const hasSpending = monthlySpending !== null && monthlySpending > 0;

    let fogOpacity = 1;
    if (currentStep >= 2) fogOpacity = 0.85;
    if (currentStep >= 3 && hasSavings) fogOpacity = 0.3;
    if (currentStep >= 4 && hasSpending) fogOpacity = 0.1;
    if (currentStep >= 5) fogOpacity = 0;

    let developmentLevel = 0;
    if (totalSavings !== null) {
      if (totalSavings === 0) developmentLevel = 0.1;
      else if (totalSavings <= 50_000) developmentLevel = 0.25;
      else if (totalSavings <= 100_000) developmentLevel = 0.45;
      else if (totalSavings <= 250_000) developmentLevel = 0.65;
      else developmentLevel = 0.85;
    }

    let incomeLevel = 0;
    if (annualIncome !== null) {
      incomeLevel = Math.min(1, annualIncome / 200_000);
    }

    let savingsLevel = 0;
    if (monthlySavings !== null) {
      savingsLevel = Math.min(1, monthlySavings / 3000);
    }

    let skyPhase: "dawn" | "morning" | "golden" = "dawn";
    if (currentStep >= 3) skyPhase = "morning";
    if (currentStep >= 5 && projection && projection.retirementAge < 70)
      skyPhase = "golden";

    // Sun brightness grows as the user progresses through the wizard
    let sunBrightness = 0.2;
    if (currentStep >= 3) sunBrightness = 0.4;
    if (currentStep >= 4) sunBrightness = 0.6;
    if (currentStep >= 5) sunBrightness = 0.75;
    if (currentStep >= 5 && projection) {
      sunBrightness = projection.retirementAge < 60 ? 1 : projection.retirementAge < 70 ? 0.85 : 0.7;
    }

    return {
      fogOpacity,
      developmentLevel,
      incomeLevel,
      savingsLevel,
      skyPhase,
      sunBrightness,
      showWorkspace: hasIncome,
      retirementAge: projection?.retirementAge ?? null,
    };
  }, [
    annualIncome,
    totalSavings,
    monthlySpending,
    monthlySavings,
    projection,
    currentStep,
  ]);

  const { width, height } = dimensions;
  const halfWidth = width / 2;

  // Shared spring for the "now" position — drives both SVG gold bar/dot AND HTML avatar
  const springConfig = { stiffness: 120, damping: 18 };
  const hasAge = age !== null;
  const targetX = hasAge ? ageToX(age, width) : width / 2;
  const nowXSpring = useSpring(targetX, springConfig);

  // Update spring target when age or width changes
  useEffect(() => {
    nowXSpring.set(targetX);
  }, [targetX, nowXSpring]);

  // Spending/savings offset: nudge car backward for spending, forward for savings.
  // One "year" on the timeline = pixelsPerYear. Max shift ≈ 5 years equivalent.
  const pixelsPerYear = (width - 80) / 82;
  const maxShiftYears = 5;

  // Spending pulls the car back (left): $10k+/mo = max pullback
  const spendingPull =
    currentStep >= 4 && monthlySpending != null && monthlySpending > 0
      ? Math.min(1, monthlySpending / 10_000) * maxShiftYears * pixelsPerYear
      : 0;

  // Monthly savings pushes the car forward (right): $3k+/mo = max push
  const savingsPush =
    currentStep >= 5 && monthlySavings != null && monthlySavings > 0
      ? Math.min(1, monthlySavings / 3_000) * maxShiftYears * pixelsPerYear
      : 0;

  const carOffset = -spendingPull + savingsPush;

  // Position car so the windshield (avatar) aligns with the timeline "now" marker, plus offset
  const carXTarget = getCarOriginXForTarget(targetX + carOffset, CAR_SCALE, sceneConfig.incomeLevel);
  const carXSpring = useSpring(carXTarget, { stiffness: 80, damping: 16 });

  useEffect(() => {
    carXSpring.set(carXTarget);
  }, [carXTarget, carXSpring]);

  // Don't show scene on avatar selection screen
  if (currentStep === 0) return null;

  const avatarConfig = AVATAR_PRESETS.find((a) => a.id === avatarId) ?? null;

  // Avatar positioning: in the car when income is set and past the age step
  const hasIncome = annualIncome !== null && annualIncome > 0;
  const inCar = hasAge && hasIncome && currentStep >= 2;

  // Avatar positioning when NOT in car (timeline mode)
  const avatarLeft = targetX;
  const avatarScale = hasAge ? SMALL_AVATAR / BIG_AVATAR : 1;
  const scaledOffset = hasAge ? (BIG_AVATAR - SMALL_AVATAR) / 2 : 0;
  const avatarTop = hasAge
    ? height - 35 - SMALL_AVATAR - 14 - scaledOffset
    : (height - BIG_AVATAR) / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1a1a2e 100%)",
        height: "100%",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMinYMin meet"
        aria-hidden="true"
      >
        <Sky phase={sceneConfig.skyPhase} width={width} height={height} />

        <Clouds width={width} />
        <Sun
            x={width * 0.75}
            y={height * 0.15}
            brightness={sceneConfig.sunBrightness}
            phase={sceneConfig.skyPhase}
            offsetX={currentStep >= 3 ? 100 : 0}
          />

        <motion.line
          x1={halfWidth}
          y1={0}
          x2={halfWidth}
          y2={height - 40}
          stroke="#4B556340"
          strokeWidth={1}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
        />

        <g clipPath={`url(#clip-left-${width})`}>
          <defs>
            <clipPath id={`clip-left-${width}`}>
              <rect x={0} y={0} width={halfWidth} height={height} />
            </clipPath>
          </defs>
          <TodayScene
            avatarId={avatarId}
            showWorkspace={sceneConfig.showWorkspace}
            incomeLevel={currentStep >= 2 ? sceneConfig.incomeLevel : 0}
            carXSpring={carXSpring}
            width={halfWidth}
            height={height}
            avatarConfig={inCar ? avatarConfig : null}
          />
        </g>

        <g transform={`translate(${halfWidth}, 0)`}>
          <g clipPath={`url(#clip-right-${width})`}>
            <defs>
              <clipPath id={`clip-right-${width}`}>
                <rect x={0} y={0} width={halfWidth} height={height} />
              </clipPath>
            </defs>
            <FutureScene
              avatarId={avatarId}
              fogOpacity={sceneConfig.fogOpacity}
              developmentLevel={currentStep >= 3 ? sceneConfig.developmentLevel : 0}
              retirementAge={currentStep >= 5 ? sceneConfig.retirementAge : null}
              savingsLevel={currentStep >= 4 ? sceneConfig.savingsLevel : 0}
              width={halfWidth}
              height={height}
            />
          </g>
        </g>

        <Timeline
          currentAge={age}
          retirementAge={null}
          width={width}
          y={height - 35}
          nowXSpring={nowXSpring}
        />
      </svg>

      {/* Avatar as HTML overlay — only on the age step (step 1), fades out when moving to income */}
      <AnimatePresence>
        {currentStep === 1 && avatarConfig && (
          <motion.div
            key="timeline-avatar"
            className="absolute pointer-events-none"
            style={{
              zIndex: 10,
              width: BIG_AVATAR,
              height: BIG_AVATAR,
              transformOrigin: "center center",
              left: nowXSpring,
              marginLeft: -BIG_AVATAR / 2,
            }}
            initial={{
              top: avatarTop,
              scale: avatarScale,
              opacity: 0,
            }}
            animate={{
              top: avatarTop,
              scale: avatarScale,
              opacity: 1,
            }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 120, damping: 18, opacity: { delay: 0.6, duration: 0.4 } }}
          >
            <Avatar config={avatarConfig} size={BIG_AVATAR} hideBackground />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
