"use client";

import { motion, AnimatePresence } from "framer-motion";

interface HouseProps {
  x: number;
  y: number;
  developmentLevel: number; // 0-1
  scale?: number;
}

export function getHouseTier(developmentLevel: number): number {
  if (developmentLevel < 0.15) return 1;
  if (developmentLevel < 0.35) return 2;
  if (developmentLevel < 0.55) return 3;
  if (developmentLevel < 0.75) return 4;
  return 5;
}

const springTransition = {
  type: "spring" as const,
  stiffness: 80,
  damping: 14,
};

const tierVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ─── Smoke wisp component (animated) ─── */
function SmokeWisp({
  cx,
  startY,
  delay,
  size,
}: {
  cx: number;
  startY: number;
  delay: number;
  size: number;
}) {
  return (
    <motion.ellipse
      cx={cx}
      cy={startY}
      rx={size}
      ry={size * 0.6}
      fill="#D6D3D1"
      opacity={0.6}
      animate={{
        cy: [startY, startY - 18],
        rx: [size, size * 1.8],
        ry: [size * 0.6, size * 1.1],
        opacity: [0.6, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tier 1 — Rundown Shed / Mobile Home
   ═══════════════════════════════════════════════════════════════ */
function Tier1({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 40 * s;
  const h = 25 * s;

  return (
    <motion.g key="tier-1" variants={tierVariants} initial="initial" animate="animate" exit="exit">
      {/* Body — slightly tilted */}
      <polygon
        points={`
          ${x - w / 2 + 2 * s},${y}
          ${x - w / 2},${y - h}
          ${x + w / 2 - 1 * s},${y - h - 2 * s}
          ${x + w / 2},${y}
        `}
        fill="#78716C"
        stroke="#57534E"
        strokeWidth={0.8}
      />

      {/* Corrugated metal lines */}
      {[0.2, 0.4, 0.6, 0.8].map((frac) => {
        const ly = y - h * frac;
        return (
          <path
            key={frac}
            d={`M${x - w / 2 + 2 * s * (1 - frac)},${ly}
                Q${x - w / 4},${ly - 1.2 * s} ${x},${ly + 0.8 * s}
                Q${x + w / 4},${ly - 0.6 * s} ${x + w / 2 - 1 * s * (1 - frac)},${ly - 0.5 * s}`}
            fill="none"
            stroke="#A8A29E"
            strokeWidth={0.5}
            opacity={0.6}
          />
        );
      })}

      {/* Rust patches */}
      <ellipse cx={x - 8 * s} cy={y - 10 * s} rx={5 * s} ry={3 * s} fill="#92400E" opacity={0.45} />
      <ellipse cx={x + 10 * s} cy={y - 18 * s} rx={4 * s} ry={2.5 * s} fill="#92400E" opacity={0.35} />
      <ellipse cx={x + 3 * s} cy={y - 6 * s} rx={3 * s} ry={2 * s} fill="#92400E" opacity={0.3} />

      {/* Roof line — slightly sagging */}
      <path
        d={`M${x - w / 2 - 2 * s},${y - h} Q${x},${y - h - 4 * s} ${x + w / 2 + 1 * s},${y - h - 2 * s}`}
        fill="none"
        stroke="#57534E"
        strokeWidth={1.5}
      />

      {/* Cracked window */}
      <rect
        x={x - 12 * s}
        y={y - h + 5 * s}
        width={9 * s}
        height={8 * s}
        fill="#1C1917"
        opacity={0.7}
        rx={0.5}
      />
      {/* Crack lines */}
      <line
        x1={x - 12 * s}
        y1={y - h + 5 * s}
        x2={x - 5 * s}
        y2={y - h + 13 * s}
        stroke="#A8A29E"
        strokeWidth={0.5}
        opacity={0.6}
      />
      <line
        x1={x - 7 * s}
        y1={y - h + 5 * s}
        x2={x - 10 * s}
        y2={y - h + 11 * s}
        stroke="#A8A29E"
        strokeWidth={0.5}
        opacity={0.5}
      />

      {/* Barely-there door */}
      <rect
        x={x + 2 * s}
        y={y - 14 * s}
        width={8 * s}
        height={14 * s}
        fill="#57534E"
        rx={0.5}
      />
      <line
        x1={x + 2 * s}
        y1={y - 14 * s}
        x2={x + 10 * s}
        y2={y - 14 * s}
        stroke="#44403C"
        strokeWidth={0.8}
      />

      {/* Broken satellite dish on top */}
      <g transform={`translate(${x + 6 * s}, ${y - h - 4 * s}) rotate(15)`}>
        <line x1={0} y1={0} x2={0} y2={-6 * s} stroke="#78716C" strokeWidth={1} />
        <path
          d={`M${-4 * s},${-6 * s} Q${0},${-10 * s} ${4 * s},${-6 * s}`}
          fill="none"
          stroke="#78716C"
          strokeWidth={1}
        />
        {/* Broken arm */}
        <line x1={0} y1={-7 * s} x2={2 * s} y2={-5 * s} stroke="#78716C" strokeWidth={0.6} />
      </g>
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tier 2 — Small Basic House
   ═══════════════════════════════════════════════════════════════ */
function Tier2({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 50 * s;
  const h = 28 * s;
  const roofH = 7 * s;

  return (
    <motion.g key="tier-2" variants={tierVariants} initial="initial" animate="animate" exit="exit">
      {/* Walls */}
      <rect
        x={x - w / 2}
        y={y - h}
        width={w}
        height={h}
        fill="#D4C5A9"
        stroke="#BBA98A"
        strokeWidth={0.8}
        rx={1}
      />

      {/* Low-slope roof */}
      <polygon
        points={`
          ${x - w / 2 - 3 * s},${y - h}
          ${x},${y - h - roofH}
          ${x + w / 2 + 3 * s},${y - h}
        `}
        fill="#8B7355"
        stroke="#7A6548"
        strokeWidth={0.6}
      />

      {/* Single small window (dark) */}
      <rect
        x={x - 14 * s}
        y={y - h + 8 * s}
        width={10 * s}
        height={9 * s}
        fill="#374151"
        stroke="#A8A29E"
        strokeWidth={0.6}
        rx={0.5}
      />
      {/* Window cross */}
      <line
        x1={x - 9 * s}
        y1={y - h + 8 * s}
        x2={x - 9 * s}
        y2={y - h + 17 * s}
        stroke="#A8A29E"
        strokeWidth={0.5}
      />
      <line
        x1={x - 14 * s}
        y1={y - h + 12.5 * s}
        x2={x - 4 * s}
        y2={y - h + 12.5 * s}
        stroke="#A8A29E"
        strokeWidth={0.5}
      />

      {/* Basic door */}
      <rect
        x={x + 2 * s}
        y={y - 16 * s}
        width={10 * s}
        height={16 * s}
        fill="#8B7355"
        stroke="#7A6548"
        strokeWidth={0.6}
        rx={0.5}
      />
      <circle cx={x + 10 * s} cy={y - 8 * s} r={1 * s} fill="#D4C5A9" />

      {/* Tiny bush */}
      <ellipse
        cx={x + w / 2 + 5 * s}
        cy={y - 3 * s}
        rx={6 * s}
        ry={4 * s}
        fill="#4D7C0F"
        opacity={0.8}
      />
      <ellipse
        cx={x + w / 2 + 3 * s}
        cy={y - 5 * s}
        rx={4 * s}
        ry={3 * s}
        fill="#65A30D"
        opacity={0.7}
      />
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tier 3 — Normal Home
   ═══════════════════════════════════════════════════════════════ */
function Tier3({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 65 * s;
  const h = 35 * s;
  const roofH = 18 * s;

  return (
    <motion.g key="tier-3" variants={tierVariants} initial="initial" animate="animate" exit="exit">
      {/* Walls */}
      <rect
        x={x - w / 2}
        y={y - h}
        width={w}
        height={h}
        fill="#E8D5B7"
        stroke="#D4C5A9"
        strokeWidth={0.8}
        rx={1.5}
      />

      {/* Peaked roof */}
      <polygon
        points={`
          ${x - w / 2 - 4 * s},${y - h}
          ${x},${y - h - roofH}
          ${x + w / 2 + 4 * s},${y - h}
        `}
        fill="#8B4513"
        stroke="#7A3B10"
        strokeWidth={0.8}
      />

      {/* Chimney */}
      <rect
        x={x + 12 * s}
        y={y - h - roofH + 6 * s}
        width={7 * s}
        height={14 * s}
        fill="#78716C"
        stroke="#57534E"
        strokeWidth={0.6}
        rx={0.5}
      />
      {/* Chimney cap */}
      <rect
        x={x + 11 * s}
        y={y - h - roofH + 5 * s}
        width={9 * s}
        height={2 * s}
        fill="#57534E"
        rx={0.5}
      />

      {/* Left window — warm glow */}
      <rect
        x={x - w / 2 + 8 * s}
        y={y - h + 8 * s}
        width={12 * s}
        height={11 * s}
        fill="#FEF3C7"
        stroke="#D4C5A9"
        strokeWidth={0.6}
        rx={1}
      />
      {/* Glow effect */}
      <rect
        x={x - w / 2 + 8 * s}
        y={y - h + 8 * s}
        width={12 * s}
        height={11 * s}
        fill="#FBBF24"
        opacity={0.15}
        rx={1}
      />
      {/* Window cross */}
      <line
        x1={x - w / 2 + 14 * s}
        y1={y - h + 8 * s}
        x2={x - w / 2 + 14 * s}
        y2={y - h + 19 * s}
        stroke="#BBA98A"
        strokeWidth={0.6}
      />
      <line
        x1={x - w / 2 + 8 * s}
        y1={y - h + 13.5 * s}
        x2={x - w / 2 + 20 * s}
        y2={y - h + 13.5 * s}
        stroke="#BBA98A"
        strokeWidth={0.6}
      />

      {/* Right window — warm glow */}
      <rect
        x={x + w / 2 - 20 * s}
        y={y - h + 8 * s}
        width={12 * s}
        height={11 * s}
        fill="#FEF3C7"
        stroke="#D4C5A9"
        strokeWidth={0.6}
        rx={1}
      />
      <rect
        x={x + w / 2 - 20 * s}
        y={y - h + 8 * s}
        width={12 * s}
        height={11 * s}
        fill="#FBBF24"
        opacity={0.15}
        rx={1}
      />
      <line
        x1={x + w / 2 - 14 * s}
        y1={y - h + 8 * s}
        x2={x + w / 2 - 14 * s}
        y2={y - h + 19 * s}
        stroke="#BBA98A"
        strokeWidth={0.6}
      />
      <line
        x1={x + w / 2 - 20 * s}
        y1={y - h + 13.5 * s}
        x2={x + w / 2 - 8 * s}
        y2={y - h + 13.5 * s}
        stroke="#BBA98A"
        strokeWidth={0.6}
      />

      {/* Front door */}
      <rect
        x={x - 6 * s}
        y={y - 20 * s}
        width={12 * s}
        height={20 * s}
        fill="#78350F"
        stroke="#5C2D0E"
        strokeWidth={0.6}
        rx={1}
      />
      {/* Doorknob */}
      <circle cx={x + 4 * s} cy={y - 10 * s} r={1.2 * s} fill="#FBBF24" />

      {/* Porch step */}
      <rect
        x={x - 10 * s}
        y={y}
        width={20 * s}
        height={3 * s}
        fill="#A8A29E"
        rx={0.5}
      />
      <rect
        x={x - 8 * s}
        y={y - 1 * s}
        width={16 * s}
        height={1.5 * s}
        fill="#BBA98A"
        rx={0.3}
      />
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tier 4 — Nice Cozy Home
   ═══════════════════════════════════════════════════════════════ */
function Tier4({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 80 * s;
  const h = 42 * s;
  const roofH = 20 * s;
  const garageW = 22 * s;

  return (
    <motion.g key="tier-4" variants={tierVariants} initial="initial" animate="animate" exit="exit">
      {/* Main walls */}
      <rect
        x={x - w / 2}
        y={y - h}
        width={w}
        height={h}
        fill="#F5E6D3"
        stroke="#E8D5B7"
        strokeWidth={0.8}
        rx={1.5}
      />

      {/* Garage extension on the right */}
      <rect
        x={x + w / 2}
        y={y - 26 * s}
        width={garageW}
        height={26 * s}
        fill="#EDE0D0"
        stroke="#E8D5B7"
        strokeWidth={0.8}
        rx={1}
      />
      {/* Garage door */}
      <rect
        x={x + w / 2 + 3 * s}
        y={y - 20 * s}
        width={16 * s}
        height={20 * s}
        fill="#D4C5A9"
        stroke="#BBA98A"
        strokeWidth={0.6}
        rx={1}
      />
      {/* Garage door lines */}
      {[0.25, 0.5, 0.75].map((frac) => (
        <line
          key={frac}
          x1={x + w / 2 + 3 * s}
          y1={y - 20 * s * (1 - frac)}
          x2={x + w / 2 + 19 * s}
          y2={y - 20 * s * (1 - frac)}
          stroke="#BBA98A"
          strokeWidth={0.4}
        />
      ))}
      {/* Garage roof */}
      <polygon
        points={`
          ${x + w / 2 - 2 * s},${y - 26 * s}
          ${x + w / 2 + garageW / 2},${y - 26 * s - 8 * s}
          ${x + w / 2 + garageW + 2 * s},${y - 26 * s}
        `}
        fill="#6B3410"
        stroke="#5C2D0E"
        strokeWidth={0.6}
      />

      {/* Main roof */}
      <polygon
        points={`
          ${x - w / 2 - 5 * s},${y - h}
          ${x},${y - h - roofH}
          ${x + w / 2 + 5 * s},${y - h}
        `}
        fill="#6B3410"
        stroke="#5C2D0E"
        strokeWidth={0.8}
      />

      {/* Chimney with smoke */}
      <rect
        x={x + 14 * s}
        y={y - h - roofH + 5 * s}
        width={8 * s}
        height={16 * s}
        fill="#78716C"
        stroke="#57534E"
        strokeWidth={0.6}
        rx={0.5}
      />
      <rect
        x={x + 13 * s}
        y={y - h - roofH + 4 * s}
        width={10 * s}
        height={2.5 * s}
        fill="#57534E"
        rx={0.5}
      />
      {/* Animated smoke */}
      <SmokeWisp cx={x + 18 * s} startY={y - h - roofH + 2 * s} delay={0} size={3 * s} />
      <SmokeWisp cx={x + 16 * s} startY={y - h - roofH + 1 * s} delay={0.8} size={2.5 * s} />
      <SmokeWisp cx={x + 19 * s} startY={y - h - roofH + 3 * s} delay={1.6} size={2 * s} />

      {/* --- First floor windows with shutters --- */}
      {/* Left window */}
      <rect x={x - w / 2 + 8 * s} y={y - 22 * s} width={13 * s} height={12 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
      <rect x={x - w / 2 + 8 * s} y={y - 22 * s} width={13 * s} height={12 * s} fill="#FBBF24" opacity={0.12} rx={1} />
      {/* Shutters */}
      <rect x={x - w / 2 + 4 * s} y={y - 23 * s} width={4 * s} height={14 * s} fill="#6B3410" rx={0.5} />
      <rect x={x - w / 2 + 21 * s} y={y - 23 * s} width={4 * s} height={14 * s} fill="#6B3410" rx={0.5} />
      {/* Window cross */}
      <line x1={x - w / 2 + 14.5 * s} y1={y - 22 * s} x2={x - w / 2 + 14.5 * s} y2={y - 10 * s} stroke="#BBA98A" strokeWidth={0.5} />
      <line x1={x - w / 2 + 8 * s} y1={y - 16 * s} x2={x - w / 2 + 21 * s} y2={y - 16 * s} stroke="#BBA98A" strokeWidth={0.5} />

      {/* Right window (near center) */}
      <rect x={x + 6 * s} y={y - 22 * s} width={13 * s} height={12 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
      <rect x={x + 6 * s} y={y - 22 * s} width={13 * s} height={12 * s} fill="#FBBF24" opacity={0.12} rx={1} />
      <line x1={x + 12.5 * s} y1={y - 22 * s} x2={x + 12.5 * s} y2={y - 10 * s} stroke="#BBA98A" strokeWidth={0.5} />
      <line x1={x + 6 * s} y1={y - 16 * s} x2={x + 19 * s} y2={y - 16 * s} stroke="#BBA98A" strokeWidth={0.5} />

      {/* --- Second floor windows --- */}
      <rect x={x - w / 2 + 12 * s} y={y - h + 6 * s} width={11 * s} height={10 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
      <rect x={x - w / 2 + 12 * s} y={y - h + 6 * s} width={11 * s} height={10 * s} fill="#FBBF24" opacity={0.1} rx={1} />
      <line x1={x - w / 2 + 17.5 * s} y1={y - h + 6 * s} x2={x - w / 2 + 17.5 * s} y2={y - h + 16 * s} stroke="#BBA98A" strokeWidth={0.5} />

      <rect x={x + w / 2 - 23 * s} y={y - h + 6 * s} width={11 * s} height={10 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
      <rect x={x + w / 2 - 23 * s} y={y - h + 6 * s} width={11 * s} height={10 * s} fill="#FBBF24" opacity={0.1} rx={1} />
      <line x1={x + w / 2 - 17.5 * s} y1={y - h + 6 * s} x2={x + w / 2 - 17.5 * s} y2={y - h + 16 * s} stroke="#BBA98A" strokeWidth={0.5} />

      {/* Window boxes with flowers on 2nd floor */}
      {[x - w / 2 + 12 * s, x + w / 2 - 23 * s].map((wx) => (
        <g key={wx}>
          <rect x={wx - 1 * s} y={y - h + 16 * s} width={13 * s} height={3 * s} fill="#8B7355" rx={0.5} />
          {/* Flower dots */}
          <circle cx={wx + 2 * s} cy={y - h + 15.5 * s} r={1.5 * s} fill="#F87171" />
          <circle cx={wx + 5.5 * s} cy={y - h + 14.8 * s} r={1.3 * s} fill="#FB923C" />
          <circle cx={wx + 9 * s} cy={y - h + 15.2 * s} r={1.5 * s} fill="#F472B6" />
        </g>
      ))}

      {/* Front door */}
      <rect
        x={x - 7 * s}
        y={y - 24 * s}
        width={13 * s}
        height={24 * s}
        fill="#5C2D0E"
        stroke="#4A2308"
        strokeWidth={0.6}
        rx={1}
      />
      {/* Door upper window */}
      <rect x={x - 4 * s} y={y - 21 * s} width={7 * s} height={6 * s} fill="#FEF3C7" rx={0.5} opacity={0.7} />
      <circle cx={x + 4 * s} cy={y - 10 * s} r={1.3 * s} fill="#FBBF24" />

      {/* Porch with columns */}
      <rect x={x - 12 * s} y={y} width={24 * s} height={3 * s} fill="#BBA98A" rx={0.5} />
      <rect x={x - 11 * s} y={y - 1 * s} width={22 * s} height={2 * s} fill="#D4C5A9" rx={0.3} />
      {/* Porch roof */}
      <rect x={x - 14 * s} y={y - 26 * s} width={28 * s} height={2 * s} fill="#6B3410" rx={0.5} />
      {/* Columns */}
      <rect x={x - 13 * s} y={y - 26 * s} width={2 * s} height={26 * s} fill="#E8D5B7" rx={0.5} />
      <rect x={x + 11 * s} y={y - 26 * s} width={2 * s} height={26 * s} fill="#E8D5B7" rx={0.5} />
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tier 5 — Grand Mansion
   ═══════════════════════════════════════════════════════════════ */
function Tier5({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 110 * s;
  const h = 50 * s;
  const roofH = 22 * s;

  return (
    <motion.g key="tier-5" variants={tierVariants} initial="initial" animate="animate" exit="exit">
      {/* Main walls */}
      <rect
        x={x - w / 2}
        y={y - h}
        width={w}
        height={h}
        fill="#FAF5EF"
        stroke="#E8D5B7"
        strokeWidth={1}
        rx={2}
      />

      {/* Decorative horizontal band */}
      <rect x={x - w / 2} y={y - h / 2 - 1 * s} width={w} height={2 * s} fill="#E8D5B7" />

      {/* Main roof */}
      <polygon
        points={`
          ${x - w / 2 - 6 * s},${y - h}
          ${x - w / 6},${y - h - roofH}
          ${x + w / 6},${y - h - roofH}
          ${x + w / 2 + 6 * s},${y - h}
        `}
        fill="#4A3728"
        stroke="#3B2C20"
        strokeWidth={0.8}
      />

      {/* Roof ridge decoration */}
      <line
        x1={x - w / 6}
        y1={y - h - roofH}
        x2={x + w / 6}
        y2={y - h - roofH}
        stroke="#3B2C20"
        strokeWidth={1.5}
      />

      {/* Left chimney */}
      <rect
        x={x - w / 3}
        y={y - h - roofH + 3 * s}
        width={7 * s}
        height={18 * s}
        fill="#78716C"
        stroke="#57534E"
        strokeWidth={0.6}
        rx={0.5}
      />
      <rect
        x={x - w / 3 - 1 * s}
        y={y - h - roofH + 2 * s}
        width={9 * s}
        height={2.5 * s}
        fill="#57534E"
        rx={0.5}
      />

      {/* Right chimney with smoke */}
      <rect
        x={x + w / 3 - 7 * s}
        y={y - h - roofH + 3 * s}
        width={7 * s}
        height={18 * s}
        fill="#78716C"
        stroke="#57534E"
        strokeWidth={0.6}
        rx={0.5}
      />
      <rect
        x={x + w / 3 - 8 * s}
        y={y - h - roofH + 2 * s}
        width={9 * s}
        height={2.5 * s}
        fill="#57534E"
        rx={0.5}
      />
      <SmokeWisp cx={x + w / 3 - 3.5 * s} startY={y - h - roofH} delay={0} size={3 * s} />
      <SmokeWisp cx={x + w / 3 - 5 * s} startY={y - h - roofH - 1 * s} delay={1} size={2.5 * s} />
      <SmokeWisp cx={x + w / 3 - 2 * s} startY={y - h - roofH + 1 * s} delay={2} size={2 * s} />

      {/* --- Second floor windows with shutters --- */}
      {[-3, -1, 1, 3].map((pos) => {
        const wx = x + pos * 12 * s;
        return (
          <g key={`w2-${pos}`}>
            <rect x={wx - 5 * s} y={y - h + 6 * s} width={10 * s} height={12 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
            <rect x={wx - 5 * s} y={y - h + 6 * s} width={10 * s} height={12 * s} fill="#F59E0B" opacity={0.08} rx={1} />
            {/* Cross */}
            <line x1={wx} y1={y - h + 6 * s} x2={wx} y2={y - h + 18 * s} stroke="#BBA98A" strokeWidth={0.4} />
            <line x1={wx - 5 * s} y1={y - h + 12 * s} x2={wx + 5 * s} y2={y - h + 12 * s} stroke="#BBA98A" strokeWidth={0.4} />
            {/* Shutters */}
            <rect x={wx - 8 * s} y={y - h + 5 * s} width={3 * s} height={14 * s} fill="#4A3728" rx={0.5} />
            <rect x={wx + 5 * s} y={y - h + 5 * s} width={3 * s} height={14 * s} fill="#4A3728" rx={0.5} />
          </g>
        );
      })}

      {/* Second floor balcony */}
      <rect x={x - 16 * s} y={y - h + 18 * s} width={32 * s} height={1.5 * s} fill="#D4C5A9" rx={0.5} />
      {/* Balcony railing posts */}
      {[-14, -10, -6, -2, 2, 6, 10, 14].map((offset) => (
        <rect
          key={`rail-${offset}`}
          x={x + offset * s - 0.5 * s}
          y={y - h + 19.5 * s}
          width={1 * s}
          height={5 * s}
          fill="#D4C5A9"
          rx={0.3}
        />
      ))}
      <rect x={x - 16 * s} y={y - h + 24 * s} width={32 * s} height={1 * s} fill="#D4C5A9" rx={0.3} />

      {/* --- First floor windows with shutters --- */}
      {[-3.5, -1.5, 1.5, 3.5].map((pos) => {
        const wx = x + pos * 12 * s;
        // Skip windows near the door area
        if (Math.abs(pos) < 2) return null;
        return (
          <g key={`w1-${pos}`}>
            <rect x={wx - 5.5 * s} y={y - 24 * s} width={11 * s} height={13 * s} fill="#FEF3C7" stroke="#D4C5A9" strokeWidth={0.5} rx={1} />
            <rect x={wx - 5.5 * s} y={y - 24 * s} width={11 * s} height={13 * s} fill="#F59E0B" opacity={0.08} rx={1} />
            <line x1={wx} y1={y - 24 * s} x2={wx} y2={y - 11 * s} stroke="#BBA98A" strokeWidth={0.4} />
            <line x1={wx - 5.5 * s} y1={y - 17.5 * s} x2={wx + 5.5 * s} y2={y - 17.5 * s} stroke="#BBA98A" strokeWidth={0.4} />
            {/* Arched top */}
            <path
              d={`M${wx - 5.5 * s},${y - 24 * s} Q${wx},${y - 28 * s} ${wx + 5.5 * s},${y - 24 * s}`}
              fill="#FAF5EF"
              stroke="#D4C5A9"
              strokeWidth={0.5}
            />
            <rect x={wx - 8.5 * s} y={y - 25 * s} width={3 * s} height={15 * s} fill="#4A3728" rx={0.5} />
            <rect x={wx + 5.5 * s} y={y - 25 * s} width={3 * s} height={15 * s} fill="#4A3728" rx={0.5} />
          </g>
        );
      })}

      {/* Grand entrance — double doors with columns */}
      {/* Ornate doorframe / archway */}
      <path
        d={`M${x - 12 * s},${y} L${x - 12 * s},${y - 30 * s} Q${x},${y - 38 * s} ${x + 12 * s},${y - 30 * s} L${x + 12 * s},${y}`}
        fill="#E8D5B7"
        stroke="#D4C5A9"
        strokeWidth={0.8}
      />
      {/* Left door */}
      <rect
        x={x - 10 * s}
        y={y - 28 * s}
        width={10 * s}
        height={28 * s}
        fill="#4A3728"
        stroke="#3B2C20"
        strokeWidth={0.6}
        rx={0.5}
      />
      {/* Right door */}
      <rect
        x={x}
        y={y - 28 * s}
        width={10 * s}
        height={28 * s}
        fill="#4A3728"
        stroke="#3B2C20"
        strokeWidth={0.6}
        rx={0.5}
      />
      {/* Door handles */}
      <circle cx={x - 2 * s} cy={y - 14 * s} r={1.3 * s} fill="#F59E0B" />
      <circle cx={x + 2 * s} cy={y - 14 * s} r={1.3 * s} fill="#F59E0B" />
      {/* Fanlight above door */}
      <path
        d={`M${x - 9 * s},${y - 28 * s} Q${x},${y - 34 * s} ${x + 9 * s},${y - 28 * s}`}
        fill="#FEF3C7"
        stroke="#D4C5A9"
        strokeWidth={0.5}
        opacity={0.8}
      />

      {/* Grand columns */}
      {[-14, 14].map((offset) => (
        <g key={`col-${offset}`}>
          <rect
            x={x + offset * s - 2.5 * s}
            y={y - 32 * s}
            width={5 * s}
            height={32 * s}
            fill="#E8D5B7"
            stroke="#D4C5A9"
            strokeWidth={0.5}
            rx={1}
          />
          {/* Column capital */}
          <rect
            x={x + offset * s - 3.5 * s}
            y={y - 33 * s}
            width={7 * s}
            height={2 * s}
            fill="#D4C5A9"
            rx={0.5}
          />
          {/* Column base */}
          <rect
            x={x + offset * s - 3.5 * s}
            y={y - 1 * s}
            width={7 * s}
            height={2 * s}
            fill="#D4C5A9"
            rx={0.5}
          />
        </g>
      ))}

      {/* Portico / entrance roof */}
      <polygon
        points={`
          ${x - 18 * s},${y - 33 * s}
          ${x},${y - 40 * s}
          ${x + 18 * s},${y - 33 * s}
        `}
        fill="#4A3728"
        stroke="#3B2C20"
        strokeWidth={0.6}
      />

      {/* Ground level step / foundation */}
      <rect x={x - w / 2 - 2 * s} y={y} width={w + 4 * s} height={3 * s} fill="#D4C5A9" rx={0.5} />

      {/* Fountain / pool in front */}
      <ellipse
        cx={x}
        cy={y + 14 * s}
        rx={16 * s}
        ry={5 * s}
        fill="#7DD3FC"
        stroke="#38BDF8"
        strokeWidth={0.8}
        opacity={0.7}
      />
      <ellipse
        cx={x}
        cy={y + 14 * s}
        rx={12 * s}
        ry={3.5 * s}
        fill="#BAE6FD"
        opacity={0.5}
      />
      {/* Fountain center */}
      <ellipse cx={x} cy={y + 13 * s} rx={2 * s} ry={1.5 * s} fill="#D4C5A9" />
      <motion.line
        x1={x}
        y1={y + 12 * s}
        x2={x}
        y2={y + 6 * s}
        stroke="#7DD3FC"
        strokeWidth={1.5}
        opacity={0.6}
        animate={{ y2: [y + 6 * s, y + 4 * s, y + 6 * s] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main House Component
   ═══════════════════════════════════════════════════════════════ */
export default function House({ x, y, developmentLevel, scale = 1 }: HouseProps) {
  const tier = getHouseTier(developmentLevel);
  const s = scale;

  return (
    <AnimatePresence mode="wait">
      {tier === 1 && <Tier1 key="tier-1" x={x} y={y} s={s} />}
      {tier === 2 && <Tier2 key="tier-2" x={x} y={y} s={s} />}
      {tier === 3 && <Tier3 key="tier-3" x={x} y={y} s={s} />}
      {tier === 4 && <Tier4 key="tier-4" x={x} y={y} s={s} />}
      {tier === 5 && <Tier5 key="tier-5" x={x} y={y} s={s} />}
    </AnimatePresence>
  );
}
