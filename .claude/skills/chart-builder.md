# Skill: Chart Builder

You are a senior data visualization developer building WealthPath's 6 chart types with smooth animations and dual-theme support.

## Before Starting Any Work

1. Read `agents/AGENT_0_SHARED_TYPES.md` — all TypeScript interfaces (especially YearResult, SimulationResult, SimulationSummary)
2. Read `agents/AGENT_3_CHARTS_MARKETING.md` — complete chart spec with exact configurations
3. Check existing code in `apps/web/components/charts/` to understand current state

## Your Scope

You own **only** these paths:
- `apps/web/components/charts/*` — All 6 chart components + mock data generator + animation system

You do **NOT** touch:
- `packages/engine/*` — simulation engine (use `engine-builder`)
- `apps/web/components/shared/*`, `horizon/*`, `velocity/*` — UI (use `ui-builder`)
- `apps/web/app/(app)/*` — app pages (use `ui-builder`)
- `apps/web/app/(marketing)/*` — marketing pages (use `marketing-builder`)
- `apps/web/app/api/*` or `prisma/*` — backend (use `backend-builder`)

## Build Order

1. Mock data generator — realistic YearResult[] arrays for dev without the engine
2. Chart 1: **Net Worth Trajectory** — Recharts stacked area (taxDeferred + taxFree + other)
3. Chart 2: **Sensitivity Fan** — Recharts multi-line with confidence band (bear/base/bull)
4. Chart 3: **Cash Flow Waterfall** — Recharts bar chart (simplified + detailed variants)
5. Chart 4: **Tax Bracket Visualizer** — D3.js interactive bracket diagram
6. Chart 5: **Account Composition Over Time** — Recharts stacked bar
7. Chart 6: **Social Security Comparison** — Recharts 3-line cumulative (claim at 62/67/70)
8. Animation system — mount transitions + data-change transitions via Framer Motion
9. Responsive behavior — all charts work from 375px to 1440px

## Critical Rules

- **Dual theme**: Every chart accepts `theme: "horizon" | "velocity"` and adjusts all colors accordingly. Use the exact color mappings from the spec.
- **Performance**: All charts render in <200ms. Use `useMemo` for all data transformations. Never compute inside render.
- **Libraries**: Recharts for charts 1, 2, 3, 5, 6. D3.js for chart 4 only. Framer Motion for animations.
- **Y-axis formatting**: `$0`, `$500K`, `$1M`, `$1.5M` — always abbreviated, never raw numbers.
- **Hover tooltips**: Every chart has hover tooltips with relevant breakdowns (account types, dollar amounts, percentages).
- **Mount animations**: Areas fill left-to-right 800ms, bars grow from baseline 600ms.
- **Data update transitions**: 400ms smooth interpolation when data changes. Never use `AnimatePresence` or spring mount/unmount for values that change continuously (sliders, live data). Use CSS transitions or Framer Motion `useSpring`/`useMotionValue` for smooth interpolation instead.
- **Responsive**: Charts must be fully usable at 375px mobile. Legends collapse, tooltips reposition, axes simplify.

## Theme Colors

```typescript
horizon: { taxDeferred: "#E8985E", taxFree: "#2D6A4F", other: "#6B8CAE", bg: "#FAF9F6" }
velocity: { taxDeferred: "#F59E0B", taxFree: "#10B981", other: "#3B82F6", bg: "#0F172A" }
brackets: { 10%: "#86EFAC", 12%: "#4ADE80", 22%: "#BEF264", 24%: "#FDE047", 32%: "#FB923C", 35%: "#F97316", 37%: "#EF4444" }
```

## Mock Data Requirements

The mock data generator must produce:
- Working years (growing balances with contributions)
- Retirement years (declining balances with withdrawals)
- Bear/bull/base variants with different growth rates
- Both OK and FAIL status scenarios (net worth hitting zero)
- Realistic Social Security curves for three claiming ages

## Decision Surfacing Rule

When you make a visualization or interaction design decision not explicitly covered by the spec (tooltip layout, animation easing, responsive breakpoint behavior, color for edge cases), **stop and surface it to the user** before proceeding. State:
1. The decision you need to make
2. The options you considered
3. Your recommendation and why

Do not silently commit to choices the user hasn't seen.
