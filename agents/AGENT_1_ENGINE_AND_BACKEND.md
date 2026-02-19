# AGENT 1: Simulation Engine + Backend

> **Read AGENT_0_SHARED_TYPES.md first.**  
> **Priority: CRITICAL PATH — must complete before Agents 2 and 3 can integrate.**  
> This agent builds the entire backend: simulation engine, database, auth, API, and payments.  
> **Location:** `packages/engine/src/*`, `prisma/*`, `apps/web/app/api/*`, `apps/web/app/(auth)/*`

---

## Why This Is One Agent

The engine and the API are tightly coupled. The tRPC routes call `simulate(plan)` and return `SimulationResult`. The person who builds the engine understands the data shapes and should also build the routes that serve them. The database schema, auth, and Stripe are mechanical additions — they don't justify a separate agent.

---

## Deliverables Checklist

```
[ ] packages/engine/src/types.ts        — All interfaces from AGENT_0
[ ] packages/engine/src/constants.ts    — Brackets, state rates, default moves/plan
[ ] packages/engine/src/tax.ts          — Federal, CG, SS, state tax functions
[ ] packages/engine/src/accounts.ts     — 7 account balance computations
[ ] packages/engine/src/moves.ts        — 38 move execution logic
[ ] packages/engine/src/w0-queue.ts     — Tax-optimal withdrawal priority queue
[ ] packages/engine/src/sensitivity.ts  — Bear/base/bull projections
[ ] packages/engine/src/goal-solver.ts  — Savings goal calculator
[ ] packages/engine/src/engine.ts       — Main simulation loop
[ ] packages/engine/src/validators.ts   — Input validation, 17 conflict pairs
[ ] packages/engine/src/index.ts        — Public API exports
[ ] packages/engine/__tests__/*         — Tests against spreadsheet known-good values
[ ] prisma/schema.prisma               — User, Plan, Scenario, Subscription models
[ ] prisma/seed.ts                     — Demo users + plans
[ ] apps/web/lib/auth.ts              — NextAuth config (email + Google)
[ ] apps/web/app/(auth)/login/page.tsx — Login page
[ ] apps/web/app/(auth)/signup/page.tsx — Signup page with mode selection
[ ] apps/web/app/api/trpc/*           — tRPC router (plan, scenario, user, subscription)
[ ] apps/web/app/api/stripe/*         — Checkout + webhook handlers
```

---

# PART A: SIMULATION ENGINE

## File Structure

```
packages/engine/
├── src/
│   ├── types.ts
│   ├── constants.ts
│   ├── engine.ts
│   ├── tax.ts
│   ├── accounts.ts
│   ├── moves.ts
│   ├── w0-queue.ts
│   ├── sensitivity.ts
│   ├── goal-solver.ts
│   ├── validators.ts
│   └── index.ts
├── __tests__/
│   ├── tax.test.ts
│   ├── engine.test.ts
│   ├── w0-queue.test.ts
│   └── goal-solver.test.ts
├── package.json
└── tsconfig.json
```

---

## 1. Tax Functions (`tax.ts`)

### 1.1 Federal Income Tax (Progressive Brackets)

```typescript
export function computeFederalTax(
  ordinaryIncome: number,
  filingStatus: "MFJ" | "SINGLE",
  standardDeduction: number
): number {
  const brackets = filingStatus === "MFJ" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  const taxable = Math.max(0, ordinaryIncome - standardDeduction);
  
  let tax = 0;
  for (const bracket of brackets) {
    const inBracket = Math.max(0, Math.min(taxable, bracket.ceiling) - bracket.floor);
    tax += inBracket * bracket.rate;
  }
  return tax;
}
```

**IMPORTANT:** The spreadsheet's column I includes ordinary tax PLUS SS tax PLUS early withdrawal penalties PLUS capital gains tax. The complete federal tax for a year is:

```typescript
federalTax = ordinaryIncomeTax + cgTax + ssTax + earlyWithdrawalPenalties
```

Where:
- `ssTax = ssBenefit * ssTaxablePortion * 0.12` (uses 12% bracket rate for SS)
- `earlyWithdrawalPenalties = 10% on Traditional withdrawals (W8/W10/W11) before age 59.5`

### 1.2 Capital Gains Tax (Progressive)

CG rates are 0%, 15%, or 20% based on where ordinary taxable income falls:

```typescript
export function computeCGTax(
  gains: number,
  ordinaryTaxableIncome: number,  // AFTER standard deduction
  filingStatus: "MFJ" | "SINGLE",
  cgTaxablePortion: number = 0.75
): number {
  const t = filingStatus === "MFJ" ? CG_THRESHOLDS.MFJ : CG_THRESHOLDS.SINGLE;
  const taxableGains = gains * cgTaxablePortion;
  
  if (ordinaryTaxableIncome < t.zero) {
    const roomAtZero = t.zero - ordinaryTaxableIncome;
    const gainsAtZero = Math.min(taxableGains, roomAtZero);
    const gainsAt15 = Math.min(Math.max(0, taxableGains - gainsAtZero), t.fifteen - t.zero);
    const gainsAt20 = Math.max(0, taxableGains - gainsAtZero - gainsAt15);
    return gainsAt15 * 0.15 + gainsAt20 * 0.20;
  } else if (ordinaryTaxableIncome < t.fifteen) {
    const roomAt15 = t.fifteen - ordinaryTaxableIncome;
    const gainsAt15 = Math.min(taxableGains, roomAt15);
    const gainsAt20 = Math.max(0, taxableGains - gainsAt15);
    return gainsAt15 * 0.15 + gainsAt20 * 0.20;
  } else {
    return taxableGains * 0.20;
  }
}

export function marginalCGRate(
  ordinaryTaxableIncome: number,
  filingStatus: "MFJ" | "SINGLE"
): number {
  const t = filingStatus === "MFJ" ? CG_THRESHOLDS.MFJ : CG_THRESHOLDS.SINGLE;
  if (ordinaryTaxableIncome < t.zero) return 0;
  if (ordinaryTaxableIncome < t.fifteen) return 0.15;
  return 0.20;
}
```

### 1.3 Marginal Ordinary Rate (for W0 queue)

```typescript
export function marginalOrdinaryRate(
  taxableIncome: number,
  filingStatus: "MFJ" | "SINGLE"
): number {
  const brackets = filingStatus === "MFJ" ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].floor) return brackets[i].rate;
  }
  return brackets[0].rate;
}
```

### 1.4 Social Security Benefit

```typescript
export function computeSSBenefit(
  monthlyBenefitFRA: number,
  claimingAge: number,
  quartersEarned: number
): number {
  let ageFactor: number;
  if (claimingAge <= 66) {
    ageFactor = 1 - (67 - claimingAge) * 0.0667;
  } else {
    ageFactor = 1 + (claimingAge - 67) * 0.08;
  }
  const quarterFactor = Math.min(1, quartersEarned / 40);
  return monthlyBenefitFRA * 12 * ageFactor * quarterFactor;
}
```

### 1.5 State Tax (flat effective rate)

```typescript
export function computeStateTax(
  taxableIncome: number,
  portfolioGains: number,
  cgPortion: number,
  stateRate: number
): number {
  return (taxableIncome + portfolioGains * cgPortion) * stateRate;
}
```

---

## 2. Main Simulation Loop (`engine.ts`)

### Column Processing Order (CRITICAL — must match spreadsheet)

```
For each year from currentAge to 80:
  1.  D:  W2 Income (0 after retirement)
  2.  E:  W9/Other Income (+ I1, I2, I3 when active)
  3.  F:  Social Security (S1 move, age-adjusted, COLA-inflated)
  4.  AA: Traditional 401k balance (C1 + R1 + growth - X1 - W3/W8/W11/X3)
  5.  AB: Roth conversion amount (X1, capped by available Trad balance)
  6.  AC: Roth 401k balance (C2 + C7 + growth + AB - X2 transfer)
  7.  AD: Roth 401k → Roth IRA transfer (X2 or W11 trigger)
  8.  AE: Traditional IRA (X3 in + growth - X4 - W4/W10/W11)
  9.  AF: Roth IRA (C3 + C8 + X2/X4/AD in + growth - W2/W9/W11)
  10. AH: Private Portfolio (C4 + growth - sells + FP cash + L5 - L2 - L6)
  11. AL: 529 ((balance + C5) * growth - W6)
  12. AM: Foreign Pension (growth until W5, then 0)
  13. M:  Taxable ordinary income
  14. AZ: W0 expense gap (if W0 enabled)
  15. BA-BC: W0 priority queue withdrawals
  16. AI: Total portfolio sell (W1 + W7 + W11 + BA from W0)
  17. I:  Federal tax (brackets + CG + SS + penalties)
  18. J:  State tax
  19. L:  Total tax (I + J)
  20. N-V: Expenses (7 categories, inflated annually)
  21. W:  Total expenses
  22. X:  Annual cash flow
  23. Z:  Status (OK/FAIL)
  24. BD-BL: Sensitivity + CG rate indicator
```

### Key Computations

**Taxable Income (Column M):**
```
Working: W2 + W9 + rothConversion + x4Conversion - tradDeduction - catchUpDeduction + portfolioSell + w3 + w4 + w8 + w10 + w11Trad
Retired: rothConversion + x4Conversion + portfolioSell + w3 + w4 + w8 + w10 + w11Trad + I1 + I2 + I3
```

**Cash Flow (Column X):**
```
Working: W2 + W9 - totalTax - totalExpenses - rothContrib - portfolioContrib - 529Contrib - megaBackdoor
Retired: taxableIncome + SS + rothWithdrawals - totalTax - totalExpenses
```

**Account Balance Pattern:**
```
balance(t) = MAX(0, contributions + balance(t-1) * (1 + growthRate) - withdrawals - conversionsOut + conversionsIn)
```

**Expense Inflation:**
```
General expenses: expense(t) = expense(t-1) * generalInflation
Medical (age 50+): projectedAge50Plus * medicalInflation^(age - 50)
R2 Medicare at 65: multiply by 0.7
L4 Relocate: multiply by 0.8 (one-time)
```

**Housing Special Cases:**
- Mortgage payoff at `mortgageEndAge`: drops to non-mortgage portion
- L1 (sell house): housing → 0
- L2 (pay off mortgage early): housing → housing * (nonMortgage / totalHousing)
- L5 (downsize): housing *= 0.5

---

## 3. W0 Priority Queue (`w0-queue.ts`)

```typescript
export function computeW0(
  expenseGap: number,
  portfolioBalance: number,
  tradBalance: number,
  rothBalance: number,
  ordinaryTaxableIncome: number,
  filingStatus: "MFJ" | "SINGLE",
  stateRate: number,
  cgPortion: number,
  standardDeduction: number
): { fromPortfolio: number; fromTrad: number; fromRoth: number } {
  if (expenseGap <= 0) return { fromPortfolio: 0, fromTrad: 0, fromRoth: 0 };

  const taxableOrd = Math.max(0, ordinaryTaxableIncome - standardDeduction);
  
  // Priority 1: Portfolio (capital gains rates — cheapest)
  const margCG = marginalCGRate(taxableOrd, filingStatus);
  const effectiveCGRate = cgPortion * (stateRate + margCG);
  const grossPortfolio = Math.min(
    effectiveCGRate < 1 ? expenseGap / (1 - effectiveCGRate) : expenseGap,
    portfolioBalance
  );
  const netPortfolio = grossPortfolio * (1 - effectiveCGRate);

  // Priority 2: Traditional (ordinary income rates)
  const remaining1 = Math.max(0, expenseGap - netPortfolio);
  const margOrd = marginalOrdinaryRate(taxableOrd + grossPortfolio * cgPortion, filingStatus);
  const effectiveOrdRate = stateRate + margOrd;
  const grossTrad = Math.min(
    effectiveOrdRate < 1 ? remaining1 / (1 - effectiveOrdRate) : remaining1,
    tradBalance
  );
  const netTrad = grossTrad * (1 - effectiveOrdRate);

  // Priority 3: Roth (tax-free — preserve as long as possible)
  const remaining2 = Math.max(0, expenseGap - netPortfolio - netTrad);
  const fromRoth = Math.min(remaining2, rothBalance);

  return { fromPortfolio: grossPortfolio, fromTrad: grossTrad, fromRoth };
}
```

---

## 4. Sensitivity Analysis (`sensitivity.ts`)

```typescript
export function computeSensitivity(
  baseResults: YearResult[],
  bearAdj: number,
  bullAdj: number,
  avgGrowth: number,
  retirementAge: number
): { bear: { nw: number; status: "OK" | "FAIL" }[]; bull: { nw: number; status: "OK" | "FAIL" }[] } {
  const bear: { nw: number; status: "OK" | "FAIL" }[] = [];
  const bull: { nw: number; status: "OK" | "FAIL" }[] = [];
  
  for (let i = 0; i < baseResults.length; i++) {
    const yr = baseResults[i];
    const baseNW = yr.totalNetWorth;
    
    if (i === 0) {
      bear.push({ nw: baseNW, status: "OK" });
      bull.push({ nw: baseNW, status: "OK" });
    } else {
      const prevBearNW = bear[i-1].nw;
      const prevBullNW = bull[i-1].nw;
      const prevBaseNW = baseResults[i-1].totalNetWorth;
      const nonGrowthDelta = baseNW - prevBaseNW - prevBaseNW * avgGrowth;
      
      const bearNW = Math.max(0, prevBearNW * (1 + avgGrowth + bearAdj) + nonGrowthDelta);
      const bullNW = Math.max(0, prevBullNW * (1 + avgGrowth + bullAdj) + nonGrowthDelta);
      
      bear.push({ nw: bearNW, status: bearNW <= 0 && yr.isRetired ? "FAIL" : "OK" });
      bull.push({ nw: bullNW, status: bullNW <= 0 && yr.isRetired ? "FAIL" : "OK" });
    }
  }
  
  return { bear, bull };
}
```

---

## 5. Goal Solver (`goal-solver.ts`)

```typescript
export function solveGoal(plan: UserPlan): GoalSolverResult {
  const years = plan.personal.retirementAge - plan.personal.currentAge;
  const g = plan.growthRates;
  const avgGrowth = (g.traditional401k + g.privatePortfolio) / 2;
  
  const fvExisting =
    plan.balances.traditional401k * Math.pow(1 + g.traditional401k, years) +
    plan.balances.rothIRA * Math.pow(1 + g.rothIRA, years) +
    plan.balances.privatePortfolio * Math.pow(1 + g.privatePortfolio, years) +
    plan.balances.foreignPension * Math.pow(1 + g.foreignPension, years) +
    plan.balances.plan529 * Math.pow(1 + g.plan529, years);

  const annualMatch = plan.income.w2Salary * plan.goalSolver.employerMatchPercent / 100;
  const fvMatch = avgGrowth > 0
    ? annualMatch * (Math.pow(1 + avgGrowth, years) - 1) / avgGrowth
    : annualMatch * years;

  const gap = Math.max(0, plan.goalSolver.targetNetWorth - fvExisting - fvMatch);
  const annualSavings = gap <= 0 ? 0 : gap * avgGrowth / (Math.pow(1 + avgGrowth, years) - 1);
  const savingsRate = plan.income.w2Salary > 0 ? annualSavings / plan.income.w2Salary : 0;

  return {
    yearsToRetire: years,
    futureValueExisting: fvExisting,
    futureValueMatch: fvMatch,
    gap,
    annualSavings,
    monthlySavings: annualSavings / 12,
    savingsRate,
    feasibility: gap <= 0 ? "on_track" : savingsRate > 0.5 ? "very_aggressive" : savingsRate > 0.3 ? "aggressive" : savingsRate > 0.2 ? "moderate" : "achievable",
    allocation: {
      to401k: Math.min(23000, annualSavings),
      toRoth: Math.min(7500, Math.max(0, annualSavings - 23000)),
      toBrokerage: Math.max(0, annualSavings - 23000 - 7500),
      matchAmount: annualMatch,
    },
  };
}
```

---

## 6. Validators (`validators.ts`)

```typescript
export const MOVE_CONFLICTS: [string, string][] = [
  ["C1", "C2"], ["C3", "C8"],
  ["W0", "W1"], ["W0", "W7"], ["W1", "W7"],
  ["W2", "W9"], ["W3", "W8"], ["W4", "W10"],
  ["X1", "W8"], ["X4", "W10"], ["L1", "L5"],
  ["W11", "W2"], ["W11", "W3"], ["W11", "W4"],
  ["W11", "W8"], ["W11", "W9"], ["W11", "W10"],
];

export function detectConflicts(moves: Move[]): { moveId: string; conflictsWith: string }[] {
  const enabled = new Set(moves.filter(m => m.enabled).map(m => m.id));
  const conflicts: { moveId: string; conflictsWith: string }[] = [];
  for (const [a, b] of MOVE_CONFLICTS) {
    if (enabled.has(a) && enabled.has(b)) {
      conflicts.push({ moveId: a, conflictsWith: b });
    }
  }
  return conflicts;
}
```

---

## 7. Public API (`index.ts`)

```typescript
export { simulate } from './engine';
export { solveGoal } from './goal-solver';
export { detectConflicts, MOVE_CONFLICTS } from './validators';
export { computeFederalTax, computeCGTax, marginalCGRate, marginalOrdinaryRate, computeSSBenefit, computeStateTax } from './tax';
export { computeW0 } from './w0-queue';
export { computeSensitivity } from './sensitivity';
export type { UserPlan, YearResult, SimulationResult, SimulationSummary, Move, GoalSolverResult, Scenario, ScenarioComparison } from './types';
export { DEFAULT_PLAN, DEFAULT_MOVES, FEDERAL_BRACKETS_MFJ, FEDERAL_BRACKETS_SINGLE, CG_THRESHOLDS, STATE_TAX_RATES } from './constants';
```

---

## 8. Engine Tests

Test against known spreadsheet outputs. At minimum:

| Test | Key Assertions |
|------|---------------|
| Default plan (age 41, retire 55, default moves) | NW at 55, 60, 70, 80 within $1 of spreadsheet |
| All moves OFF | FAIL by age 56-58 |
| SS at 62 vs 67 vs 70 | Benefit matches age factor formula |
| Zero growth rates | Balances change only from contributions/withdrawals |
| High Roth conversion ($100K/yr) | Federal tax spikes, Roth grows faster |
| W0 ON, W1 OFF | Portfolio sells are lower (gap-filling only) |
| Bear case -10% | Fails earlier than base |
| Single filer | All brackets use SINGLE thresholds |

---

# PART B: DATABASE & AUTH

## 9. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  mode          String    @default("velocity")
  plans         Plan[]
  subscription  Subscription?
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Plan {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String     @default("My Plan")
  data      Json       // Full UserPlan object
  scenarios Scenario[]
  isActive  Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  @@index([userId])
}

model Scenario {
  id        String   @id @default(cuid())
  planId    String
  plan      Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  name      String
  snapshot  Json     // Frozen SimulationResult
  config    Json     // UserPlan at snapshot time
  createdAt DateTime @default(now())
  @@index([planId])
}

model Subscription {
  id               String    @id @default(cuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId String?   @unique
  stripePriceId    String?
  stripeSubId      String?   @unique
  tier             String    @default("free")
  status           String    @default("active")
  currentPeriodEnd DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

---

## 10. Auth (NextAuth v5)

```typescript
// apps/web/lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        return valid ? user : null;
      },
    }),
  ],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id, mode: (user as any).mode },
    }),
  },
  pages: { signIn: "/login", newUser: "/onboarding" },
});
```

**Pages:** `/login` (email + Google), `/signup` (with mode selection), `/forgot-password`

---

## 11. tRPC API

### Router Structure

```typescript
const appRouter = router({
  plan: planRouter,
  scenario: scenarioRouter,
  user: userRouter,
  subscription: subscriptionRouter,
});
```

### Plan Router

```typescript
plan.list       // Get user's plans
plan.get        // Get single plan by ID (include scenarios)
plan.create     // Create plan (enforce tier limits: free=1, pro=3, premium=∞)
plan.update     // Update plan data (auto-save)
plan.delete     // Delete plan
plan.simulate   // Run simulation server-side (import from @wealthpath/engine)
```

### Scenario Router

```typescript
scenario.create  // Save snapshot (enforce: free=0, pro=3 per plan, premium=∞)
scenario.delete  // Delete (verify ownership through plan → user)
```

### User Router

```typescript
user.me          // Get current user + subscription
user.setMode     // Switch horizon/velocity
user.updateProfile // Update name
```

### Tier Enforcement

```typescript
export const TIER_LIMITS = {
  free:    { maxPlans: 1, maxScenarios: 0, moveSystem: false, sensitivity: false, cgInsights: false },
  pro:     { maxPlans: 3, maxScenarios: 3, moveSystem: true,  sensitivity: true,  cgInsights: true },
  premium: { maxPlans: Infinity, maxScenarios: Infinity, moveSystem: true, sensitivity: true, cgInsights: true },
};

export async function getUserTier(userId: string): Promise<"free" | "pro" | "premium"> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub || sub.status !== "active") return "free";
  return sub.tier as any;
}
```

---

## 12. Stripe

### Pricing

| Tier | Monthly | Annual |
|------|---------|--------|
| Pro | $12 | $120 |
| Premium | $20 | $200 |

### Checkout endpoint: `POST /api/stripe/checkout`
- Get/create Stripe customer
- Create checkout session with correct price ID
- Return checkout URL

### Webhook endpoint: `POST /api/stripe/webhook`
Handle events:
- `checkout.session.completed` → set tier to pro/premium
- `customer.subscription.updated` → update status/period
- `customer.subscription.deleted` → downgrade to free

---

## 13. Seed Script

```typescript
// prisma/seed.ts — Create demo users for both modes
const marcus = await prisma.user.create({
  data: { email: "demo-velocity@wealthpath.com", name: "Marcus", mode: "velocity", passwordHash: bcrypt.hashSync("demo123", 10) },
});
await prisma.plan.create({ data: { userId: marcus.id, name: "FIRE at 45", data: DEFAULT_PLAN } });

const patricia = await prisma.user.create({
  data: { email: "demo-horizon@wealthpath.com", name: "Patricia", mode: "horizon", passwordHash: bcrypt.hashSync("demo123", 10) },
});
await prisma.plan.create({
  data: { userId: patricia.id, name: "Retire at 62", data: { ...DEFAULT_PLAN, mode: "horizon", personal: { ...DEFAULT_PLAN.personal, currentAge: 57, retirementAge: 62 } } },
});
```

---

## Environment Variables

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```
