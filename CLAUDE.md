# WealthPath — Retirement Planning Web App

## Product Vision
WealthPath exists to make retirement planning **fun, exciting, and engaging**. The retirement planning space is dominated by clunky spreadsheets and boring calculators that make people's eyes glaze over. We're building something radically different — a tool so good that people *want* to plan their retirement, not dread it.

This is a disruptive product. Every design choice, every interaction, every pixel should reinforce that WealthPath is in a completely different league from anything else out there. If a feature feels like "just another calculator," it's not done yet.

## Project Overview
WealthPath is a subscription-based retirement planning simulator. It translates a proven 2,371-formula Excel engine into a TypeScript web application serving two audiences through dual interfaces (Horizon for 50+, Velocity for 25-49 FIRE planners).

## Engineering Principles

These are non-negotiable. Every agent, every PR, every line of code must follow these:

### Never Remove Without Verifying
- **Do not remove any functionality, component, utility, or code path without first confirming it is truly unused.** Search for all references, check imports, trace call sites. If in doubt, keep it.
- Deleting "dead" code that turns out to be alive is one of the most expensive mistakes. Verify first, always.
- **When fixing a bug or improving behavior, fix the implementation — do not remove the feature.** If an animation is janky, fix the animation. If a component flickers, fix the rendering. Never "solve" a problem by deleting the thing the user asked for. The user's intent is sacred — preserve it, improve it, never discard it.

### Consistent, Sleek UI
- The UI must feel cohesive across every page, mode, and interaction. No orphaned styles, no inconsistent spacing, no mismatched component patterns.
- Horizon and Velocity modes have different personalities but share the same level of polish. Both must feel intentional and refined.
- Every animation should be purposeful — guide the user's eye, not distract it.

### Code Reusability
- Extract shared logic into utilities, hooks, and components. If you're writing the same pattern a second time, abstract it.
- The `packages/engine/` module exists for a reason — computation logic lives there, not scattered across UI components.
- Shared UI primitives go in `components/shared/`. Mode-specific components import and compose from shared building blocks.

### Scale-Ready Architecture
- Design data structures, APIs, and state management to handle growth. Today it's one user's plan; tomorrow it's thousands of concurrent simulations.
- Keep the engine stateless and pure. No side effects, no global mutation, no hidden dependencies.
- Database queries must be efficient from day one — no "we'll optimize later" shortcuts.

### Unit Test Everything
- Every engine function, every utility, every non-trivial hook gets a test. No exceptions.
- Tests should validate behavior, not implementation details. Test what the function *does*, not how it does it.
- Run the full test suite before considering any work complete. If tests break, fix them before moving on.

### Zero Regressions
- Nothing ships that breaks existing functionality. Period.
- When modifying shared code, verify all consumers still work correctly.
- If a change touches the engine, re-validate against the source spreadsheet.

## UX Standards

Our job is to make this **effortless** for the user. They should never have to think about how to use WealthPath — it should just work.

- **Reduce cognitive load:** Smart defaults for everything. Pre-fill what we can. Show only what matters right now, progressive disclosure for the rest.
- **Instant feedback:** Every input change should immediately reflect in the simulation. No "calculate" buttons, no page reloads, no waiting.
- **Clear financial language:** Every financial term gets a tooltip. Horizon mode uses warm, approachable language. Velocity mode uses precise technical terms. Both explain, never assume knowledge.
- **Error prevention over error messages:** Guide users toward valid inputs with constraints, ranges, and smart validation. Don't let them enter nonsense, then scold them for it.
- **Delightful details:** Micro-interactions, smooth transitions, satisfying chart animations. These small moments are what separate a great product from a good one.

### No Financial Advice (RIA Compliance)
WealthPath is a planning simulator, not a registered investment advisor. All UI copy — insight cards, tooltips, labels, contextual messages — must present **factual observations about the user's own data**, never recommendations or opinions.
- No "should", "consider", "we recommend" — ever
- Observations only: "Your savings rate is X%" not "You should save more"
- Neutral framing: "Claiming at 62 reduces benefits by ~30% vs FRA" not "Wait until 70"
- No comparative judgments against benchmarks or averages
- Show math, not opinions — let the user decide what the numbers mean
- Include "For educational purposes only. Not financial advice." disclaimer where projections are shown

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

## Quality Gates

Before any work is considered complete, verify **all** of the following:

1. **Tests pass** — Run the full suite. No skipped tests, no "TODO: fix later" stubs.
2. **No regressions** — Existing functionality works exactly as before. If you touched shared code, verify all consumers.
3. **Type-safe** — Zero `any` types. Zero `@ts-ignore`. TypeScript strict mode must be clean.
4. **UI consistency** — New components match existing design patterns. Check spacing, colors, typography, responsive behavior.
5. **Performance** — Engine simulations <100ms, chart renders <200ms, no unnecessary re-renders.
6. **Accessibility** — Keyboard navigable, proper ARIA labels, sufficient color contrast.
7. **Spreadsheet parity** — Any engine change must be validated against `Retire_55_Final.xlsx`. Results within $1.
8. **No dead code** — Don't leave commented-out blocks, unused imports, or orphaned files.
9. **Reusable** — If you wrote something generic, it belongs in a shared module, not buried in a page component.

## Source of Truth
The Excel spreadsheet (`Retire_55_Final.xlsx`) is the source of truth for all calculations. If any spec conflicts with the spreadsheet's behavior, the spreadsheet wins.
