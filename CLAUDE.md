# WealthPath — Retirement Planning Web App

## Project Overview
WealthPath is a subscription-based retirement planning simulator. It translates a proven 2,371-formula Excel engine into a TypeScript web application serving two audiences through dual interfaces (Horizon for 50+, Velocity for 25-49 FIRE planners).

## Tech Stack
- **Framework:** Next.js 14+ (App Router), React 18, TypeScript (strict mode)
- **Styling:** Tailwind CSS + Radix UI
- **Charts:** Recharts + D3.js, Framer Motion for animations
- **State:** Zustand
- **API:** tRPC (type-safe)
- **Database:** PostgreSQL + Prisma
- **Auth:** NextAuth v5 (email/password + Google OAuth)
- **Payments:** Stripe
- **Monorepo:** Turborepo

## Project Structure
```
wealthpath/
├── packages/engine/          # Shared simulation engine (pure TypeScript, no browser deps)
│   ├── src/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── engine.ts
│   │   ├── tax.ts
│   │   ├── accounts.ts
│   │   ├── moves.ts
│   │   ├── w0-queue.ts
│   │   ├── sensitivity.ts
│   │   ├── goal-solver.ts
│   │   └── validators.ts
│   └── __tests__/
├── apps/web/                 # Next.js application
│   ├── app/
│   │   ├── (auth)/           # Login, signup, forgot-password
│   │   ├── (marketing)/      # Landing, pricing, about
│   │   └── (app)/            # Dashboard, strategy, scenarios, insights, timeline, settings
│   ├── components/
│   │   ├── shared/           # Mode-agnostic: ModeProvider, hooks, inputs
│   │   ├── horizon/          # Warm 50+ UI components
│   │   ├── velocity/         # Dense 25-49 UI components
│   │   └── charts/           # All data visualizations
│   ├── hooks/
│   ├── stores/
│   └── lib/
├── prisma/
├── docs/                     # Agent spec files
│   ├── AGENT_0_SHARED_TYPES.md
│   ├── AGENT_1_ENGINE_AND_BACKEND.md
│   ├── AGENT_2_FULL_UI.md
│   └── AGENT_3_CHARTS_MARKETING.md
└── .claude/agents/
```

## Specification Documents
Detailed specs live in `/docs/`. Each agent should read `AGENT_0_SHARED_TYPES.md` first, then its own spec:
- `AGENT_0_SHARED_TYPES.md` — All TypeScript interfaces, constants, 38-move catalog, default plan
- `AGENT_1_ENGINE_AND_BACKEND.md` — Engine, tax functions, W0 queue, DB, auth, API, Stripe
- `AGENT_2_FULL_UI.md` — Both Horizon + Velocity modes, shared hooks/stores, all pages
- `AGENT_3_CHARTS_MARKETING.md` — 6 chart types, animations, landing page, pricing

## Build Order
```
Phase 1 (parallel):
  engine-builder → Engine + DB + Auth + API + Stripe     ← CRITICAL PATH
  chart-builder  → Charts (mock data) + Marketing pages  ← Independent

Phase 2 (after engine):
  ui-builder     → Full UI (imports engine + charts)      ← Needs both

Phase 3:
  All → Integration testing, responsive polish
```

## Sub-Agent Routing Rules

**Parallel dispatch** (ALL conditions must be met):
- Tasks are in different packages (engine vs web)
- No shared files between tasks
- Clear domain boundaries

**Sequential dispatch** (ANY condition triggers):
- UI work needs engine types that don't exist yet
- API routes need engine functions
- Charts need to wire to real simulation data

## Key Conventions
- The simulation engine must be deterministic and produce results within $1 of the source spreadsheet
- Engine must run both client-side (browser) and server-side (Node) — no browser-only APIs
- All financial numbers formatted contextually: `$2.3M` not `2341872`
- Every financial term needs a tooltip (warm language for Horizon, technical for Velocity)
- Simulation must complete in <100ms client-side
- Charts render in <200ms
- Mobile-first responsive design (375px minimum)

## Source of Truth
The Excel spreadsheet (`Retire_55_Final.xlsx`) is the source of truth for all calculations. If any spec conflicts with the spreadsheet's behavior, the spreadsheet wins.
