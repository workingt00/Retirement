# AGENT 3: Charts, Visualizations & Marketing

> **Read AGENT_0_SHARED_TYPES.md first.**  
> **Dependencies:** Agent 1 types only (`YearResult`, `SimulationResult`, `SimulationSummary`)  
> **Can start in parallel with Agent 1** — build charts using mock data, wire to real engine later.  
> **Location:** `apps/web/components/charts/*`, `apps/web/app/(marketing)/*`

---

## Deliverables Checklist

```
[ ] Chart 1: Net Worth Trajectory (stacked area, Recharts)
[ ] Chart 2: Sensitivity Fan (3-line with confidence band)
[ ] Chart 3: Cash Flow Waterfall (bar chart, simplified + detailed variants)
[ ] Chart 4: Tax Bracket Visualizer (D3, interactive)
[ ] Chart 5: Account Composition Over Time (stacked bar)
[ ] Chart 6: Social Security Comparison (3-line cumulative)
[ ] AnimatedNumber component (count-up/down, spring easing)
[ ] Chart animation system (draw-in, transition on data change)
[ ] Mock data generator (for development without engine)
[ ] Landing page (/)
[ ] Pricing page (/pricing)
[ ] About page (/about)
[ ] Responsive: all charts work 375px-1440px
```

---

## Theme Support

Every chart accepts `theme: "horizon" | "velocity"` and adjusts colors. Use this mapping:

```typescript
const chartColors = {
  horizon: {
    taxDeferred: "#E8985E",
    taxFree: "#2D6A4F",
    other: "#6B8CAE",
    bear: "#DC3545",
    base: "#2D6A4F",
    bull: "#2D6A4F80",
    positive: "#2D6A4F",
    negative: "#DC3545",
    neutral: "#D4A843",
    background: "#FAF9F6",
    gridLines: "#E5E7EB",
    text: "#1A1A2E",
    textMuted: "#6B7280",
  },
  velocity: {
    taxDeferred: "#F59E0B",
    taxFree: "#10B981",
    other: "#3B82F6",
    bear: "#EF4444",
    base: "#3B82F6",
    bull: "#10B981",
    positive: "#10B981",
    negative: "#EF4444",
    neutral: "#F59E0B",
    background: "#0F172A",
    gridLines: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
  },
};
```

**Library:** Recharts for Charts 1, 2, 3, 5, 6. D3.js for Chart 4 (bracket visualizer). Framer Motion for animations.

**Performance:** All charts render in <200ms. Use `useMemo` for data transformations.

---

## Chart 1: Net Worth Trajectory

**Type:** Stacked area chart  
**File:** `components/charts/NetWorthChart.tsx`

```typescript
interface NetWorthChartProps {
  years: YearResult[];
  retirementAge: number;
  firstFailureAge: number | null;
  theme: "horizon" | "velocity";
  onYearClick?: (age: number) => void;
}
```

**X-axis:** Age (currentAge to 80)  
**Y-axis:** Dollar amount, formatted: `$0`, `$500K`, `$1M`, `$1.5M`

**Three stacked areas:**
| Area | Data | Field |
|------|------|-------|
| Tax-Deferred | Trad 401k + Trad IRA | `traditional401k + traditionalIRA` on YearResult |
| Tax-Free | Roth 401k + Roth IRA + Portfolio | `roth401k + rothIRA + privatePortfolio` |
| Other | 529 + Foreign Pension | `plan529 + foreignPension` |

**Annotations:**
- Vertical dashed line at `retirementAge` with label "Retire"
- If `firstFailureAge`: vertical red dashed line with label "⚠️ Shortfall"

**Hover tooltip:** Age, total NW, breakdown by 3 categories, status (OK/FAIL), cash flow

**Animation:** Areas fill left-to-right over 800ms on mount. Staggered: Tax-Deferred first, Tax-Free 200ms later, Other 400ms later. On data update: smooth 400ms transition.

---

## Chart 2: Sensitivity Fan

**Type:** Multi-line chart with shaded confidence band  
**File:** `components/charts/SensitivityFan.tsx`

```typescript
interface SensitivityFanProps {
  years: YearResult[];
  theme: "horizon" | "velocity";
}
```

**Three lines:**
| Line | Data | Style |
|------|------|-------|
| Bear | `years[].bearNetWorth` | Dashed, thin |
| Base | `years[].totalNetWorth` | Solid, thick (2px) |
| Bull | `years[].bullNetWorth` | Dashed, thin |

**Shaded region:** Fill between bear and bull with 10% opacity of base color.

**Hover:** "Base: $2.1M | Bear: $800K (-$1.3M) | Bull: $3.4M (+$1.3M)"

**Annotation:** If bear hits 0, mark with red dot + label "Bear failure: age X"

---

## Chart 3: Cash Flow Waterfall

**Type:** Waterfall bar chart for a single year  
**File:** `components/charts/WaterfallChart.tsx`

```typescript
interface WaterfallChartProps {
  year: YearResult;
  simplified?: boolean;  // true for Horizon mode
  theme: "horizon" | "velocity";
}
```

**Full mode (Velocity) — 10 bars:**
1. W2 Income (green ↑)
2. Other Income: W9 + otherIncome (green ↑)
3. Social Security (green ↑)
4. Withdrawals: portfolio sell + Roth + Trad (green ↑)
5. Federal Tax (red ↓, hanging)
6. State Tax (red ↓)
7. Housing (red ↓)
8. Living: groceries + bills + lifestyle + misc (red ↓)
9. Medical (red ↓)
10. **Net Cash Flow** (result: blue if positive, red if negative)

Running total connector lines between bars.

**Simplified mode (Horizon) — 4 bars:**
1. Total Income (green ↑)
2. Total Taxes (red ↓)
3. Total Expenses (red ↓)
4. **What's Left** (result bar)

---

## Chart 4: Tax Bracket Visualizer (D3)

**Type:** Custom interactive horizontal bracket ladder  
**File:** `components/charts/TaxBracketVisualizer.tsx`

```typescript
interface TaxBracketVisualizerProps {
  ordinaryIncome: number;
  rothConversion: number;
  filingStatus: "MFJ" | "SINGLE";
  onConversionChange: (amount: number) => void;
  theme: "horizon" | "velocity";
}
```

**Visual:** Horizontal stacked bar = the 7 federal brackets. Each segment labeled with rate. Filled portion = income consumed. A marker shows current position. Unfilled portion = room remaining.

**Interactive:** When Roth conversion slider moves:
- Filled portion animates to include conversion amount
- When crossing bracket boundary: new bracket lights up
- Text: "Converting $45K fills the 22% bracket. $10K room before 24%."

**Bracket colors (both themes):**
| Rate | Color |
|------|-------|
| 10% | `#86EFAC` (light green) |
| 12% | `#4ADE80` (green) |
| 22% | `#BEF264` (yellow-green) |
| 24% | `#FDE047` (yellow) |
| 32% | `#FB923C` (orange) |
| 35% | `#F97316` (dark orange) |
| 37% | `#EF4444` (red) |

---

## Chart 5: Account Composition Over Time

**Type:** Stacked bar chart  
**File:** `components/charts/AccountComposition.tsx`

```typescript
interface AccountCompositionProps {
  years: YearResult[];
  theme: "horizon" | "velocity";
}
```

**Data:** Filter `years[]` to ages 45, 50, 55, 60, 65, 70, 75, 80 (one bar per milestone)

**7 segments per bar:**
| Account | Horizon | Velocity |
|---------|---------|----------|
| Trad 401k | `#E8985E` | `#F59E0B` |
| Roth 401k | `#A3D9A5` | `#34D399` |
| Trad IRA | `#D4A843` | `#FBBF24` |
| Roth IRA | `#2D6A4F` | `#10B981` |
| Portfolio | `#4A90D9` | `#3B82F6` |
| 529 | `#9B8EC8` | `#8B5CF6` |
| Foreign | `#6B8CAE` | `#64748B` |

Shows the mix shift from heavy 401k → heavy Roth → declining in retirement.

---

## Chart 6: Social Security Comparison

**Type:** Multi-line chart (3 lines, cumulative)  
**File:** `components/charts/SSComparison.tsx`

```typescript
interface SSComparisonProps {
  monthlyBenefitFRA: number;
  quartersEarned: number;
  theme: "horizon" | "velocity";
}
```

Compute 3 scenarios: claim at 62, 67, 70. For each, compute `computeSSBenefit()` and accumulate from claiming age to 85.

**Three lines:** Each starts at its claiming age and rises linearly (cumulative sum). Lines cross at break-even points.

**Annotations:** Mark break-even ages with dots: "Claiming at 70 beats 67 by age 82"

---

## Animation System

### AnimatedNumber Component

```typescript
// components/charts/AnimatedNumber.tsx
interface Props {
  value: number;
  format: "currency" | "percent" | "integer";
  duration?: number;  // default 300ms
  className?: string;
}
```

Uses `requestAnimationFrame`. Counts from old → new value with spring easing (slight overshoot). Currency formatting: `$2.3M`, `$847K`, `$12,340`.

### Chart Mount Animations
- Stacked areas: fill left-to-right, 800ms, staggered
- Bar charts: bars grow from baseline, 600ms, staggered by 50ms each
- Lines: draw left-to-right, 800ms
- On data change: 400ms smooth transition

### Micro-interactions
- Move toggle ON: green pulse on impacted metric (300ms)
- Move toggle OFF: brief fade on impacted metric (200ms)
- Scenario save: camera shutter flash (200ms)
- Scenario card entry: slide in from right (300ms)

---

## Mock Data Generator

For developing charts before the engine is ready:

```typescript
// components/charts/__mocks__/mockData.ts
export function generateMockYears(startAge: number = 41, retireAge: number = 55): YearResult[] {
  // Generate 40 rows of plausible data:
  // - Growing balances during working years
  // - Declining balances after retirement
  // - Realistic income/tax/expense ratios
  // - Bear/bull variants
  // Return YearResult[] matching the real interface
}
```

---

## Marketing Pages

### Landing Page (`/`)

**Hero:**
- Headline: "See Your Retirement Before You Get There"
- Sub: "The financial planning tool that shows you exactly how every decision affects your future. Not a guess — a simulation."
- CTA: [Start Free — No Credit Card] → `/signup`
- Hero visual: the actual NetWorthChart component rendering with demo data, animating on load

**"What Makes This Different" (3 columns):**
- "38 Financial Moves" — toggle strategies, see impact instantly
- "Real Tax Intelligence" — progressive brackets, CG optimization, state taxes
- "Stress-Tested" — bear market scenarios, not just averages

**Social Proof:**
- "Built from a 2,371-formula simulation engine"
- "Used by early retirees and FIRE planners"

**"Two Experiences" Section:**
- Side-by-side screenshots: Horizon (warm) vs Velocity (dark)
- "Choose the one that fits you. Switch anytime."

**Interactive Demo:**
- 3 sliders: retirement age, savings rate, investment style
- Mini net worth chart updates in real-time
- "This is just the surface. Sign up to unlock the full engine."

**Pricing Preview:**
- 3 tier cards: Free, Pro ($12/mo), Premium ($20/mo)
- Feature highlights
- Annual toggle
- CTAs per tier

### Pricing Page (`/pricing`)

Full feature comparison table:

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Basic calculator | ✓ | ✓ | ✓ |
| Plans | 1 | 3 | Unlimited |
| 38-move system | — | ✓ | ✓ |
| Sensitivity analysis | — | ✓ | ✓ |
| CG tax insights | — | ✓ | ✓ |
| Scenarios | — | 3/plan | Unlimited |
| Monte Carlo (v2) | — | — | ✓ |
| PDF export | — | — | ✓ |
| Priority support | — | — | ✓ |

FAQ section (6-8 questions):
- "Can I try before I pay?"
- "What's the difference between Pro and Premium?"
- "Can I cancel anytime?"
- "Is my financial data secure?"
- "Do you sell my data?"
- "What if I need help?"

### About Page (`/about`)

- Origin story: spreadsheet → web app
- Privacy: "Your data is encrypted and never shared or sold"
- "Built for people who want more than a guess"
- Contact form or email

---

## Responsive Requirements

All charts:
- **Desktop (1024px+):** Full size, hover tooltips, interactive slider on bracket viz
- **Tablet (768-1023px):** Slightly compressed, touch-friendly tooltips (tap instead of hover)
- **Mobile (375-767px):** Full-width, stacked. Simplified labels. Tap tooltips. Bracket visualizer becomes vertical. Waterfall always uses simplified mode.

Landing page hero chart: 100% width on mobile, simplified labels, no hover (tap only).
