"use client";

import { motion, type MotionValue } from "framer-motion";

interface TimelineProps {
  currentAge: number | null;
  retirementAge: number | null;
  width?: number;
  y?: number;
  nowXSpring?: MotionValue<number>;
}

const START_AGE = 18;
const END_AGE = 100;
const PADDING = 40;

export function ageToX(age: number, width: number) {
  const usableWidth = width - PADDING * 2;
  const ratio = (age - START_AGE) / (END_AGE - START_AGE);
  return PADDING + ratio * usableWidth;
}

export default function Timeline({
  currentAge,
  retirementAge,
  width = 800,
  y = 270,
  nowXSpring,
}: TimelineProps) {
  const usableWidth = width - PADDING * 2;

  // Age markers: 18, then every 10 from 30 to 100 (skip 20)
  const markers: number[] = [18];
  for (let age = 30; age <= END_AGE; age += 10) {
    markers.push(age);
  }

  const hasAge = currentAge !== null;
  const retireX = retirementAge ? ageToX(Math.min(retirementAge, END_AGE), width) : null;
  const springTransition = { type: "spring" as const, stiffness: 120, damping: 18 };

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Track background */}
      <rect
        x={PADDING}
        y={y}
        width={usableWidth}
        height={4}
        fill="#374151"
        rx={2}
      />

      {/* Dotted line (full track, behind the gold fill) */}
      <line
        x1={PADDING}
        y1={y + 2}
        x2={PADDING + usableWidth}
        y2={y + 2}
        stroke="#6B7280"
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.5}
      />

      {/* Age markers */}
      {markers.map((age) => (
        <g key={age}>
          <line
            x1={ageToX(age, width)}
            y1={y - 3}
            x2={ageToX(age, width)}
            y2={y + 7}
            stroke="#6B7280"
            strokeWidth={1}
            opacity={0.5}
          />
          <text
            x={ageToX(age, width)}
            y={y + 28}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="24"
            fontFamily="system-ui, sans-serif"
          >
            {age}
          </text>
        </g>
      ))}

      {/* Gold fill + dot — driven by shared spring from parent */}
      {hasAge && nowXSpring && (
        <>
          {/* Bar clipped at axis bounds so the left edge stays fixed at PADDING */}
          <defs>
            <clipPath id="gold-fill-clip">
              <rect x={PADDING} y={y - 2} width={usableWidth} height={8} />
            </clipPath>
          </defs>
          <g clipPath="url(#gold-fill-clip)">
            <motion.g style={{ x: nowXSpring }}>
              {/* Bar extends far left — clip keeps left edge at PADDING */}
              <rect
                x={-width}
                y={y}
                width={width}
                height={4}
                fill="#F59E0B"
              />
            </motion.g>
          </g>
          {/* Dot — same spring, on top (unclipped) */}
          <motion.g style={{ x: nowXSpring }}>
            <circle cx={0} cy={y + 2} r={8} fill="#F59E0B" />
            <circle cx={0} cy={y + 2} r={4} fill="#FEF3C7" />
          </motion.g>
        </>
      )}

      {/* Retirement flag */}
      {retireX && retirementAge && (
        <motion.g
          animate={{ x: retireX }}
          transition={springTransition}
        >
          <line x1={0} y1={y - 30} x2={0} y2={y + 2} stroke="#10B981" strokeWidth={2} />
          <polygon points={`0,${y - 30} 20,${y - 25} 0,${y - 20}`} fill="#10B981" />
          <rect x={-30} y={y - 48} width={60} height={16} fill="#10B981" rx={4} />
          <text
            x={0}
            y={y - 37}
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {retirementAge >= 90 ? "85+" : `Age ${retirementAge}`}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
}
