"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GardenProps {
  x: number;
  y: number;
  bloomLevel: number; // 0-1
}

function getTier(level: number): number {
  if (level < 0.15) return 1;
  if (level < 0.35) return 2;
  if (level < 0.55) return 3;
  if (level < 0.75) return 4;
  return 5;
}

/* ─── Reusable sub-components ─── */

function Flower({
  cx,
  cy,
  color,
  delay,
  size,
  petalCount = 6,
}: {
  cx: number;
  cy: number;
  color: string;
  delay: number;
  size: number;
  petalCount?: number;
}) {
  const angles = Array.from({ length: petalCount }, (_, i) => (360 / petalCount) * i);
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14, delay }}
    >
      {/* Stem */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy + size * 1.8}
        stroke="#16A34A"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Small leaf on stem */}
      <ellipse
        cx={cx + size * 0.4}
        cy={cy + size * 1.1}
        rx={size * 0.3}
        ry={size * 0.12}
        fill="#22C55E"
        transform={`rotate(-25, ${cx + size * 0.4}, ${cy + size * 1.1})`}
      />
      {/* Petals */}
      {angles.map((angle) => (
        <circle
          key={angle}
          cx={cx + Math.cos((angle * Math.PI) / 180) * size * 0.38}
          cy={cy + Math.sin((angle * Math.PI) / 180) * size * 0.38}
          r={size * 0.28}
          fill={color}
          opacity={0.85}
        />
      ))}
      {/* Center */}
      <circle cx={cx} cy={cy} r={size * 0.18} fill="#FBBF24" />
    </motion.g>
  );
}

function DeadStick({
  x,
  y,
  angle,
  height,
  delay,
}: {
  x: number;
  y: number;
  angle: number;
  height: number;
  delay: number;
}) {
  const topX = x + Math.sin((angle * Math.PI) / 180) * height;
  const topY = y - height;
  return (
    <motion.line
      x1={x}
      y1={y}
      x2={topX}
      y2={topY}
      stroke="#78350F"
      strokeWidth={1.5}
      strokeLinecap="round"
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: 0.7, pathLength: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay }}
    />
  );
}

function WiltedFlower({
  cx,
  cy,
  delay,
}: {
  cx: number;
  cy: number;
  delay: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Drooping stem — curves to the right */}
      <path
        d={`M ${cx} ${cy + 10} Q ${cx} ${cy + 2}, ${cx + 5} ${cy}`}
        stroke="#78350F"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
      {/* Drooping head */}
      <circle cx={cx + 5} cy={cy + 1} r={2} fill="#A16207" opacity={0.5} />
      <circle cx={cx + 6.5} cy={cy + 2.2} r={1.4} fill="#92400E" opacity={0.4} />
    </motion.g>
  );
}

function Butterfly({
  cx,
  cy,
  color,
  delay,
  speed = 4,
}: {
  cx: number;
  cy: number;
  color: string;
  delay: number;
  speed?: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        x: [0, 6, -4, 3, 0],
        y: [0, -5, -2, -7, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        opacity: { duration: 0.3, delay },
        x: { duration: speed, repeat: Infinity, ease: "easeInOut", delay },
        y: { duration: speed * 0.8, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      {/* Left wing */}
      <ellipse
        cx={cx - 2}
        cy={cy}
        rx={2.5}
        ry={1.8}
        fill={color}
        opacity={0.8}
        transform={`rotate(-20, ${cx - 2}, ${cy})`}
      />
      {/* Right wing */}
      <ellipse
        cx={cx + 2}
        cy={cy}
        rx={2.5}
        ry={1.8}
        fill={color}
        opacity={0.8}
        transform={`rotate(20, ${cx + 2}, ${cy})`}
      />
      {/* Body */}
      <line
        x1={cx}
        y1={cy - 1.5}
        x2={cx}
        y2={cy + 1.5}
        stroke="#1F2937"
        strokeWidth={0.6}
        strokeLinecap="round"
      />
    </motion.g>
  );
}

function Bush({
  cx,
  cy,
  width,
  height,
  flowerColor,
  delay,
}: {
  cx: number;
  cy: number;
  width: number;
  height: number;
  flowerColor: string;
  delay: number;
}) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 16, delay }}
    >
      {/* Bush body */}
      <ellipse cx={cx} cy={cy} rx={width / 2} ry={height / 2} fill="#15803D" />
      <ellipse cx={cx - width * 0.2} cy={cy - height * 0.15} rx={width * 0.35} ry={height * 0.35} fill="#16A34A" />
      <ellipse cx={cx + width * 0.2} cy={cy - height * 0.1} rx={width * 0.3} ry={height * 0.3} fill="#22C55E" opacity={0.7} />
      {/* Flower dots on bush */}
      <circle cx={cx - width * 0.15} cy={cy - height * 0.3} r={1.5} fill={flowerColor} />
      <circle cx={cx + width * 0.2} cy={cy - height * 0.2} r={1.3} fill={flowerColor} />
      <circle cx={cx} cy={cy - height * 0.35} r={1.2} fill={flowerColor} opacity={0.9} />
    </motion.g>
  );
}

/* ─── Tier Renderers ─── */

function Tier1({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      key="tier1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Dry cracked ground */}
      <ellipse cx={x} cy={y + 3} rx={22} ry={5} fill="#78350F" opacity={0.35} />
      <line x1={x - 8} y1={y + 2} x2={x + 5} y2={y + 4} stroke="#451A03" strokeWidth={0.7} opacity={0.5} />
      <line x1={x - 2} y1={y + 1} x2={x + 1} y2={y + 5} stroke="#451A03" strokeWidth={0.5} opacity={0.4} />

      {/* Dead sticks */}
      <DeadStick x={x - 10} y={y} angle={-12} height={10} delay={0.1} />
      <DeadStick x={x + 5} y={y} angle={8} height={8} delay={0.2} />
      <DeadStick x={x + 14} y={y} angle={-5} height={6} delay={0.3} />

      {/* Wilted flower */}
      <WiltedFlower cx={x - 3} cy={y - 4} delay={0.4} />
    </motion.g>
  );
}

function Tier2({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      key="tier2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Patchy grass */}
      <ellipse cx={x - 5} cy={y + 3} rx={12} ry={4} fill="#4ADE80" opacity={0.25} />
      <ellipse cx={x + 10} cy={y + 4} rx={8} ry={3} fill="#4ADE80" opacity={0.2} />

      {/* Scraggly plant 1 */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
      >
        <line x1={x - 8} y1={y} x2={x - 8} y2={y - 8} stroke="#22C55E" strokeWidth={1.2} strokeLinecap="round" />
        <ellipse cx={x - 10} cy={y - 5} rx={2.5} ry={1} fill="#22C55E" transform={`rotate(-30, ${x - 10}, ${y - 5})`} />
        <ellipse cx={x - 6} cy={y - 7} rx={2} ry={0.8} fill="#16A34A" transform={`rotate(25, ${x - 6}, ${y - 7})`} />
      </motion.g>

      {/* Scraggly plant 2 */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, delay: 0.3 }}
      >
        <line x1={x + 12} y1={y} x2={x + 12} y2={y - 6} stroke="#16A34A" strokeWidth={1} strokeLinecap="round" />
        <ellipse cx={x + 14} cy={y - 4} rx={2} ry={0.8} fill="#22C55E" transform={`rotate(-20, ${x + 14}, ${y - 4})`} />
      </motion.g>

      {/* Single small flower */}
      <Flower cx={x + 2} cy={y - 7} color="#EC4899" delay={0.45} size={3} petalCount={5} />
    </motion.g>
  );
}

function Tier3({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      key="tier3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Nice ground cover */}
      <ellipse cx={x} cy={y + 4} rx={28} ry={6} fill="#22C55E" opacity={0.3} />

      {/* Garden path edge — small stones */}
      {[-18, -10, -2, 6, 14].map((offset, i) => (
        <motion.rect
          key={offset}
          x={x + offset}
          y={y + 6}
          width={4}
          height={2.5}
          rx={1.2}
          fill="#9CA3AF"
          opacity={0.6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.1 + i * 0.05 }}
        />
      ))}

      {/* Veggie garden hint — green rectangles in a row */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
      >
        {[0, 5, 10].map((offset) => (
          <rect
            key={offset}
            x={x + 12 + offset}
            y={y - 3}
            width={3}
            height={4}
            rx={0.5}
            fill="#15803D"
            opacity={0.7}
          />
        ))}
        {/* Tiny tomato dots */}
        <circle cx={x + 13.5} cy={y - 4} r={1} fill="#EF4444" opacity={0.7} />
        <circle cx={x + 23.5} cy={y - 3.5} r={0.8} fill="#EF4444" opacity={0.6} />
      </motion.g>

      {/* Flowers — 4 varied */}
      <Flower cx={x - 16} cy={y - 10} color="#EC4899" delay={0.3} size={4.5} />
      <Flower cx={x - 6} cy={y - 12} color="#F59E0B" delay={0.4} size={4} petalCount={5} />
      <Flower cx={x + 4} cy={y - 9} color="#8B5CF6" delay={0.5} size={5} />
      <Flower cx={x - 12} cy={y - 7} color="#14B8A6" delay={0.6} size={3.5} petalCount={5} />
    </motion.g>
  );
}

function Tier4({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      key="tier4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Rich green ground cover */}
      <ellipse cx={x} cy={y + 4} rx={32} ry={7} fill="#16A34A" opacity={0.35} />
      <ellipse cx={x + 5} cy={y + 3} rx={26} ry={5} fill="#22C55E" opacity={0.25} />

      {/* Flowering bushes */}
      <Bush cx={x - 20} cy={y - 4} width={14} height={10} flowerColor="#EC4899" delay={0.15} />
      <Bush cx={x + 22} cy={y - 3} width={12} height={9} flowerColor="#F59E0B" delay={0.25} />

      {/* Trellis with climbing flowers */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.35 }}
      >
        {/* Vertical trellis post */}
        <line x1={x + 32} y1={y} x2={x + 32} y2={y - 22} stroke="#78350F" strokeWidth={1.5} strokeLinecap="round" />
        {/* Horizontal bars */}
        <line x1={x + 28} y1={y - 7} x2={x + 36} y2={y - 7} stroke="#78350F" strokeWidth={0.8} />
        <line x1={x + 28} y1={y - 14} x2={x + 36} y2={y - 14} stroke="#78350F" strokeWidth={0.8} />
        {/* Climbing vine */}
        <path
          d={`M ${x + 32} ${y} Q ${x + 34} ${y - 5}, ${x + 31} ${y - 10} Q ${x + 29} ${y - 15}, ${x + 33} ${y - 20}`}
          stroke="#16A34A"
          strokeWidth={1}
          fill="none"
        />
        {/* Flower dots on trellis */}
        <circle cx={x + 31} cy={y - 10} r={1.5} fill="#EC4899" />
        <circle cx={x + 33} cy={y - 16} r={1.3} fill="#EC4899" />
        <circle cx={x + 32} cy={y - 20} r={1.4} fill="#F472B6" />
      </motion.g>

      {/* Small water feature */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, delay: 0.45 }}
      >
        <ellipse cx={x + 8} cy={y + 1} rx={7} ry={3.5} fill="#38BDF8" opacity={0.6} />
        <ellipse cx={x + 8} cy={y} rx={5} ry={2.5} fill="#7DD3FC" opacity={0.4} />
        {/* Rock beside water */}
        <ellipse cx={x + 14} cy={y} rx={3} ry={2} fill="#6B7280" />
        <ellipse cx={x + 13} cy={y - 0.5} rx={2} ry={1.2} fill="#9CA3AF" opacity={0.6} />
      </motion.g>

      {/* Flowers — 6 varied sizes */}
      <Flower cx={x - 12} cy={y - 14} color="#EC4899" delay={0.3} size={5} />
      <Flower cx={x - 4} cy={y - 11} color="#F59E0B" delay={0.38} size={4.5} petalCount={5} />
      <Flower cx={x + 2} cy={y - 15} color="#8B5CF6" delay={0.46} size={5.5} />
      <Flower cx={x - 18} cy={y - 10} color="#14B8A6" delay={0.54} size={4} petalCount={5} />
      <Flower cx={x + 16} cy={y - 12} color="#F472B6" delay={0.62} size={4} />
      <Flower cx={x - 8} cy={y - 8} color="#FBBF24" delay={0.7} size={3.5} petalCount={7} />

      {/* Butterflies */}
      <Butterfly cx={x - 5} cy={y - 22} color="#A78BFA" delay={0.8} speed={5} />
    </motion.g>
  );
}

function Tier5({ x, y }: { x: number; y: number }) {
  return (
    <motion.g
      key="tier5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Lush ground cover */}
      <ellipse cx={x} cy={y + 5} rx={40} ry={8} fill="#15803D" opacity={0.3} />
      <ellipse cx={x + 3} cy={y + 3} rx={34} ry={6} fill="#22C55E" opacity={0.25} />
      <ellipse cx={x - 5} cy={y + 2} rx={20} ry={4} fill="#4ADE80" opacity={0.15} />

      {/* Stone garden path */}
      {[-24, -16, -8, 0, 8, 16, 24].map((offset, i) => (
        <motion.rect
          key={offset}
          x={x + offset - 2}
          y={y + 7}
          width={5}
          height={3}
          rx={1.5}
          fill="#9CA3AF"
          opacity={0.55}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 0.05 + i * 0.04 }}
        />
      ))}

      {/* Garden arch with climbing roses */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
      >
        {/* Arch posts */}
        <line x1={x - 30} y1={y} x2={x - 30} y2={y - 28} stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
        <line x1={x - 18} y1={y} x2={x - 18} y2={y - 28} stroke="#78350F" strokeWidth={2} strokeLinecap="round" />
        {/* Arch top */}
        <path
          d={`M ${x - 30} ${y - 28} Q ${x - 24} ${y - 36}, ${x - 18} ${y - 28}`}
          stroke="#78350F"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        {/* Climbing vine on arch */}
        <path
          d={`M ${x - 30} ${y - 5} Q ${x - 32} ${y - 15}, ${x - 29} ${y - 24} Q ${x - 26} ${y - 32}, ${x - 24} ${y - 34}`}
          stroke="#16A34A"
          strokeWidth={1.2}
          fill="none"
        />
        <path
          d={`M ${x - 18} ${y - 8} Q ${x - 16} ${y - 18}, ${x - 19} ${y - 26} Q ${x - 22} ${y - 33}, ${x - 24} ${y - 34}`}
          stroke="#16A34A"
          strokeWidth={1}
          fill="none"
        />
        {/* Rose dots on arch */}
        {[
          { cx: x - 30, cy: y - 10, r: 1.8 },
          { cx: x - 29, cy: y - 18, r: 1.5 },
          { cx: x - 28, cy: y - 24, r: 1.6 },
          { cx: x - 25, cy: y - 32, r: 1.4 },
          { cx: x - 23, cy: y - 35, r: 1.5 },
          { cx: x - 20, cy: y - 32, r: 1.3 },
          { cx: x - 18, cy: y - 25, r: 1.6 },
          { cx: x - 17, cy: y - 16, r: 1.5 },
        ].map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#EF4444" opacity={0.85} />
        ))}
      </motion.g>

      {/* Rose bushes */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 140, delay: 0.25 }}
      >
        {/* Bush shape */}
        <ellipse cx={x + 30} cy={y - 4} rx={8} ry={6} fill="#15803D" />
        <ellipse cx={x + 28} cy={y - 6} rx={6} ry={5} fill="#16A34A" />
        {/* Rose clusters */}
        <circle cx={x + 27} cy={y - 8} r={2} fill="#EF4444" />
        <circle cx={x + 30} cy={y - 9} r={1.8} fill="#DC2626" />
        <circle cx={x + 33} cy={y - 7} r={1.6} fill="#EF4444" />
        <circle cx={x + 29} cy={y - 5} r={1.5} fill="#F87171" />
        <circle cx={x + 32} cy={y - 4} r={1.3} fill="#DC2626" />
      </motion.g>

      {/* Koi pond */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 130, delay: 0.35 }}
      >
        {/* Pond border stones */}
        {[
          { cx: x + 6, cy: y - 1, rx: 2.5, ry: 1.5 },
          { cx: x + 11, cy: y - 2.5, rx: 2, ry: 1.3 },
          { cx: x + 15, cy: y - 0.5, rx: 2.2, ry: 1.4 },
          { cx: x + 3, cy: y + 1, rx: 2, ry: 1.2 },
          { cx: x + 17, cy: y + 2, rx: 2.3, ry: 1.3 },
        ].map((stone, i) => (
          <ellipse key={i} cx={stone.cx} cy={stone.cy} rx={stone.rx} ry={stone.ry} fill="#6B7280" opacity={0.7} />
        ))}
        {/* Pond water */}
        <ellipse cx={x + 10} cy={y + 1} rx={9} ry={4.5} fill="#0EA5E9" opacity={0.5} />
        <ellipse cx={x + 10} cy={y} rx={7} ry={3.5} fill="#38BDF8" opacity={0.4} />
        <ellipse cx={x + 9} cy={y - 0.5} rx={4} ry={2} fill="#7DD3FC" opacity={0.3} />
        {/* Koi fish — animated */}
        <motion.ellipse
          cx={x + 8}
          cy={y}
          rx={1.8}
          ry={0.8}
          fill="#F97316"
          opacity={0.85}
          animate={{ x: [0, 4, -2, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.ellipse
          cx={x + 13}
          cy={y + 1}
          rx={1.5}
          ry={0.7}
          fill="#FB923C"
          opacity={0.8}
          animate={{ x: [0, -3, 2, -1, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Lily pad */}
        <circle cx={x + 6} cy={y + 0.5} r={2} fill="#22C55E" opacity={0.5} />
        <line x1={x + 6} y1={y + 0.5} x2={x + 7.5} y2={y - 0.5} stroke="#0EA5E9" strokeWidth={0.6} opacity={0.4} />
        {/* Tiny lily flower */}
        <circle cx={x + 6} cy={y} r={0.8} fill="#FDE68A" opacity={0.7} />
      </motion.g>

      {/* Flowering bushes */}
      <Bush cx={x + 38} cy={y - 3} width={10} height={8} flowerColor="#A78BFA" delay={0.4} />

      {/* Hanging flower baskets */}
      <motion.g
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, delay: 0.45 }}
      >
        {/* Basket 1 */}
        <path
          d={`M ${x - 10} ${y - 30} Q ${x - 7} ${y - 34}, ${x - 4} ${y - 30}`}
          stroke="#78350F"
          strokeWidth={1}
          fill="none"
        />
        <ellipse cx={x - 7} cy={y - 28} rx={3.5} ry={2} fill="#92400E" opacity={0.8} />
        {/* Hanging flowers */}
        <circle cx={x - 8.5} cy={y - 29.5} r={1.5} fill="#EC4899" />
        <circle cx={x - 5.5} cy={y - 29} r={1.3} fill="#F472B6" />
        <circle cx={x - 7} cy={y - 30.5} r={1.2} fill="#EC4899" opacity={0.8} />
        {/* Trailing vine */}
        <path
          d={`M ${x - 9} ${y - 27} Q ${x - 10} ${y - 24}, ${x - 8} ${y - 22}`}
          stroke="#16A34A"
          strokeWidth={0.8}
          fill="none"
        />

        {/* Basket 2 */}
        <path
          d={`M ${x + 18} ${y - 32} Q ${x + 21} ${y - 36}, ${x + 24} ${y - 32}`}
          stroke="#78350F"
          strokeWidth={1}
          fill="none"
        />
        <ellipse cx={x + 21} cy={y - 30} rx={3.5} ry={2} fill="#92400E" opacity={0.8} />
        <circle cx={x + 19.5} cy={y - 31.5} r={1.4} fill="#F59E0B" />
        <circle cx={x + 22.5} cy={y - 31} r={1.2} fill="#FBBF24" />
        <circle cx={x + 21} cy={y - 32.5} r={1.3} fill="#F59E0B" opacity={0.8} />
        <path
          d={`M ${x + 19} ${y - 29} Q ${x + 18} ${y - 26}, ${x + 20} ${y - 24}`}
          stroke="#16A34A"
          strokeWidth={0.8}
          fill="none"
        />
      </motion.g>

      {/* Trellis with climbing flowers */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 130, delay: 0.5 }}
      >
        <line x1={x + 42} y1={y} x2={x + 42} y2={y - 24} stroke="#78350F" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={x + 38} y1={y - 8} x2={x + 46} y2={y - 8} stroke="#78350F" strokeWidth={0.8} />
        <line x1={x + 38} y1={y - 16} x2={x + 46} y2={y - 16} stroke="#78350F" strokeWidth={0.8} />
        <path
          d={`M ${x + 42} ${y} Q ${x + 44} ${y - 6}, ${x + 41} ${y - 12} Q ${x + 39} ${y - 18}, ${x + 43} ${y - 22}`}
          stroke="#16A34A"
          strokeWidth={1}
          fill="none"
        />
        <circle cx={x + 41} cy={y - 12} r={1.5} fill="#8B5CF6" />
        <circle cx={x + 43} cy={y - 18} r={1.3} fill="#A78BFA" />
        <circle cx={x + 42} cy={y - 22} r={1.4} fill="#8B5CF6" />
      </motion.g>

      {/* Flowers — 8+ gorgeous arrangement */}
      <Flower cx={x - 14} cy={y - 15} color="#EC4899" delay={0.3} size={5.5} />
      <Flower cx={x - 6} cy={y - 18} color="#F59E0B" delay={0.36} size={4.5} petalCount={5} />
      <Flower cx={x + 2} cy={y - 14} color="#8B5CF6" delay={0.42} size={5} />
      <Flower cx={x - 10} cy={y - 10} color="#14B8A6" delay={0.48} size={4} petalCount={5} />
      <Flower cx={x + 22} cy={y - 13} color="#F472B6" delay={0.54} size={4.5} />
      <Flower cx={x + 34} cy={y - 11} color="#FBBF24" delay={0.6} size={4} petalCount={7} />
      <Flower cx={x - 2} cy={y - 8} color="#A78BFA" delay={0.66} size={3.5} />
      <Flower cx={x + 14} cy={y - 16} color="#34D399" delay={0.72} size={5} petalCount={6} />

      {/* Multiple butterflies */}
      <Butterfly cx={x - 3} cy={y - 25} color="#A78BFA" delay={0.8} speed={5} />
      <Butterfly cx={x + 18} cy={y - 28} color="#F472B6" delay={1.0} speed={6} />
      <Butterfly cx={x + 35} cy={y - 20} color="#FBBF24" delay={1.2} speed={4.5} />
    </motion.g>
  );
}

/* ─── Main Component ─── */

export default function Garden({ x, y, bloomLevel }: GardenProps) {
  const tier = getTier(bloomLevel);

  return (
    <g>
      <AnimatePresence mode="wait">
        {tier === 1 && <Tier1 key="tier1" x={x} y={y} />}
        {tier === 2 && <Tier2 key="tier2" x={x} y={y} />}
        {tier === 3 && <Tier3 key="tier3" x={x} y={y} />}
        {tier === 4 && <Tier4 key="tier4" x={x} y={y} />}
        {tier === 5 && <Tier5 key="tier5" x={x} y={y} />}
      </AnimatePresence>
    </g>
  );
}
