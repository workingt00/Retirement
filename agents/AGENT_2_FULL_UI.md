# AGENT 2: Full UI (Horizon + Velocity Modes)

> **Read AGENT_0_SHARED_TYPES.md first.**  
> **Dependencies:** Agent 1 engine (`simulate()`, types), Agent 1 API (tRPC routes)  
> **Location:** `apps/web/app/(app)/*`, `apps/web/components/*`, `apps/web/stores/*`, `apps/web/hooks/*`

---

## Why This Is One Agent

Horizon and Velocity share 70% of their logic. The same dashboard fetches the same data, calls the same simulation, displays the same metrics. Splitting them across agents would duplicate hooks, stores, page layouts, and data-fetching logic. Build the shared foundation first, then branch into themed variants.

---

## Architecture: Shared Core + Themed Shells

```
apps/web/
├── app/(app)/
│   ├── layout.tsx              # Mode-aware layout (reads user.mode)
│   ├── onboarding/page.tsx     # Routes to correct onboarding
│   ├── dashboard/page.tsx      # Routes to correct dashboard
│   ├── strategy/page.tsx
│   ├── scenarios/page.tsx
│   ├── insights/page.tsx
│   ├── timeline/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── shared/                 # Mode-agnostic logic components
│   │   ├── ModeProvider.tsx    # React context: { mode, theme, toggleMode }
│   │   ├── SimulationProvider.tsx  # Runs engine, provides results to tree
│   │   ├── CurrencyInput.tsx
│   │   ├── AgeInput.tsx
│   │   ├── ToggleSwitch.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Tooltip.tsx         # Content varies by mode
│   │   ├── AnimatedNumber.tsx  # Count-up/down animation
│   │   └── FeatureGate.tsx     # Hides pro/premium features for free tier
│   ├── horizon/                # 50+ themed components
│   │   ├── HorizonLayout.tsx
│   │   ├── OnboardingWizard.tsx
│   │   ├── RoadmapDashboard.tsx
│   │   ├── MoveCard.tsx
│   │   ├── PhaseSection.tsx
│   │   └── ...
│   └── velocity/               # 25-49 themed components
│       ├── VelocityLayout.tsx
│       ├── QuickSetup.tsx
│       ├── CommandCenter.tsx
│       ├── MoveGrid.tsx
│       ├── MoveRow.tsx
│       └── ...
├── hooks/
│   ├── useSimulation.ts        # Calls engine, caches result
│   ├── usePlan.ts              # tRPC plan CRUD
│   ├── useScenarios.ts         # tRPC scenario CRUD
│   ├── useMoveToggle.ts        # Toggle move, detect conflicts, re-simulate
│   ├── useImpactPreview.ts     # Differential simulation (toggle one move)
│   └── useMode.ts              # Read/switch mode from context
├── stores/
│   └── planStore.ts            # Zustand: current plan state + dirty tracking
└── lib/
    ├── tooltips.ts             # Tooltip content keyed by term + mode
    ├── formatters.ts           # Currency, percentage, age formatting
    └── theme.ts                # Design tokens for both modes
```

---

## Deliverables Checklist

```
[ ] Mode system: ModeProvider, theme tokens, mode-aware layout
[ ] Zustand plan store with auto-save to API
[ ] useSimulation hook (runs engine client-side, <100ms)
[ ] useImpactPreview hook (differential simulation for move toggles)
[ ] Shared components: CurrencyInput, AgeInput, ToggleSwitch, StatusBadge, Tooltip, AnimatedNumber, FeatureGate
[ ] Horizon onboarding: 5-step wizard
[ ] Velocity onboarding: single-page quick setup
[ ] Horizon dashboard: hero banner + net worth chart + insight cards
[ ] Velocity dashboard: metric strip + charts grid + data panels
[ ] Horizon strategy: card-based moves by life phase
[ ] Velocity strategy: toggle grid with inline editing + impact chart
[ ] Scenarios page (both modes): save, compare, diff, verdict
[ ] Insights page: Horizon = plain-language cards; Velocity = Roth optimizer + CG visualizer + SS comparison
[ ] Timeline page: Horizon = horizontal scroll with markers; Velocity = spreadsheet table with expandable rows
[ ] Settings page: plan config, billing, mode switch
[ ] Tooltip content for all financial terms (both modes)
[ ] Responsive: works at 375px (mobile), 768px (tablet), 1024px+ (desktop)
```

---

## 1. Mode System

### ModeProvider

```typescript
// components/shared/ModeProvider.tsx
type Mode = "horizon" | "velocity";

interface ModeContext {
  mode: Mode;
  theme: ThemeTokens;
  setMode: (m: Mode) => void;
}

// Read initial mode from user session (server component passes it down)
// Persist mode changes via user.setMode tRPC call
```

### Theme Tokens

```typescript
// lib/theme.ts
export const themes = {
  horizon: {
    primary: "#2D6A4F",
    secondary: "#D4A843",
    bg: "#FAF9F6",
    surface: "#FFFFFF",
    text: "#1A1A2E",
    textMuted: "#6B7280",
    danger: "#DC3545",
    success: "#2D6A4F",
    radius: "12px",
    radiusInput: "8px",
    fontSize: "16px",
    fontFamily: "'Inter', 'Source Sans Pro', sans-serif",
    fontMono: "'SF Mono', 'Consolas', monospace",
    spacing: "24px",
    spacingCompact: "16px",
    isDark: false,
  },
  velocity: {
    primary: "#3B82F6",
    secondary: "#10B981",
    bg: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    danger: "#EF4444",
    success: "#10B981",
    radius: "8px",
    radiusInput: "6px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', monospace",
    spacing: "16px",
    spacingCompact: "8px",
    isDark: true,
  },
} as const;
```

### Mode-Aware Page Pattern

Every page follows this pattern:

```typescript
// app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  const { mode } = useMode();
  return mode === "horizon" ? <RoadmapDashboard /> : <CommandCenter />;
}
```

---

## 2. Core Hooks

### useSimulation

```typescript
// hooks/useSimulation.ts
export function useSimulation() {
  const plan = usePlanStore(s => s.plan);
  
  const result = useMemo(() => {
    if (!plan) return null;
    return simulate(plan);  // from @wealthpath/engine — runs client-side
  }, [plan]);
  
  const goalResult = useMemo(() => {
    if (!plan) return null;
    return solveGoal(plan);
  }, [plan]);
  
  const conflicts = useMemo(() => {
    if (!plan) return [];
    return detectConflicts(plan.moves);
  }, [plan?.moves]);
  
  return { result, goalResult, conflicts };
}
```

### useImpactPreview

```typescript
// hooks/useImpactPreview.ts
// Runs two simulations: current plan vs plan with one move toggled
// Returns delta NW at 80 and delta failure years
export function useImpactPreview(moveId: string) {
  const plan = usePlanStore(s => s.plan);
  
  return useMemo(() => {
    if (!plan) return null;
    const current = simulate(plan);
    const modified = { ...plan, moves: plan.moves.map(m => m.id === moveId ? { ...m, enabled: !m.enabled } : m) };
    const alt = simulate(modified);
    return {
      deltaNWAt80: alt.summary.netWorthAt80 - current.summary.netWorthAt80,
      deltaFailYears: (current.summary.totalFailYears) - (alt.summary.totalFailYears),
      isImprovement: alt.summary.netWorthAt80 > current.summary.netWorthAt80,
    };
  }, [plan, moveId]);
}
```

### usePlan (tRPC wrapper)

```typescript
// hooks/usePlan.ts
// Wraps tRPC plan.get, plan.update with optimistic updates
// Auto-saves to server on debounced plan changes (500ms debounce)
// Loads plan into Zustand store on mount
```

### Zustand Plan Store

```typescript
// stores/planStore.ts
interface PlanStore {
  plan: UserPlan | null;
  isDirty: boolean;
  setPlan: (plan: UserPlan) => void;
  updateField: (path: string, value: any) => void;  // lodash set
  toggleMove: (moveId: string) => void;
  updateMove: (moveId: string, field: string, value: any) => void;
  markClean: () => void;
}
```

---

## 3. Shared Components

### AnimatedNumber

```typescript
// components/shared/AnimatedNumber.tsx
interface Props {
  value: number;
  format: "currency" | "percent" | "integer" | "decimal";
  duration?: number;  // ms, default 300
  className?: string;
}
// Counts from previous value to new value over duration with spring easing
// Uses requestAnimationFrame for smooth animation
// Currency format: $2.3M, $847K, $12,340 (smart abbreviation)
```

### Tooltip

```typescript
// components/shared/Tooltip.tsx
interface Props {
  term: string;  // key into tooltips.ts
  children: React.ReactNode;
}
// Shows (i) icon next to children
// On hover/tap: shows tooltip text from lib/tooltips.ts based on current mode
// Horizon tooltips: warm, plain language
// Velocity tooltips: precise, technical
```

### FeatureGate

```typescript
// components/shared/FeatureGate.tsx
interface Props {
  feature: "moveSystem" | "sensitivity" | "cgInsights" | "monteCarlo";
  children: React.ReactNode;
  fallback?: React.ReactNode;  // "Upgrade to Pro" card
}
// Checks user tier against TIER_LIMITS
// Shows children if allowed, fallback (or upgrade prompt) if not
```

---

## 4. Tooltip Content

```typescript
// lib/tooltips.ts
export const tooltips: Record<string, { horizon: string; velocity: string }> = {
  "traditional_401k": {
    horizon: "A retirement account through your employer. You put money in before taxes, which lowers your tax bill now. You'll pay taxes when you take the money out in retirement.",
    velocity: "Pre-tax salary deferral under IRC §401(k). $23K limit (2025). Reduces AGI. Taxed as ordinary income on distribution.",
  },
  "roth_ira": {
    horizon: "A personal retirement account where you put in money after taxes. The good news: when you take it out in retirement, it's completely tax-free.",
    velocity: "After-tax contributions, tax-free qualified distributions. $7.5K limit. Income phase-out: $230K-$240K AGI (MFJ). Backdoor available.",
  },
  "capital_gains": {
    horizon: "When you sell an investment that went up in value, you pay tax on the profit. The tax rate depends on your income — you might even pay 0% in retirement!",
    velocity: "LTCG taxed at 0%/15%/20% progressive brackets based on ordinary taxable income. CG portion parameter (default 75%) estimates cost basis.",
  },
  "roth_conversion": {
    horizon: "Moving money from a Traditional account to a Roth account. You pay tax now, but then it grows tax-free forever. It's like paying a small toll now to drive on a free highway later.",
    velocity: "Trad→Roth rollover. Taxed as ordinary income in conversion year. Resets cost basis. 5-year rule applies for penalty-free access before 59.5.",
  },
  "first_failure_age": {
    horizon: "This is the age when your plan runs out of money based on current assumptions. Don't panic — we have ideas to fix this.",
    velocity: "MIN(age) WHERE status='FAIL'. The earliest year net worth hits zero. Key metric: optimize until this is null (never fails) or exceeds life expectancy.",
  },
  "w0_priority_queue": {
    horizon: "When you turn this on, we automatically figure out the smartest order to take money from your different accounts — paying the least tax possible.",
    velocity: "Tax-optimal withdrawal sequencing: (1) Taxable portfolio at marginal CG rate, (2) Traditional at marginal ordinary rate, (3) Roth tax-free. Minimizes lifetime tax drag.",
  },
  "bear_case": {
    horizon: "What happens if the stock market performs poorly for an extended period. Think of it as a stress test for your retirement plan.",
    velocity: "All growth rates adjusted by bear delta (default -4pp). Approximates poor sequence-of-returns risk. Bear failure age is the actionable risk metric.",
  },
  "sensitivity": {
    horizon: "We test your plan against good times and bad times to make sure it holds up no matter what happens in the market.",
    velocity: "Bear/base/bull projections using growth rate adjustments. Default: bear -4pp, bull +2pp. Not Monte Carlo — deterministic scenario analysis.",
  },
  "standard_deduction": {
    horizon: "The amount of income you don't have to pay taxes on. For married couples filing together, it's about $30,000 in 2025.",
    velocity: "MFJ: $30,000. Single: $15,000 (2025). Subtracted from gross income before applying marginal brackets.",
  },
  "rule_of_55": {
    horizon: "If you leave your job at 55 or later, you can take money from that employer's 401k without the usual 10% early withdrawal penalty.",
    velocity: "IRC §72(t)(2): Penalty-free 401k distributions if separated from service in or after the year you turn 55. Current employer plan only.",
  },
  // Add all 38 moves + key financial terms (50+ terms total)
};
```

---

## 5. Horizon Mode Pages

### 5A. Onboarding Wizard (`/onboarding`, Horizon variant)

5-step wizard. Full-screen cards. Progress bar at top. ~2-3 min per step.

**Step 1: "Let's get to know you"**
- Current age (large number input)
- Filing status (two big cards: "Married" / "Single")
- State (searchable dropdown)
- Helper text: "We use your state to estimate taxes. You can change this later."

**Step 2: "Your income and work"**
- Annual salary (currency input)
- Other income (toggle + amount)
- Retirement age (slider: 50-75, default 65)
- Annual raise (small input, default 3%)
- Tooltip on retirement age: "This is the age you stop earning a paycheck."

**Step 3: "What you've saved so far"**
- Show cards for each account type. User selects which they have, then enters balance:
  - 401k/403b — "From your employer"
  - Roth IRA — "Your tax-free account"
  - Brokerage — "Stocks, bonds, mutual funds"
  - Other — "Pension, foreign accounts"

**Step 4: "Your monthly spending"**
- Housing: mortgage/rent + tax + insurance + HOA
- Living: groceries, dining, utilities (combined)
- Fun: travel & hobbies (annual), subscriptions (combined)
- Healthcare: monthly premium
- Kids (if applicable)
- Running monthly total at bottom
- Helper: "Round to the nearest $100 — the ballpark is what matters."

**Step 5: "Social Security"**
- Monthly benefit estimate at 67 (link to ssa.gov)
- Claiming age: three big cards ("62 reduced", "67 full", "70 maximum")
- Years worked (auto-converts to quarters)

After completion → celebration animation → redirect to Dashboard.

### 5B. Dashboard ("Your Retirement Roadmap")

**Hero:** Large status message: "Your retirement is on track" (green) or "Your plan needs attention" (amber/red). Below: NW at retirement, years of runway, first failure age.

**Net Worth Chart:** Stacked area (Agent 3 provides chart component). Vertical line at retirement. Phase labels below.

**4 Insight Cards (2x2 grid):**
1. "Tax Savings Opportunity" — plain-language CG explanation
2. "Social Security" — benefit amount + claiming age impact
3. "Stress Test" — bear case summary
4. "Smart Moves" — active move count, link to strategy

### 5C. Strategy ("Smart Moves")

Organized by life phase, NOT a toggle grid:
- "While you're still working" — contribution moves (C1-C5, C7, C8)
- "When you retire" — withdrawal moves (W0-W11), W0 featured with "Recommended" badge
- "Optimizing your taxes" — conversion moves (X1-X4)
- "Life changes" — lifestyle + SS moves (L1-L6, S1)

Each move is a card with: big toggle, amount input, start age, "What is this?" expandable, impact preview (uses `useImpactPreview`).

### 5D. Scenarios ("What-If Explorer")

Current plan summary at top. "Save as scenario" button. Side-by-side comparison (up to 3). Key metrics + verdict per scenario.

### 5E. Insights

Plain-language cards: tax savings, SS options (62/67/70 comparison), bear case reassurance. Each card has a "Take Action" button linking to Strategy.

### 5F. Timeline

Horizontal scroll from current age to 80. Milestone markers (retire, mortgage paid, SS starts, Medicare). Click year → expand detail: income, taxes, expenses, cash flow, balances, status.

### 5G. Settings

Edit About You answers (grouped by wizard step). Billing. Mode switch ("Try the power user experience"). PDF export (Premium).

---

## 6. Velocity Mode Pages

### 6A. Quick Setup (`/onboarding`, Velocity variant)

Single dense form page, two columns on desktop.

**Left: Essentials** — age, retirement age, filing status, state, salary, other income, raise %, SS benefit/quarters/claiming age

**Right: Accounts + Expenses** — 5 account balances, monthly expense total with expandable detail grid (housing, bills, living, other as compact rows)

**Bottom:** [Start with defaults] | [I know what I'm doing] | [Import CSV — disabled]

### 6B. Dashboard ("Command Center")

**Top strip: 6 key metrics** — first failure age (or ∞), NW at retirement, years of runway, bear failure age, effective tax rate, active move count. Each as a compact card with sparkline/delta.

**Left 60%: Chart stack** — Net Worth Trajectory (interactive, zoomable). Toggle buttons: "By Tax Treatment" / "By Account" / "Sensitivity" (switches to fan chart).

**Right 40%: Data panels** — Account balances at retirement (horizontal bars), cash flow by phase (bars), CG intelligence (rate + harvest capacity), quick actions.

**Keyboard shortcuts:** `S` save scenario, `M` moves, `T` timeline, `1-9` quick-toggle moves, `?` help overlay.

### 6C. Strategy ("Move Console")

**Toggle grid (table layout):** One row per move. Columns: toggle | ID | name | start age | amount | Δ NW at 80.

- Grouped by category with collapsible headers
- Inline-editable amount and age (click to edit)
- Impact column updates in real-time via `useImpactPreview`
- Conflict indicators: red border + warning when both conflicting moves ON
- Keyboard: arrows navigate, space toggles, enter edits

**Impact preview (bottom):** Mini before/after line chart when any move changes. Delta callout: "Enabling X1 adds $347K at 80."

### 6D. Scenarios ("Scenario Lab")

Side-by-side columns (current + up to 3 saved). Full SimulationSummary metrics shown. Delta column with color coding (green = better, red = worse). Diff view highlighting changed moves/parameters. CSV export (Premium).

### 6E. Insights ("Tax Alpha Dashboard")

**Roth Conversion Optimizer:** Interactive slider. As it moves: bracket filling animation, lifetime tax delta, NW impact. Shows sweet spot: "Converting $55K fills 22% bracket. $10K room before 24%."

**CG Bracket Visualizer:** Horizontal bracket ladder (0%/15%/20%). Marker at current income. Room in 0% bracket highlighted. Years at 0% count.

**SS Optimizer:** 3-column comparison (62/67/70): annual benefit, lifetime total to 85, break-even age. Cumulative chart. Recommendation.

**Sensitivity Deep Dive:** Bear/base/bull table. Adjustable fan chart. "What breaks your plan?" analysis.

### 6F. Timeline ("Year-by-Year Engine")

Full spreadsheet-style table. Columns: age, income, taxes, expenses, cash flow, status, 7 account balances. Expandable rows showing formula details. Color-coded: green OK, red FAIL. Sortable. Export CSV. "Jump to retirement" button.

### 6G. Settings ("Parameters")

Tabbed: Profile | Plan Config | Tax Brackets (editable table) | Growth Rates (7 sliders) | Billing.

---

## 7. Key UX Principles (Both Modes)

1. **Instant feedback.** Every input change triggers engine re-run (<100ms client-side). No "Save" or "Calculate" buttons. Results update while you type (debounced 150ms for text inputs, immediate for toggles/sliders).

2. **Numbers always have context.** Never show `2341872`. Show `$2.3M` (Velocity) or `$2.3 million by age 65` (Horizon).

3. **Error states suggest fixes.** "Your plan runs short at 72" → Horizon: "Adding $300/month or working 2 more years fixes this. [Apply]" / Velocity: "FAIL at 72. Δ: +$300/mo contribution or retirementAge += 2 resolves. [Apply]"

4. **Celebrate improvements.** When a move toggle improves the plan: green flash on the metric that improved, updated number animates.

5. **Progressive disclosure.** Horizon hides complexity (no raw bracket tables, no column references). Velocity reveals it on demand ("Advanced" toggles).

6. **Conflicts are surfaced immediately.** When a user enables a conflicting move: the conflicting move's card/row gets a red border, a toast explains the conflict, and the older move is auto-disabled with an undo option.

7. **Mobile-first responsive.** 375px breakpoint works for all critical flows. On mobile: wizard steps become one-input-per-screen (Horizon), grid collapses to stacked cards (Velocity), charts are full-width.

---

## 8. Responsive Breakpoints

| Breakpoint | Horizon | Velocity |
|------------|---------|----------|
| Mobile (375-767px) | Wizard: 1 input/screen. Dashboard: stacked. Strategy: card stack | Setup: single column. Dashboard: metrics scroll, chart full-width |
| Tablet (768-1023px) | 2-column wizard. Dashboard: chart + 2x2 cards | 2-column. Dashboard: chart + side panels |
| Desktop (1024px+) | Full wizard with illustration. Dashboard: hero + chart + cards | Full command center. Strategy: full grid |
