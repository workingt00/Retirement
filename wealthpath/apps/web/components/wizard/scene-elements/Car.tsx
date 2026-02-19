"use client";

import { motion, AnimatePresence } from "framer-motion";
import Avatar, { type AvatarConfig } from "./Avatar";

interface CarProps {
  x: number;
  y: number; // ground level (car bottom sits here)
  incomeLevel: number; // 0-1
  sceneWidth: number; // width of the visible scene area (for drive-off distance)
  scale?: number;
  avatarConfig?: AvatarConfig | null;
  animatePosition?: boolean; // unused, animation handled by parent
}

export function getTier(incomeLevel: number): number {
  if (incomeLevel <= 0.2) return 1;
  if (incomeLevel <= 0.4) return 2;
  if (incomeLevel <= 0.6) return 3;
  if (incomeLevel <= 0.8) return 4;
  return 5;
}

interface TierStyle {
  bodyColor: string;
  accentColor: string;
  wheelColor: string;
  hubColor: string;
}

const TIER_STYLES: Record<number, TierStyle> = {
  1: { bodyColor: "#78716C", accentColor: "#92400E", wheelColor: "#1A1A1A", hubColor: "#57534E" },
  2: { bodyColor: "#6B7280", accentColor: "#374151", wheelColor: "#1A1A1A", hubColor: "#6B7280" },
  3: { bodyColor: "#3B82F6", accentColor: "#C0C0C0", wheelColor: "#1A1A1A", hubColor: "#C0C0C0" },
  4: { bodyColor: "#1E3A5F", accentColor: "#D4AF37", wheelColor: "#1A1A1A", hubColor: "#D4AF37" },
  5: { bodyColor: "#EF4444", accentColor: "#FCD34D", wheelColor: "#1A1A1A", hubColor: "#FCD34D" },
};

/*
  All car shapes are drawn facing LEFT (front = negative X).
  The entire car is then flipped via scaleX(-1) so it faces RIGHT on screen.

  All cabins share the same height (top at -36, meeting body at -20/-22).
  Windshields are sized proportionally to each car's cabin width.
  The windshield CENTER is the same for all tiers (cx=3, cy=-28) so the
  avatar is always in the same position regardless of car.
*/

// Windshield center — same for all tiers (centered vertically in the cabin)
const WS_CX = 3;
const WS_CY = -28;

// Per-tier windshield proportions (half-widths and half-height)
interface WindshieldSpec { bw: number; tw: number; hh: number }
const WINDSHIELD: Record<number, WindshieldSpec> = {
  1: { bw: 7,  tw: 5,  hh: 5.5 },  // small — fits narrow hatchback cabin
  2: { bw: 8,  tw: 6,  hh: 6 },    // medium
  3: { bw: 9,  tw: 7,  hh: 6 },    // standard
  4: { bw: 11, tw: 8,  hh: 6 },    // large — fits wide SUV cabin
  5: { bw: 8,  tw: 5.5, hh: 5.5 }, // wide-ish but short — sporty
};

// Legacy lookup used by getCarOriginXForTarget / getCarCabinScreenPos
const WINDSHIELD_CENTER: Record<number, { cx: number; cy: number }> = {
  1: { cx: WS_CX, cy: WS_CY },
  2: { cx: WS_CX, cy: WS_CY },
  3: { cx: WS_CX, cy: WS_CY },
  4: { cx: WS_CX, cy: WS_CY },
  5: { cx: WS_CX, cy: WS_CY },
};

function windshieldPath(tier: number): string {
  const { bw, tw, hh } = WINDSHIELD[tier];
  return `M${WS_CX - bw} ${WS_CY + hh} L${WS_CX - tw} ${WS_CY - hh} L${WS_CX + tw} ${WS_CY - hh} L${WS_CX + bw} ${WS_CY + hh} Z`;
}

/* ── Tier 1: Old hatchback — narrow, rusty ── */
function Hatchback({ style }: { style: TierStyle }) {
  return (
    <g>
      {/* Body */}
      <motion.path
        d="M-25 -18 Q-25 -22 -20 -22 L15 -22 Q20 -22 22 -18 L22 -8 L-25 -8 Z"
        animate={{ fill: style.bodyColor }}
        transition={{ duration: 0.5 }}
      />
      {/* Cabin */}
      <motion.path
        d="M-12 -22 Q-10 -36 -2 -36 L10 -36 Q16 -36 18 -22"
        animate={{ fill: style.bodyColor }}
        transition={{ duration: 0.5 }}
      />
      {/* Rust spots */}
      <circle cx={-18} cy={-14} r={2} fill={style.accentColor} opacity={0.6} />
      <circle cx={16} cy={-16} r={1.5} fill={style.accentColor} opacity={0.5} />
      <circle cx={5} cy={-10} r={1.8} fill={style.accentColor} opacity={0.4} />
      {/* Windshield */}
      <path d={windshieldPath(1)} fill="#87CEEB" opacity={0.45} />
    </g>
  );
}

/* ── Tier 2: Basic sedan — clean, plain ── */
function BasicSedan({ style }: { style: TierStyle }) {
  return (
    <g>
      {/* Body */}
      <motion.rect x={-28} y={-20} width={56} height={13} rx={3}
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Cabin */}
      <motion.path
        d="M-14 -20 Q-12 -36 -4 -36 L10 -36 Q18 -36 18 -20"
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Trim */}
      <line x1={-26} y1={-14} x2={26} y2={-14} stroke={style.accentColor} strokeWidth={0.8} />
      {/* Windshield */}
      <path d={windshieldPath(2)} fill="#87CEEB" opacity={0.45} />
    </g>
  );
}

/* ── Tier 3: Nice sedan — sleeker, chrome ── */
function NiceSedan({ style }: { style: TierStyle }) {
  return (
    <g>
      {/* Body */}
      <motion.rect x={-30} y={-20} width={60} height={13} rx={3}
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Cabin */}
      <motion.path
        d="M-15 -20 Q-13 -36 -5 -36 L12 -36 Q20 -36 20 -20"
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Chrome trim */}
      <line x1={-28} y1={-14} x2={28} y2={-14} stroke={style.accentColor} strokeWidth={1.2} />
      <rect x={4} y={-17} width={5} height={1.5} rx={0.5} fill={style.accentColor} />
      {/* Windshield */}
      <path d={windshieldPath(3)} fill="#87CEEB" opacity={0.5} />
    </g>
  );
}

/* ── Tier 4: SUV/luxury — wider, polished ── */
function LuxurySUV({ style }: { style: TierStyle }) {
  return (
    <g>
      {/* Body — wider */}
      <motion.rect x={-32} y={-22} width={64} height={15} rx={3}
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Cabin */}
      <motion.path
        d="M-18 -22 Q-16 -36 -6 -36 L16 -36 Q24 -36 24 -22"
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Gold accent strip */}
      <line x1={-30} y1={-15} x2={30} y2={-15} stroke={style.accentColor} strokeWidth={1.5} />
      {/* Gold door handles */}
      <rect x={-2} y={-19} width={5} height={1.5} rx={0.5} fill={style.accentColor} />
      <rect x={12} y={-19} width={5} height={1.5} rx={0.5} fill={style.accentColor} />
      {/* Windshield */}
      <path d={windshieldPath(4)} fill="#87CEEB" opacity={0.45} />
    </g>
  );
}

/* ── Tier 5: Sports car — low, wide, aggressive ── */
function SportsCar({ style }: { style: TierStyle }) {
  return (
    <g>
      {/* Body — low, wide */}
      <motion.path
        d="M-34 -14 Q-34 -20 -28 -20 L28 -20 Q34 -20 34 -14 L34 -8 L-34 -8 Z"
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Cabin */}
      <motion.path
        d="M-10 -20 Q-8 -36 0 -36 L10 -36 Q16 -36 18 -20"
        animate={{ fill: style.bodyColor }} transition={{ duration: 0.5 }} />
      {/* Racing stripe */}
      <rect x={-2} y={-36} width={4} height={28} rx={0.5} fill={style.accentColor} opacity={0.7} />
      {/* Side air intakes */}
      <path d="M-30 -12 L-22 -14 L-22 -10 Z" fill="#1A1A1A" opacity={0.5} />
      <path d="M30 -12 L22 -14 L22 -10 Z" fill="#1A1A1A" opacity={0.5} />
      {/* Windshield */}
      <path d={windshieldPath(5)} fill="#87CEEB" opacity={0.45} />
    </g>
  );
}

// Wheel configs per tier
const WHEEL_CFG: Record<number, { left: number; right: number; r: number }> = {
  1: { left: -16, right: 14, r: 5 },
  2: { left: -18, right: 18, r: 5.5 },
  3: { left: -20, right: 20, r: 5.5 },
  4: { left: -22, right: 22, r: 6 },
  5: { left: -24, right: 24, r: 5 },
};

const FRONT_X: Record<number, number> = { 1: -23, 2: -26, 3: -28, 4: -30, 5: -32 };
const REAR_X: Record<number, number> = { 1: 20, 2: 26, 3: 28, 4: 30, 5: 32 };
const BUMPER: Record<number, { x: number; w: number }> = {
  1: { x: -24, w: 48 }, 2: { x: -27, w: 54 }, 3: { x: -29, w: 58 },
  4: { x: -31, w: 62 }, 5: { x: -33, w: 66 },
};

/** Default car scale */
export const CAR_SCALE = 2.4;

/** Avatar size in screen pixels when inside the car windshield */
const CAR_AVATAR_PX = 40;

/**
 * Returns the car origin X so that the windshield center lands at the desired screen X.
 */
export function getCarOriginXForTarget(
  targetScreenX: number,
  scale: number,
  incomeLevel: number,
): number {
  const tier = getTier(incomeLevel);
  const wc = WINDSHIELD_CENTER[tier];
  return targetScreenX + scale * wc.cx;
}

export function getCarCabinScreenPos(
  carX: number,
  carY: number,
  scale: number,
  incomeLevel: number,
): { x: number; y: number } {
  const tier = getTier(incomeLevel);
  const wc = WINDSHIELD_CENTER[tier];
  return {
    x: carX - scale * wc.cx,
    y: carY + scale * wc.cy,
  };
}

export default function Car({ x, y, incomeLevel, sceneWidth, scale = CAR_SCALE, avatarConfig, animatePosition }: CarProps) {
  const tier = getTier(incomeLevel);
  const style = TIER_STYLES[tier];
  const wheels = WHEEL_CFG[tier];
  const bumper = BUMPER[tier];

  // Drive distance: car must fully clear the left edge of the scene
  const driveX = Math.ceil((x + 100) / scale);

  const CarShape = [Hatchback, BasicSedan, NiceSedan, LuxurySUV, SportsCar][tier - 1];

  return (
    <g transform={`translate(${x}, ${y}) scale(${-scale}, ${scale})`}>
      <AnimatePresence>
        {incomeLevel > 0 && (
          <motion.g
            key="car"
            initial={{ x: driveX, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: driveX, opacity: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 14 }}
          >
            <AnimatePresence mode="wait">
              <motion.g
                key={`t${tier}`}
                initial={{ x: driveX }}
                animate={{ x: 0 }}
                exit={{ x: driveX }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                <CarShape style={style} />

                {/* Front headlight */}
                <ellipse cx={FRONT_X[tier]} cy={-13} rx={2.5} ry={2} fill="#FCD34D" opacity={0.8} />
                {/* Rear taillight */}
                <ellipse cx={REAR_X[tier]} cy={-13} rx={2.5} ry={2} fill="#EF4444" opacity={0.6} />

                {/* Wheels */}
                <circle cx={wheels.left} cy={-5} r={wheels.r} fill={style.wheelColor} />
                <circle cx={wheels.left} cy={-5} r={wheels.r * 0.5} fill={style.hubColor} />
                <circle cx={wheels.left} cy={-5} r={wheels.r * 0.15} fill="#E5E7EB" />
                <circle cx={wheels.right} cy={-5} r={wheels.r} fill={style.wheelColor} />
                <circle cx={wheels.right} cy={-5} r={wheels.r * 0.5} fill={style.hubColor} />
                <circle cx={wheels.right} cy={-5} r={wheels.r * 0.15} fill="#E5E7EB" />

                {/* Bumper / undercarriage */}
                <rect x={bumper.x} y={-8} width={bumper.w} height={2.5} rx={1} fill="#374151" opacity={0.7} />

                {/* Avatar in windshield — counter-scale to get 1:1 screen pixels */}
                {avatarConfig && (
                  <g transform={`translate(${WS_CX}, ${WS_CY}) scale(${-1 / scale}, ${1 / scale})`}>
                    <foreignObject
                      x={-CAR_AVATAR_PX / 2}
                      y={-CAR_AVATAR_PX / 2}
                      width={CAR_AVATAR_PX}
                      height={CAR_AVATAR_PX}
                      style={{ overflow: "visible" }}
                    >
                      <Avatar config={avatarConfig} size={CAR_AVATAR_PX} hideBackground />
                    </foreignObject>
                  </g>
                )}
              </motion.g>
            </AnimatePresence>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
