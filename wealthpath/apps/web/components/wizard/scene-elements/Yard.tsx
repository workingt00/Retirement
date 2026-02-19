"use client";

import { motion, AnimatePresence } from "framer-motion";

interface YardProps {
  x: number;       // center x of the yard area (same as house x)
  y: number;       // ground level
  tier: number;    // 1-5, which tier to show
  width: number;   // available width for the yard
}

const springTransition = { type: "spring" as const, stiffness: 80, damping: 14 };

function stagger(base: number, i: number) {
  return { ...springTransition, delay: base + i * 0.08 };
}

/* ─── Tier 1: Poor / Rundown ─── */
function TierRundown({ x, y, width }: { x: number; y: number; width: number }) {
  const w = width * 0.25;
  return (
    <g>
      {/* Bare dirt patch */}
      <motion.ellipse
        cx={x}
        cy={y + 4}
        rx={w * 0.6}
        ry={8}
        fill="#8B6914"
        opacity={0.5}
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: 0.5, scaleX: 1 }}
        transition={stagger(0.1, 0)}
      />

      {/* Broken fence post - upright */}
      <motion.rect
        x={x - w * 0.4}
        y={y - 18}
        width={3}
        height={18}
        fill="#6B4E20"
        rx={0.5}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.15, 1)}
      />

      {/* Broken fence post - tilted */}
      <motion.rect
        x={x - w * 0.15}
        y={y - 14}
        width={3}
        height={16}
        fill="#7C5B28"
        rx={0.5}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={stagger(0.15, 2)}
        style={{ transformOrigin: `${x - w * 0.15 + 1.5}px ${y}px` }}
        transform={`rotate(15, ${x - w * 0.15 + 1.5}, ${y})`}
      />

      {/* Broken fence rail fragment */}
      <motion.rect
        x={x - w * 0.42}
        y={y - 10}
        width={w * 0.22}
        height={2}
        fill="#6B4E20"
        opacity={0.7}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={stagger(0.2, 2)}
      />

      {/* Tumbleweed */}
      <motion.circle
        cx={x + w * 0.3}
        cy={y - 5}
        r={6}
        fill="none"
        stroke="#A0845C"
        strokeWidth={1.5}
        opacity={0.7}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.7, x: 0 }}
        transition={stagger(0.3, 3)}
      />
      <motion.circle
        cx={x + w * 0.3}
        cy={y - 5}
        r={3.5}
        fill="none"
        stroke="#8B7347"
        strokeWidth={1}
        opacity={0.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={stagger(0.35, 3)}
      />

      {/* Dead tree stump */}
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.2, 4)}
      >
        <rect x={x + w * 0.1} y={y - 14} width={6} height={14} fill="#5C4015" rx={1} />
        {/* Tiny dead branches */}
        <line x1={x + w * 0.1 + 6} y1={y - 12} x2={x + w * 0.1 + 12} y2={y - 16} stroke="#5C4015" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={x + w * 0.1} y1={y - 13} x2={x + w * 0.1 - 5} y2={y - 18} stroke="#5C4015" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={x + w * 0.1 + 3} y1={y - 14} x2={x + w * 0.1 + 5} y2={y - 20} stroke="#5C4015" strokeWidth={1} strokeLinecap="round" />
      </motion.g>

      {/* Scattered pebbles */}
      {[
        { cx: x - w * 0.25, cy: y - 1, r: 1.5 },
        { cx: x + w * 0.2, cy: y + 1, r: 1 },
        { cx: x + w * 0.05, cy: y + 3, r: 1.2 },
      ].map((p, i) => (
        <motion.circle
          key={`pebble-${i}`}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill="#9E8E76"
          opacity={0.4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={stagger(0.4, i)}
        />
      ))}
    </g>
  );
}

/* ─── Tier 2: Basic ─── */
function TierBasic({ x, y, width }: { x: number; y: number; width: number }) {
  const w = width * 0.35;
  return (
    <g>
      {/* Small grass patch */}
      <motion.ellipse
        cx={x}
        cy={y + 3}
        rx={w * 0.5}
        ry={7}
        fill="#4ADE80"
        opacity={0.35}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.35, scaleX: 1 }}
        transition={stagger(0.1, 0)}
      />

      {/* Small bush - two shades */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={stagger(0.2, 1)}
      >
        <ellipse cx={x - w * 0.25} cy={y - 6} rx={10} ry={7} fill="#22C55E" opacity={0.8} />
        <ellipse cx={x - w * 0.25 + 4} cy={y - 8} rx={7} ry={5} fill="#4ADE80" opacity={0.7} />
      </motion.g>

      {/* Simple mailbox */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.25, 2)}
      >
        {/* Post */}
        <rect x={x + w * 0.3} y={y - 28} width={2.5} height={28} fill="#78716C" rx={0.5} />
        {/* Box */}
        <rect x={x + w * 0.3 - 5} y={y - 32} width={13} height={8} fill="#6B7280" rx={1.5} />
        {/* Flag */}
        <rect x={x + w * 0.3 + 8} y={y - 32} width={2} height={6} fill="#EF4444" />
        <polygon
          points={`${x + w * 0.3 + 10},${y - 32} ${x + w * 0.3 + 16},${y - 30} ${x + w * 0.3 + 10},${y - 28}`}
          fill="#EF4444"
        />
      </motion.g>

      {/* A few sparse grass blades */}
      {[
        { bx: x + w * 0.1, by: y },
        { bx: x - w * 0.1, by: y - 1 },
        { bx: x + w * 0.25, by: y + 1 },
      ].map((g, i) => (
        <motion.line
          key={`blade-${i}`}
          x1={g.bx}
          y1={g.by}
          x2={g.bx + (i % 2 === 0 ? 2 : -2)}
          y2={g.by - 8}
          stroke="#4ADE80"
          strokeWidth={1.2}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={stagger(0.3, i)}
        />
      ))}
    </g>
  );
}

/* ─── Tier 3: Normal / Well-maintained ─── */
function TierNormal({ x, y, width }: { x: number; y: number; width: number }) {
  const w = width * 0.36;
  return (
    <g>
      {/* Green lawn */}
      <motion.ellipse
        cx={x}
        cy={y + 4}
        rx={w * 0.8}
        ry={10}
        fill="#22C55E"
        opacity={0.35}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.35, scaleX: 1 }}
        transition={stagger(0.1, 0)}
      />

      {/* White picket fence */}
      <motion.g
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.15, 1)}
      >
        {/* Rail */}
        <rect x={x - w * 0.7} y={y - 14} width={w * 1.4} height={2} fill="#F5F5F4" rx={0.5} />
        <rect x={x - w * 0.7} y={y - 6} width={w * 1.4} height={2} fill="#F5F5F4" rx={0.5} />
        {/* Pickets */}
        {Array.from({ length: 9 }, (_, i) => {
          const px = x - w * 0.65 + i * (w * 1.3 / 8);
          return (
            <g key={`picket-${i}`}>
              <rect x={px} y={y - 18} width={3} height={18} fill="#FAFAF9" rx={0.5} />
              {/* Pointed top */}
              <polygon points={`${px},${y - 18} ${px + 1.5},${y - 21} ${px + 3},${y - 18}`} fill="#FAFAF9" />
            </g>
          );
        })}
      </motion.g>

      {/* Trees (2-3 medium) */}
      {[
        { tx: x - w * 0.55, h: 35, canopy: 14, green: "#16A34A" },
        { tx: x + w * 0.45, h: 40, canopy: 16, green: "#15803D" },
        { tx: x + w * 0.05, h: 30, canopy: 12, green: "#22C55E" },
      ].map((t, i) => (
        <motion.g
          key={`tree-${i}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(0.2, i + 2)}
        >
          {/* Trunk */}
          <rect x={t.tx - 2.5} y={y - t.h} width={5} height={t.h - t.canopy * 0.5} fill="#7C5B28" rx={1} />
          {/* Canopy */}
          <circle cx={t.tx} cy={y - t.h + 2} r={t.canopy} fill={t.green} opacity={0.85} />
          <circle cx={t.tx + 4} cy={y - t.h + 5} r={t.canopy * 0.7} fill={t.green} opacity={0.6} />
        </motion.g>
      ))}

      {/* Garden path (small gray stepping stones) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.rect
          key={`path-${i}`}
          x={x - 4 + (i % 2 === 0 ? -1 : 1)}
          y={y + 6 + i * 8}
          width={8}
          height={5}
          rx={2}
          fill="#9CA3AF"
          opacity={0.6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={stagger(0.3, i)}
        />
      ))}

      {/* Small flower dots */}
      {[
        { cx: x - w * 0.3, cy: y - 3, color: "#EC4899" },
        { cx: x - w * 0.25, cy: y - 5, color: "#FBBF24" },
        { cx: x - w * 0.35, cy: y - 2, color: "#A855F7" },
        { cx: x + w * 0.35, cy: y - 4, color: "#EF4444" },
        { cx: x + w * 0.3, cy: y - 2, color: "#F472B6" },
      ].map((f, i) => (
        <motion.circle
          key={`flower-${i}`}
          cx={f.cx}
          cy={f.cy}
          r={2.5}
          fill={f.color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={stagger(0.4, i)}
        />
      ))}
    </g>
  );
}

/* ─── Tier 4: Nice / Wealthy ─── */
function TierWealthy({ x, y, width }: { x: number; y: number; width: number }) {
  const w = width * 0.396;
  return (
    <g>
      {/* Lush deep green lawn */}
      <motion.ellipse
        cx={x}
        cy={y + 5}
        rx={w * 0.9}
        ry={12}
        fill="#15803D"
        opacity={0.35}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.35, scaleX: 1 }}
        transition={stagger(0.1, 0)}
      />

      {/* Decorative stone wall */}
      <motion.g
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.12, 1)}
      >
        {Array.from({ length: 14 }, (_, i) => {
          const sx = x - w * 0.75 + i * (w * 1.5 / 13);
          const h = 10 + (i % 3 === 0 ? 2 : 0);
          return (
            <g key={`stone-${i}`}>
              <rect x={sx} y={y - h} width={w * 1.5 / 13 - 1.5} height={h} fill="#78716C" rx={1} />
              <rect x={sx + 1} y={y - h + 1} width={w * 1.5 / 13 - 3.5} height={h - 2} fill="#A8A29E" rx={0.5} opacity={0.3} />
            </g>
          );
        })}
        {/* Cap stones */}
        <rect x={x - w * 0.75} y={y - 13} width={w * 1.5} height={2.5} fill="#9CA3AF" rx={1} />
      </motion.g>

      {/* Large trees of different types */}
      {[
        { tx: x - w * 0.65, h: 50, canopy: 18, green: "#166534" },
        { tx: x - w * 0.3, h: 42, canopy: 15, green: "#15803D" },
        { tx: x + w * 0.15, h: 55, canopy: 20, green: "#14532D" },
        { tx: x + w * 0.45, h: 45, canopy: 17, green: "#16A34A" },
        { tx: x + w * 0.7, h: 38, canopy: 14, green: "#22C55E" },
      ].map((t, i) => (
        <motion.g
          key={`tree-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(0.15, i + 2)}
        >
          <rect x={t.tx - 3} y={y - t.h} width={6} height={t.h - t.canopy * 0.4} fill="#6B4E20" rx={1.5} />
          <circle cx={t.tx} cy={y - t.h + 3} r={t.canopy} fill={t.green} opacity={0.85} />
          <circle cx={t.tx + 5} cy={y - t.h + 7} r={t.canopy * 0.75} fill={t.green} opacity={0.65} />
          <circle cx={t.tx - 4} cy={y - t.h + 6} r={t.canopy * 0.6} fill={t.green} opacity={0.55} />
        </motion.g>
      ))}

      {/* Flower garden patches */}
      {[
        { cx: x - w * 0.45, cy: y - 4, colors: ["#EC4899", "#F472B6", "#FB7185", "#FDA4AF"] },
        { cx: x + w * 0.5, cy: y - 3, colors: ["#A855F7", "#C084FC", "#D8B4FE", "#8B5CF6"] },
      ].map((patch, pi) => (
        <motion.g
          key={`patch-${pi}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={stagger(0.3, pi + 7)}
        >
          {/* Ground cover for flower bed */}
          <ellipse cx={patch.cx} cy={patch.cy + 2} rx={14} ry={5} fill="#166534" opacity={0.3} />
          {patch.colors.map((c, fi) => (
            <circle
              key={`f-${pi}-${fi}`}
              cx={patch.cx + (fi - 1.5) * 5}
              cy={patch.cy - (fi % 2) * 3}
              r={2.5}
              fill={c}
              opacity={0.85}
            />
          ))}
          {/* Tiny green leaf accents */}
          {patch.colors.map((_, fi) => (
            <circle
              key={`leaf-${pi}-${fi}`}
              cx={patch.cx + (fi - 1.5) * 5 + 1.5}
              cy={patch.cy - (fi % 2) * 3 + 2}
              r={1.5}
              fill="#22C55E"
              opacity={0.5}
            />
          ))}
        </motion.g>
      ))}

      {/* Garden bench */}
      <motion.g
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.35, 9)}
      >
        {/* Seat */}
        <rect x={x + w * 0.2} y={y - 12} width={22} height={3} fill="#92400E" rx={1} />
        {/* Back */}
        <rect x={x + w * 0.2} y={y - 22} width={22} height={2.5} fill="#92400E" rx={1} />
        {/* Legs */}
        <rect x={x + w * 0.2 + 2} y={y - 12} width={2} height={12} fill="#78350F" rx={0.5} />
        <rect x={x + w * 0.2 + 18} y={y - 12} width={2} height={12} fill="#78350F" rx={0.5} />
        {/* Back supports */}
        <rect x={x + w * 0.2 + 2} y={y - 22} width={2} height={10} fill="#78350F" rx={0.5} />
        <rect x={x + w * 0.2 + 18} y={y - 22} width={2} height={10} fill="#78350F" rx={0.5} />
        {/* Back slats */}
        <rect x={x + w * 0.2 + 6} y={y - 21} width={1.5} height={8.5} fill="#A0522D" rx={0.3} />
        <rect x={x + w * 0.2 + 10} y={y - 21} width={1.5} height={8.5} fill="#A0522D" rx={0.3} />
        <rect x={x + w * 0.2 + 14} y={y - 21} width={1.5} height={8.5} fill="#A0522D" rx={0.3} />
      </motion.g>

      {/* Garden path with lights */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.g
          key={`pathlight-${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={stagger(0.25, i)}
        >
          {/* Stone */}
          <rect
            x={x - 5 + (i % 2 === 0 ? -2 : 2)}
            y={y + 4 + i * 8}
            width={10}
            height={5}
            rx={2.5}
            fill="#9CA3AF"
            opacity={0.55}
          />
          {/* Garden light */}
          <circle
            cx={x - 12 + (i % 2 === 0 ? -2 : 2)}
            cy={y + 6 + i * 8}
            r={2}
            fill="#FDE047"
            opacity={0.7}
          />
          <rect
            x={x - 12.5 + (i % 2 === 0 ? -2 : 2)}
            y={y + 8 + i * 8}
            width={1}
            height={4}
            fill="#78716C"
          />
        </motion.g>
      ))}

      {/* Birdbath */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.4, 10)}
      >
        {/* Base */}
        <rect x={x - w * 0.55} y={y - 5} width={8} height={5} fill="#9CA3AF" rx={1} />
        {/* Pedestal */}
        <rect x={x - w * 0.55 + 2} y={y - 20} width={4} height={15} fill="#A8A29E" rx={1} />
        {/* Bowl */}
        <ellipse cx={x - w * 0.55 + 4} cy={y - 20} rx={9} ry={3.5} fill="#D6D3D1" />
        <ellipse cx={x - w * 0.55 + 4} cy={y - 20} rx={7} ry={2.5} fill="#93C5FD" opacity={0.5} />
      </motion.g>
    </g>
  );
}

/* ─── Tier 5: Mansion / Luxury Estate ─── */
function TierLuxury({ x, y, width }: { x: number; y: number; width: number }) {
  const w = width * 0.455;
  // House is at x+15 and spans roughly x-60 to x+90 at scale 1.35
  // Keep yard elements clear of that zone
  const farLeft = x - w * 0.85;
  const farRight = x + w * 0.9;

  return (
    <g>
      {/* Expansive manicured lawn */}
      <motion.ellipse
        cx={x}
        cy={y + 6}
        rx={w * 0.95}
        ry={14}
        fill="#15803D"
        opacity={0.3}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.3, scaleX: 1 }}
        transition={stagger(0.1, 0)}
      />
      <motion.ellipse
        cx={x}
        cy={y + 3}
        rx={w * 0.85}
        ry={10}
        fill="#166534"
        opacity={0.2}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.2, scaleX: 1 }}
        transition={stagger(0.12, 0)}
      />

      {/* Wrought-iron fence — far background */}
      <motion.g
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.12, 1)}
      >
        <rect x={farLeft} y={y - 20} width={farRight - farLeft} height={1.5} fill="#374151" rx={0.5} />
        <rect x={farLeft} y={y - 5} width={farRight - farLeft} height={1.5} fill="#374151" rx={0.5} />
        {Array.from({ length: 16 }, (_, i) => {
          const fx = farLeft + 4 + i * ((farRight - farLeft - 8) / 15);
          return (
            <g key={`fence-${i}`}>
              <rect x={fx} y={y - 20} width={1.5} height={16.5} fill="#4B5563" />
              <polygon
                points={`${fx - 0.5},${y - 20} ${fx + 0.75},${y - 24} ${fx + 2},${y - 20}`}
                fill="#4B5563"
              />
            </g>
          );
        })}
      </motion.g>

      {/* Ornamental trees — far left & far right, behind house */}
      {[
        { tx: farLeft + 10, h: 58, type: "round" as const, green: "#14532D" },
        { tx: farLeft + 40, h: 52, type: "cypress" as const, green: "#166534" },
        { tx: farLeft + 65, h: 46, type: "round" as const, green: "#15803D" },
        { tx: farRight - 60, h: 50, type: "cypress" as const, green: "#166534" },
        { tx: farRight - 35, h: 55, type: "round" as const, green: "#14532D" },
        { tx: farRight - 10, h: 48, type: "cypress" as const, green: "#15803D" },
      ].map((t, i) => (
        <motion.g
          key={`tree-${i}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(0.15, i + 3)}
        >
          <rect x={t.tx - 2.5} y={y - t.h + 10} width={5} height={t.h - 10} fill="#5C4015" rx={1.5} />
          {t.type === "cypress" ? (
            <ellipse cx={t.tx} cy={y - t.h - 5} rx={6} ry={20} fill={t.green} opacity={0.85} />
          ) : (
            <>
              <circle cx={t.tx} cy={y - t.h + 5} r={14} fill={t.green} opacity={0.85} />
              <circle cx={t.tx + 5} cy={y - t.h + 8} r={10} fill={t.green} opacity={0.6} />
              <circle cx={t.tx - 4} cy={y - t.h + 7} r={9} fill={t.green} opacity={0.55} />
            </>
          )}
        </motion.g>
      ))}

      {/* Topiary bushes — flanking the house area */}
      {[
        { bx: x - 70, by: y - 8, r: 7 },
        { bx: x - 85, by: y - 6, r: 5.5 },
        { bx: x + 100, by: y - 8, r: 7 },
        { bx: x + 115, by: y - 6, r: 5.5 },
      ].map((b, i) => (
        <motion.g
          key={`topiary-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={stagger(0.3, i + 10)}
        >
          <rect x={b.bx - 1.5} y={b.by} width={3} height={b.r} fill="#5C4015" rx={0.5} />
          <circle cx={b.bx} cy={b.by - b.r * 0.3} r={b.r} fill="#16A34A" opacity={0.9} />
          <circle cx={b.bx + 2} cy={b.by - b.r * 0.5} r={b.r * 0.6} fill="#22C55E" opacity={0.4} />
        </motion.g>
      ))}

      {/* Swimming pool — far right, clear of house */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={stagger(0.35, 14)}
      >
        {/* Pool border */}
        <rect x={x + 130} y={y - 15} width={150} height={41} rx={12} fill="#E5E7EB" />
        {/* Pool water */}
        <rect x={x + 134} y={y - 12} width={142} height={34} rx={10} fill="#60A5FA" opacity={0.7} />
        {/* Shimmer lines */}
        <line x1={x + 150} y1={y - 1} x2={x + 240} y2={y - 1} stroke="#93C5FD" strokeWidth={1.5} opacity={0.6} />
        <line x1={x + 160} y1={y + 6} x2={x + 250} y2={y + 6} stroke="#93C5FD" strokeWidth={1.2} opacity={0.5} />
        <line x1={x + 145} y1={y + 13} x2={x + 230} y2={y + 13} stroke="#93C5FD" strokeWidth={1} opacity={0.4} />
      </motion.g>

      {/* Rose garden — far left, clear of house */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={stagger(0.4, 15)}
      >
        <ellipse cx={x - 100} cy={y - 2} rx={16} ry={6} fill="#166534" opacity={0.3} />
        {[
          { cx: x - 108, cy: y - 5, r: 2.8, color: "#E11D48" },
          { cx: x - 103, cy: y - 3, r: 2.3, color: "#F43F5E" },
          { cx: x - 98, cy: y - 6, r: 2.8, color: "#BE123C" },
          { cx: x - 101, cy: y - 1, r: 1.8, color: "#FB7185" },
          { cx: x - 106, cy: y - 7, r: 2.3, color: "#E11D48" },
          { cx: x - 95, cy: y - 3, r: 1.8, color: "#FDA4AF" },
          { cx: x - 110, cy: y - 2, r: 2.3, color: "#F43F5E" },
        ].map((r, i) => (
          <circle key={`rose-${i}`} cx={r.cx} cy={r.cy} r={r.r} fill={r.color} opacity={0.85} />
        ))}
        {[
          { cx: x - 107, cy: y - 3 },
          { cx: x - 97, cy: y - 4 },
          { cx: x - 102, cy: y },
        ].map((l, i) => (
          <ellipse key={`leaf-${i}`} cx={l.cx} cy={l.cy} rx={2.5} ry={1.2} fill="#22C55E" opacity={0.5} transform={`rotate(${-20 + i * 30}, ${l.cx}, ${l.cy})`} />
        ))}
      </motion.g>

      {/* Stone path — in front of house, leading down */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={stagger(0.2, 2)}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={`drive-${i}`}
            x={x + 8 + (i % 2 === 0 ? -1 : 1)}
            y={y + 5 + i * 7}
            width={16}
            height={5}
            rx={2.5}
            fill="#9CA3AF"
            opacity={0.45}
          />
        ))}
      </motion.g>

      {/* Gazebo — to the right of the pool */}
      <motion.g
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.5, 17)}
      >
        {/* Floor */}
        <ellipse cx={x + 350} cy={y - 2} rx={14} ry={3.5} fill="#D6D3D1" opacity={0.6} />
        {/* Pillars */}
        <rect x={x + 338} y={y - 26} width={1.8} height={24} fill="#E7E5E4" rx={0.5} />
        <rect x={x + 361} y={y - 26} width={1.8} height={24} fill="#E7E5E4" rx={0.5} />
        <rect x={x + 349} y={y - 26} width={1.8} height={24} fill="#E7E5E4" rx={0.5} />
        {/* Roof */}
        <polygon
          points={`${x + 335},${y - 26} ${x + 350},${y - 35} ${x + 365},${y - 26}`}
          fill="#78716C"
          opacity={0.8}
        />
        {/* Roof tip ornament */}
        <circle cx={x + 350} cy={y - 36} r={1.8} fill="#D4AF37" />
      </motion.g>

      {/* Fountain — 200px left of the flowers */}
      <motion.g
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.3, 16)}
      >
        {/* Base pool */}
        <ellipse cx={x - 340} cy={y - 4} rx={12} ry={4} fill="#D6D3D1" />
        <ellipse cx={x - 340} cy={y - 4} rx={10} ry={3} fill="#93C5FD" opacity={0.5} />
        {/* Pedestal */}
        <rect x={x - 342.5} y={y - 16} width={5} height={12} fill="#A8A29E" rx={1} />
        {/* Upper basin */}
        <ellipse cx={x - 340} cy={y - 16} rx={8} ry={3} fill="#D6D3D1" />
        <ellipse cx={x - 340} cy={y - 16} rx={6} ry={2} fill="#93C5FD" opacity={0.4} />
        {/* Top spout */}
        <rect x={x - 341.5} y={y - 23} width={3} height={7} fill="#A8A29E" rx={1} />
        <circle cx={x - 340} cy={y - 24} r={2} fill="#D6D3D1" />

        {/* Animated water droplets */}
        {[
          { dx: -5, delay: 0 },
          { dx: -2, delay: 0.3 },
          { dx: 0, delay: 0.15 },
          { dx: 2, delay: 0.45 },
          { dx: 5, delay: 0.6 },
        ].map((drop, i) => (
          <motion.circle
            key={`water-${i}`}
            cx={x - 340 + drop.dx}
            r={1.2}
            fill="#60A5FA"
            opacity={0.7}
            animate={{
              cy: [y - 24, y - 28, y - 18],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: drop.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Water cascade */}
        {[
          { dx: -6, delay: 0.2 },
          { dx: -3, delay: 0.5 },
          { dx: 3, delay: 0.35 },
          { dx: 6, delay: 0.7 },
        ].map((drop, i) => (
          <motion.circle
            key={`cascade-${i}`}
            cx={x - 340 + drop.dx}
            r={0.8}
            fill="#93C5FD"
            animate={{
              cy: [y - 15, y - 7],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: drop.delay,
              ease: "easeIn",
            }}
          />
        ))}
      </motion.g>

      {/* Stone pillars at entrance — flanking the path */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stagger(0.15, 2)}
      >
        <rect x={x - 2} y={y - 30} width={8} height={30} fill="#78716C" rx={1} />
        <rect x={x - 4} y={y - 33} width={12} height={4} fill="#9CA3AF" rx={1} />
        <circle cx={x + 2} cy={y - 35} r={2.5} fill="#D6D3D1" />
        <rect x={x + 24} y={y - 30} width={8} height={30} fill="#78716C" rx={1} />
        <rect x={x + 22} y={y - 33} width={12} height={4} fill="#9CA3AF" rx={1} />
        <circle cx={x + 28} cy={y - 35} r={2.5} fill="#D6D3D1" />
      </motion.g>

      {/* Garden lights along fence */}
      {Array.from({ length: 8 }, (_, i) => {
        const lx = farLeft + 10 + i * ((farRight - farLeft - 20) / 7);
        return (
          <motion.g
            key={`fencelight-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={stagger(0.5, i)}
          >
            <rect x={lx} y={y - 3} width={1.2} height={5} fill="#78716C" />
            <motion.circle
              cx={lx + 0.6}
              cy={y - 4}
              r={2}
              fill="#FDE047"
              animate={{ opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          </motion.g>
        );
      })}
    </g>
  );
}

/* ─── Main Yard Component ─── */
export default function Yard({ x, y, tier, width }: YardProps) {
  const clampedTier = Math.max(1, Math.min(5, Math.round(tier)));

  const TierComponent = {
    1: TierRundown,
    2: TierBasic,
    3: TierNormal,
    4: TierWealthy,
    5: TierLuxury,
  }[clampedTier] as React.FC<{ x: number; y: number; width: number }>;

  return (
    <AnimatePresence mode="wait">
      <motion.g
        key={clampedTier}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={springTransition}
      >
        <TierComponent x={x} y={y} width={width} />
      </motion.g>
    </AnimatePresence>
  );
}
