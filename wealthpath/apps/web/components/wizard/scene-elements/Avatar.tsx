"use client";

import { motion } from "framer-motion";

export interface AvatarConfig {
  id: string;
  skinTone: string;
  hairColor: string;
  hairStyle: "short" | "long" | "curly" | "bun" | "buzz" | "wavy" | "pompadour" | "afro" | "pixie" | "braids" | "sidePart" | "mohawk";
  hasGlasses: boolean;
  hasBeard: boolean;
  accessoryColor: string;
  shirtColor: string;
  /** Optional earrings color. If set, earrings are rendered. */
  earringsColor?: string;
  /** Optional headband/bandana color */
  headbandColor?: string;
  /** Shirt style variation */
  shirtStyle?: "crew" | "vneck" | "collared";
  /** Eye color override (defaults to dark brown) */
  eyeColor?: string;
  /** Cheek blush color for warmth */
  blushColor?: string;
}

export const AVATAR_PRESETS: AvatarConfig[] = [
  // ─── MALE AVATARS ───
  {
    id: "avatar-m1",
    skinTone: "#FDDCB1",
    hairColor: "#4A3728",
    hairStyle: "short",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#F59E0B",
    shirtColor: "#3B82F6",
    shirtStyle: "crew",
    eyeColor: "#5B4A3F",
    blushColor: "#F5A08C",
  },
  {
    id: "avatar-m2",
    skinTone: "#8D5524",
    hairColor: "#1A1A1A",
    hairStyle: "afro",
    hasGlasses: true,
    hasBeard: false,
    accessoryColor: "#F59E0B",
    shirtColor: "#8B5CF6",
    shirtStyle: "collared",
    eyeColor: "#3D2B1F",
  },
  {
    id: "avatar-m3",
    skinTone: "#C68642",
    hairColor: "#2C1810",
    hairStyle: "buzz",
    hasGlasses: false,
    hasBeard: true,
    accessoryColor: "#10B981",
    shirtColor: "#EF4444",
    shirtStyle: "crew",
    eyeColor: "#3D2B1F",
  },
  {
    id: "avatar-m4",
    skinTone: "#F5D0A9",
    hairColor: "#C9561A",
    hairStyle: "pompadour",
    hasGlasses: true,
    hasBeard: false,
    accessoryColor: "#6366F1",
    shirtColor: "#10B981",
    shirtStyle: "vneck",
    eyeColor: "#4E7A4D",
    blushColor: "#F5A08C",
  },
  {
    id: "avatar-m5",
    skinTone: "#D4A574",
    hairColor: "#F5E6CA",
    hairStyle: "sidePart",
    hasGlasses: false,
    hasBeard: true,
    accessoryColor: "#14B8A6",
    shirtColor: "#F97316",
    shirtStyle: "collared",
    eyeColor: "#5B4A3F",
  },
  {
    id: "avatar-m6",
    skinTone: "#F1C27D",
    hairColor: "#1A1A1A",
    hairStyle: "mohawk",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#EC4899",
    shirtColor: "#2563EB",
    shirtStyle: "crew",
    eyeColor: "#3D2B1F",
    headbandColor: "#EC4899",
  },

  // ─── FEMALE AVATARS ───
  {
    id: "avatar-f1",
    skinTone: "#FDDCB1",
    hairColor: "#B8860B",
    hairStyle: "long",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#EC4899",
    shirtColor: "#A855F7",
    shirtStyle: "vneck",
    earringsColor: "#F59E0B",
    eyeColor: "#5B7A3F",
    blushColor: "#F5A08C",
  },
  {
    id: "avatar-f2",
    skinTone: "#8D5524",
    hairColor: "#1A1A1A",
    hairStyle: "braids",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#F59E0B",
    shirtColor: "#F43F5E",
    shirtStyle: "crew",
    earringsColor: "#F59E0B",
    eyeColor: "#3D2B1F",
    blushColor: "#C97A6A",
  },
  {
    id: "avatar-f3",
    skinTone: "#C68642",
    hairColor: "#2C1810",
    hairStyle: "curly",
    hasGlasses: true,
    hasBeard: false,
    accessoryColor: "#10B981",
    shirtColor: "#0EA5E9",
    shirtStyle: "vneck",
    eyeColor: "#4A3728",
  },
  {
    id: "avatar-f4",
    skinTone: "#F5D0A9",
    hairColor: "#D4763A",
    hairStyle: "pixie",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#6366F1",
    shirtColor: "#F59E0B",
    shirtStyle: "crew",
    earringsColor: "#6366F1",
    eyeColor: "#3B82F6",
    blushColor: "#F5A08C",
  },
  {
    id: "avatar-f5",
    skinTone: "#D4A574",
    hairColor: "#4A3728",
    hairStyle: "bun",
    hasGlasses: true,
    hasBeard: false,
    accessoryColor: "#F97316",
    shirtColor: "#14B8A6",
    shirtStyle: "collared",
    eyeColor: "#5B4A3F",
    headbandColor: "#F97316",
  },
  {
    id: "avatar-f6",
    skinTone: "#F1C27D",
    hairColor: "#8B4513",
    hairStyle: "wavy",
    hasGlasses: false,
    hasBeard: false,
    accessoryColor: "#A855F7",
    shirtColor: "#EC4899",
    shirtStyle: "vneck",
    earringsColor: "#A855F7",
    eyeColor: "#5B4A3F",
    blushColor: "#E8A090",
  },
];

interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  isSilhouette?: boolean;
  /** Hide the dark background circle (used when avatar is in the scene) */
  hideBackground?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Hair Styles SVG                                                           */
/* -------------------------------------------------------------------------- */

function HairSVG({
  style,
  color,
  size,
}: {
  style: string;
  color: string;
  size: number;
}) {
  const s = size;
  const cx = s / 2;
  switch (style) {
    // ── Male-leaning styles ──
    case "short":
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.27} rx={s * 0.21} ry={s * 0.11} fill={color} />
          {/* Side taper */}
          <rect x={s * 0.3} y={s * 0.3} width={s * 0.04} height={s * 0.06} rx={s * 0.01} fill={color} opacity={0.7} />
          <rect x={s * 0.66} y={s * 0.3} width={s * 0.04} height={s * 0.06} rx={s * 0.01} fill={color} opacity={0.7} />
        </g>
      );
    case "buzz":
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.28} rx={s * 0.19} ry={s * 0.08} fill={color} opacity={0.8} />
          {/* Subtle stubble texture dots */}
          <circle cx={s * 0.4} cy={s * 0.25} r={s * 0.01} fill={color} opacity={0.5} />
          <circle cx={s * 0.5} cy={s * 0.23} r={s * 0.01} fill={color} opacity={0.5} />
          <circle cx={s * 0.6} cy={s * 0.25} r={s * 0.01} fill={color} opacity={0.5} />
        </g>
      );
    case "pompadour":
      return (
        <g>
          {/* Voluminous top swept back */}
          <ellipse cx={cx} cy={s * 0.24} rx={s * 0.2} ry={s * 0.13} fill={color} />
          <ellipse cx={s * 0.45} cy={s * 0.2} rx={s * 0.14} ry={s * 0.09} fill={color} />
          {/* Sides trimmed */}
          <rect x={s * 0.3} y={s * 0.3} width={s * 0.04} height={s * 0.08} rx={s * 0.01} fill={color} opacity={0.6} />
          <rect x={s * 0.66} y={s * 0.3} width={s * 0.04} height={s * 0.08} rx={s * 0.01} fill={color} opacity={0.6} />
        </g>
      );
    case "afro":
      return (
        <g>
          {/* Big round afro */}
          <circle cx={cx} cy={s * 0.28} r={s * 0.24} fill={color} />
          {/* Texture bumps around the edge */}
          <circle cx={s * 0.3} cy={s * 0.2} r={s * 0.04} fill={color} />
          <circle cx={s * 0.7} cy={s * 0.2} r={s * 0.04} fill={color} />
          <circle cx={s * 0.26} cy={s * 0.32} r={s * 0.035} fill={color} />
          <circle cx={s * 0.74} cy={s * 0.32} r={s * 0.035} fill={color} />
          <circle cx={cx} cy={s * 0.1} r={s * 0.04} fill={color} />
        </g>
      );
    case "sidePart":
      return (
        <g>
          {/* Parted hair with volume on one side */}
          <ellipse cx={s * 0.44} cy={s * 0.26} rx={s * 0.22} ry={s * 0.11} fill={color} />
          {/* Part line highlight */}
          <line
            x1={s * 0.38}
            y1={s * 0.19}
            x2={s * 0.36}
            y2={s * 0.3}
            stroke={color}
            strokeWidth={s * 0.008}
            opacity={0.3}
          />
          {/* Right side shorter */}
          <rect x={s * 0.64} y={s * 0.28} width={s * 0.05} height={s * 0.08} rx={s * 0.015} fill={color} opacity={0.7} />
        </g>
      );
    case "mohawk":
      return (
        <g>
          {/* Central ridge */}
          <ellipse cx={cx} cy={s * 0.22} rx={s * 0.07} ry={s * 0.14} fill={color} />
          <ellipse cx={cx} cy={s * 0.18} rx={s * 0.05} ry={s * 0.06} fill={color} />
          {/* Shaved sides (subtle skin show-through) */}
          <rect x={s * 0.3} y={s * 0.28} width={s * 0.06} height={s * 0.06} rx={s * 0.02} fill={color} opacity={0.25} />
          <rect x={s * 0.64} y={s * 0.28} width={s * 0.06} height={s * 0.06} rx={s * 0.02} fill={color} opacity={0.25} />
        </g>
      );

    // ── Female-leaning styles ──
    case "long":
      return (
        <g>
          {/* Top volume */}
          <ellipse cx={cx} cy={s * 0.26} rx={s * 0.24} ry={s * 0.13} fill={color} />
          {/* Side curtains flowing down */}
          <path
            d={`M${s * 0.27} ${s * 0.3} Q${s * 0.25} ${s * 0.42} ${s * 0.27} ${s * 0.54} Q${s * 0.28} ${s * 0.58} ${s * 0.3} ${s * 0.56}`}
            fill={color}
          />
          <path
            d={`M${s * 0.73} ${s * 0.3} Q${s * 0.75} ${s * 0.42} ${s * 0.73} ${s * 0.54} Q${s * 0.72} ${s * 0.58} ${s * 0.7} ${s * 0.56}`}
            fill={color}
          />
          {/* Inner strands */}
          <rect x={s * 0.27} y={s * 0.32} width={s * 0.04} height={s * 0.2} rx={s * 0.015} fill={color} opacity={0.8} />
          <rect x={s * 0.69} y={s * 0.32} width={s * 0.04} height={s * 0.2} rx={s * 0.015} fill={color} opacity={0.8} />
        </g>
      );
    case "curly":
      return (
        <g>
          {/* Voluminous curly hair */}
          <circle cx={s * 0.34} cy={s * 0.23} r={s * 0.075} fill={color} />
          <circle cx={cx} cy={s * 0.19} r={s * 0.085} fill={color} />
          <circle cx={s * 0.66} cy={s * 0.23} r={s * 0.075} fill={color} />
          <circle cx={s * 0.39} cy={s * 0.18} r={s * 0.06} fill={color} />
          <circle cx={s * 0.61} cy={s * 0.18} r={s * 0.06} fill={color} />
          {/* Side curls flowing down */}
          <circle cx={s * 0.28} cy={s * 0.33} r={s * 0.05} fill={color} />
          <circle cx={s * 0.72} cy={s * 0.33} r={s * 0.05} fill={color} />
          <circle cx={s * 0.27} cy={s * 0.42} r={s * 0.04} fill={color} />
          <circle cx={s * 0.73} cy={s * 0.42} r={s * 0.04} fill={color} />
        </g>
      );
    case "bun":
      return (
        <g>
          {/* Smooth top */}
          <ellipse cx={cx} cy={s * 0.27} rx={s * 0.22} ry={s * 0.11} fill={color} />
          {/* Bun on top */}
          <circle cx={cx} cy={s * 0.14} r={s * 0.09} fill={color} />
          {/* Bun highlight */}
          <circle cx={s * 0.48} cy={s * 0.12} r={s * 0.03} fill={color} opacity={0.6} />
          {/* Wisps on the sides */}
          <path
            d={`M${s * 0.3} ${s * 0.32} Q${s * 0.28} ${s * 0.36} ${s * 0.3} ${s * 0.38}`}
            stroke={color}
            strokeWidth={s * 0.02}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${s * 0.7} ${s * 0.32} Q${s * 0.72} ${s * 0.36} ${s * 0.7} ${s * 0.38}`}
            stroke={color}
            strokeWidth={s * 0.02}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "pixie":
      return (
        <g>
          {/* Short asymmetric pixie cut */}
          <ellipse cx={s * 0.46} cy={s * 0.26} rx={s * 0.22} ry={s * 0.11} fill={color} />
          {/* Longer side-swept bang */}
          <path
            d={`M${s * 0.32} ${s * 0.24} Q${s * 0.28} ${s * 0.3} ${s * 0.27} ${s * 0.37}`}
            stroke={color}
            strokeWidth={s * 0.06}
            fill="none"
            strokeLinecap="round"
          />
          {/* Short on right side */}
          <rect x={s * 0.66} y={s * 0.28} width={s * 0.04} height={s * 0.05} rx={s * 0.015} fill={color} opacity={0.6} />
        </g>
      );
    case "braids":
      return (
        <g>
          {/* Top volume */}
          <ellipse cx={cx} cy={s * 0.26} rx={s * 0.22} ry={s * 0.12} fill={color} />
          {/* Left braid */}
          <circle cx={s * 0.29} cy={s * 0.35} r={s * 0.03} fill={color} />
          <circle cx={s * 0.28} cy={s * 0.41} r={s * 0.028} fill={color} />
          <circle cx={s * 0.27} cy={s * 0.47} r={s * 0.026} fill={color} />
          <circle cx={s * 0.27} cy={s * 0.52} r={s * 0.022} fill={color} />
          {/* Right braid */}
          <circle cx={s * 0.71} cy={s * 0.35} r={s * 0.03} fill={color} />
          <circle cx={s * 0.72} cy={s * 0.41} r={s * 0.028} fill={color} />
          <circle cx={s * 0.73} cy={s * 0.47} r={s * 0.026} fill={color} />
          <circle cx={s * 0.73} cy={s * 0.52} r={s * 0.022} fill={color} />
        </g>
      );
    case "wavy":
      return (
        <g>
          {/* Top volume */}
          <ellipse cx={cx} cy={s * 0.25} rx={s * 0.24} ry={s * 0.13} fill={color} />
          {/* Flowing wavy sides */}
          <path
            d={`M${s * 0.28} ${s * 0.3} Q${s * 0.24} ${s * 0.38} ${s * 0.28} ${s * 0.44} Q${s * 0.31} ${s * 0.5} ${s * 0.27} ${s * 0.55}`}
            stroke={color}
            strokeWidth={s * 0.05}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M${s * 0.72} ${s * 0.3} Q${s * 0.76} ${s * 0.38} ${s * 0.72} ${s * 0.44} Q${s * 0.69} ${s * 0.5} ${s * 0.73} ${s * 0.55}`}
            stroke={color}
            strokeWidth={s * 0.05}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Shirt Styles SVG                                                          */
/* -------------------------------------------------------------------------- */

function ShirtSVG({
  style,
  color,
  size,
}: {
  style: string;
  color: string;
  size: number;
}) {
  const s = size;
  const cx = s / 2;

  switch (style) {
    case "vneck":
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.8} rx={s * 0.28} ry={s * 0.16} fill={color} />
          {/* V-neck cutout */}
          <path
            d={`M${s * 0.43} ${s * 0.65} L${cx} ${s * 0.74} L${s * 0.57} ${s * 0.65}`}
            stroke={darken(color, 0.15)}
            strokeWidth={s * 0.012}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "collared":
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.8} rx={s * 0.28} ry={s * 0.16} fill={color} />
          {/* Collar flaps */}
          <path
            d={`M${s * 0.41} ${s * 0.64} L${s * 0.44} ${s * 0.7} L${s * 0.48} ${s * 0.66}`}
            fill={lighten(color, 0.1)}
            stroke={darken(color, 0.12)}
            strokeWidth={s * 0.008}
          />
          <path
            d={`M${s * 0.59} ${s * 0.64} L${s * 0.56} ${s * 0.7} L${s * 0.52} ${s * 0.66}`}
            fill={lighten(color, 0.1)}
            stroke={darken(color, 0.12)}
            strokeWidth={s * 0.008}
          />
        </g>
      );
    default:
      // crew neck (default)
      return (
        <g>
          <ellipse cx={cx} cy={s * 0.8} rx={s * 0.28} ry={s * 0.16} fill={color} />
          {/* Crew neckline */}
          <path
            d={`M${s * 0.42} ${s * 0.66} Q${cx} ${s * 0.69} ${s * 0.58} ${s * 0.66}`}
            stroke={darken(color, 0.12)}
            strokeWidth={s * 0.012}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  Color Utilities                                                           */
/* -------------------------------------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    r + (255 - r) * amount,
    g + (255 - g) * amount,
    b + (255 - b) * amount
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Avatar Component                                                     */
/* -------------------------------------------------------------------------- */

export default function Avatar({
  config,
  size = 100,
  selected = false,
  onClick,
  className = "",
  isSilhouette = false,
  hideBackground = false,
}: AvatarProps) {
  const s = size;
  const cx = s / 2;
  const fillColor = isSilhouette ? "#4A5568" : config.skinTone;
  const hairFill = isSilhouette ? "#374151" : config.hairColor;
  const shirtFill = isSilhouette ? "#374151" : config.shirtColor;
  const opacity = isSilhouette ? 0.5 : 1;
  const eyeColor = isSilhouette ? "#1A1A1A" : (config.eyeColor || "#3D2B1F");

  return (
    <motion.div
      className={`inline-flex cursor-pointer items-center justify-center ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.08 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      style={{ opacity }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Select avatar ${config.id}` : `Avatar ${config.id}`}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        {!hideBackground && (
          <motion.circle
            cx={cx}
            cy={cx}
            r={s * 0.42}
            fill={selected ? "#FEF3C7" : "#1E293B"}
            stroke={selected ? "#F59E0B" : "#334155"}
            strokeWidth={selected ? 3 : s * 0.01}
            animate={selected ? { scale: [1, 1.1, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={selected ? { type: "spring", stiffness: 400, damping: 12 } : { duration: 0.2 }}
            style={{ transformOrigin: `${cx}px ${cx}px` }}
          />
        )}

        {/* Body / Shirt (with style) */}
        <ShirtSVG
          style={isSilhouette ? "crew" : (config.shirtStyle || "crew")}
          color={shirtFill}
          size={s}
        />

        {/* Neck */}
        <rect
          x={s * 0.44}
          y={s * 0.53}
          width={s * 0.12}
          height={s * 0.12}
          rx={s * 0.03}
          fill={fillColor}
        />
        {/* Neck shadow for depth */}
        <rect
          x={s * 0.44}
          y={s * 0.6}
          width={s * 0.12}
          height={s * 0.04}
          rx={s * 0.01}
          fill={isSilhouette ? "#374151" : darken(config.skinTone, 0.08)}
          opacity={0.4}
        />

        {/* Ears */}
        {!isSilhouette && (
          <>
            <ellipse
              cx={s * 0.3}
              cy={s * 0.38}
              rx={s * 0.035}
              ry={s * 0.045}
              fill={fillColor}
            />
            <ellipse
              cx={s * 0.7}
              cy={s * 0.38}
              rx={s * 0.035}
              ry={s * 0.045}
              fill={fillColor}
            />
            {/* Ear inner detail */}
            <ellipse
              cx={s * 0.3}
              cy={s * 0.385}
              rx={s * 0.018}
              ry={s * 0.025}
              fill={darken(config.skinTone, 0.1)}
              opacity={0.3}
            />
            <ellipse
              cx={s * 0.7}
              cy={s * 0.385}
              rx={s * 0.018}
              ry={s * 0.025}
              fill={darken(config.skinTone, 0.1)}
              opacity={0.3}
            />
          </>
        )}

        {/* Head */}
        <ellipse
          cx={cx}
          cy={s * 0.38}
          rx={s * 0.19}
          ry={s * 0.21}
          fill={fillColor}
        />

        {/* Hair (on top of head) */}
        <HairSVG style={config.hairStyle} color={hairFill} size={s} />

        {/* Headband (if configured) */}
        {config.headbandColor && !isSilhouette && (
          <path
            d={`M${s * 0.3} ${s * 0.3} Q${cx} ${s * 0.26} ${s * 0.7} ${s * 0.3}`}
            stroke={config.headbandColor}
            strokeWidth={s * 0.025}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Eyebrows */}
        {!isSilhouette && (
          <>
            <path
              d={`M${s * 0.37} ${s * 0.33} Q${s * 0.42} ${s * 0.31} ${s * 0.46} ${s * 0.33}`}
              stroke={hairFill}
              strokeWidth={s * 0.015}
              fill="none"
              strokeLinecap="round"
              opacity={0.6}
            />
            <path
              d={`M${s * 0.54} ${s * 0.33} Q${s * 0.58} ${s * 0.31} ${s * 0.63} ${s * 0.33}`}
              stroke={hairFill}
              strokeWidth={s * 0.015}
              fill="none"
              strokeLinecap="round"
              opacity={0.6}
            />
          </>
        )}

        {/* Eyes with iris and pupil */}
        {!isSilhouette && (
          <>
            {/* Eye whites */}
            <ellipse
              cx={s * 0.42}
              cy={s * 0.375}
              rx={s * 0.035}
              ry={s * 0.028}
              fill="#FFFFFF"
            />
            <ellipse
              cx={s * 0.58}
              cy={s * 0.375}
              rx={s * 0.035}
              ry={s * 0.028}
              fill="#FFFFFF"
            />
            {/* Iris */}
            <circle cx={s * 0.42} cy={s * 0.377} r={s * 0.02} fill={eyeColor} />
            <circle cx={s * 0.58} cy={s * 0.377} r={s * 0.02} fill={eyeColor} />
            {/* Pupil */}
            <circle cx={s * 0.42} cy={s * 0.377} r={s * 0.01} fill="#1A1A1A" />
            <circle cx={s * 0.58} cy={s * 0.377} r={s * 0.01} fill="#1A1A1A" />
            {/* Eye highlight */}
            <circle cx={s * 0.428} cy={s * 0.372} r={s * 0.006} fill="#FFFFFF" opacity={0.8} />
            <circle cx={s * 0.588} cy={s * 0.372} r={s * 0.006} fill="#FFFFFF" opacity={0.8} />
          </>
        )}

        {/* Nose (subtle) */}
        {!isSilhouette && (
          <path
            d={`M${cx} ${s * 0.39} L${s * 0.48} ${s * 0.43} L${s * 0.52} ${s * 0.43}`}
            stroke={darken(config.skinTone, 0.12)}
            strokeWidth={s * 0.01}
            fill="none"
            strokeLinecap="round"
            opacity={0.35}
          />
        )}

        {/* Cheek blush */}
        {!isSilhouette && config.blushColor && (
          <>
            <circle
              cx={s * 0.36}
              cy={s * 0.43}
              r={s * 0.03}
              fill={config.blushColor}
              opacity={0.25}
            />
            <circle
              cx={s * 0.64}
              cy={s * 0.43}
              r={s * 0.03}
              fill={config.blushColor}
              opacity={0.25}
            />
          </>
        )}

        {/* Smile */}
        {!isSilhouette && (
          <path
            d={`M${s * 0.44} ${s * 0.455} Q${cx} ${s * 0.5} ${s * 0.56} ${s * 0.455}`}
            stroke="#1A1A1A"
            strokeWidth={s * 0.013}
            fill="none"
            strokeLinecap="round"
            opacity={0.7}
          />
        )}

        {/* Glasses */}
        {config.hasGlasses && !isSilhouette && (
          <g>
            {/* Lens fill for realism */}
            <circle cx={s * 0.42} cy={s * 0.375} r={s * 0.055} fill={config.accessoryColor} opacity={0.08} />
            <circle cx={s * 0.58} cy={s * 0.375} r={s * 0.055} fill={config.accessoryColor} opacity={0.08} />
            {/* Frames */}
            <circle
              cx={s * 0.42}
              cy={s * 0.375}
              r={s * 0.055}
              stroke={config.accessoryColor}
              strokeWidth={s * 0.018}
              fill="none"
            />
            <circle
              cx={s * 0.58}
              cy={s * 0.375}
              r={s * 0.055}
              stroke={config.accessoryColor}
              strokeWidth={s * 0.018}
              fill="none"
            />
            {/* Bridge */}
            <line
              x1={s * 0.475}
              y1={s * 0.375}
              x2={s * 0.525}
              y2={s * 0.375}
              stroke={config.accessoryColor}
              strokeWidth={s * 0.014}
              strokeLinecap="round"
            />
            {/* Temple arms */}
            <line
              x1={s * 0.365}
              y1={s * 0.37}
              x2={s * 0.31}
              y2={s * 0.365}
              stroke={config.accessoryColor}
              strokeWidth={s * 0.012}
              strokeLinecap="round"
            />
            <line
              x1={s * 0.635}
              y1={s * 0.37}
              x2={s * 0.69}
              y2={s * 0.365}
              stroke={config.accessoryColor}
              strokeWidth={s * 0.012}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Beard */}
        {config.hasBeard && !isSilhouette && (
          <g>
            <ellipse
              cx={cx}
              cy={s * 0.49}
              rx={s * 0.13}
              ry={s * 0.08}
              fill={hairFill}
              opacity={0.6}
            />
            {/* Chin detail */}
            <ellipse
              cx={cx}
              cy={s * 0.53}
              rx={s * 0.08}
              ry={s * 0.04}
              fill={hairFill}
              opacity={0.45}
            />
          </g>
        )}

        {/* Earrings */}
        {config.earringsColor && !isSilhouette && (
          <>
            <circle
              cx={s * 0.295}
              cy={s * 0.42}
              r={s * 0.018}
              fill={config.earringsColor}
            />
            <circle
              cx={s * 0.295}
              cy={s * 0.42}
              r={s * 0.008}
              fill="#FFFFFF"
              opacity={0.4}
            />
            <circle
              cx={s * 0.705}
              cy={s * 0.42}
              r={s * 0.018}
              fill={config.earringsColor}
            />
            <circle
              cx={s * 0.705}
              cy={s * 0.42}
              r={s * 0.008}
              fill="#FFFFFF"
              opacity={0.4}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
