# AGENT 0: Shared Types, Interfaces & Constants

> **Every agent must read this file first.** It defines the data contracts that all subsystems share.  
> Location: `packages/engine/src/types.ts` + `packages/engine/src/constants.ts`

---

## Project Overview

**WealthPath** is a subscription-based retirement planning web app with a TypeScript simulation engine derived from a proven Excel model (2,371 formulas, 38 financial moves, 7 account types, progressive tax brackets).

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Radix UI + Zustand + Prisma + PostgreSQL + Stripe + NextAuth

**Monorepo structure (Turborepo):**
```
wealthpath/
├── packages/
│   └── engine/              # Shared simulation engine (Agent 1)
│       ├── src/
│       │   ├── types.ts
│       │   ├── constants.ts
│       │   ├── engine.ts
│       │   ├── tax.ts
│       │   ├── accounts.ts
│       │   ├── moves.ts
│       │   ├── w0-queue.ts
│       │   ├── sensitivity.ts
│       │   ├── goal-solver.ts
│       │   └── validators.ts
│       └── __tests__/
├── apps/
│   └── web/                 # Next.js app (Agents 2-5)
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (marketing)/
│       │   └── (app)/
│       │       ├── dashboard/
│       │       ├── strategy/
│       │       ├── scenarios/
│       │       ├── insights/
│       │       ├── timeline/
│       │       └── settings/
│       ├── components/
│       │   ├── shared/
│       │   ├── horizon/     # 50+ mode (warm, guided)
│       │   └── velocity/    # 25-49 mode (dense, dark)
│       ├── hooks/
│       ├── stores/
│       └── lib/
├── prisma/
└── turbo.json
```

---

## Core Data Types

### UserPlan (the canonical user data object)

```typescript
export interface UserPlan {
  id: string;
  name: string;
  mode: "horizon" | "velocity";
  createdAt: Date;
  updatedAt: Date;

  personal: {
    currentAge: number;              // 18-80
    retirementAge: number;           // 30-80
    filingStatus: "MFJ" | "SINGLE";
    state: string;                   // US state name
    stateEffectiveRate: number;      // Auto-looked up from STATE_TAX_RATES
  };

  income: {
    w2Salary: number;                // Annual gross W2
    w9Income: number;                // Annual 1099/freelance
    annualRaise: number;             // Percentage (e.g., 3 = 3%)
    partTimeInRetirement: boolean;
    partTimeAmount: number;
  };

  socialSecurity: {
    monthlyBenefitAtFRA: number;     // Estimated at age 67
    quartersEarned: number;          // 0-40
    claimingAge: number;             // 62-70
  };

  balances: {
    traditional401k: number;
    rothIRA: number;
    privatePortfolio: number;
    foreignPension: number;
    plan529: number;
  };

  housing: {
    ownershipType: "own_mortgage" | "own_free" | "rent";
    monthlyMortgage: number;
    monthlyPropertyTax: number;
    monthlyInsurance: number;
    monthlyHOA: number;
    mortgageBalance: number;
    mortgageEndAge: number;          // Age when last payment made
  };

  expenses: {
    groceries: number;               // Monthly
    diningOut: number;
    kidsExpenses: number;
    utilities: {
      gas: number;
      electricity: number;
      water: number;
      exterminator: number;
    };
    subscriptions: {
      amazonPrime: number;
      instacart: number;
      walmart: number;
      homeSecurity: number;
      streaming: number;
      selfDriving: number;
      other: number;
    };
    otherSpending: {
      clothes: number;
      sports: number;
      gym: number;
      storage: number;
      onlineGames: number;
      miscellaneous: number;
    };
  };

  healthcare: {
    monthlyPremium: number;
    chronicConditions: "none" | "minor" | "significant";
    projectedAnnualAge50Plus: number; // Auto: none=18000, minor=20000, significant=24000
  };

  lifestyle: {
    annualTravelHobby: number;       // Discretionary
    expectToRelocate: boolean;
    expectToDownsize: boolean;
    inflationRate: number;           // Percentage (e.g., 3)
  };

  investment: {
    style: "conservative" | "moderate" | "aggressive";
    growth401k: number;              // Auto: conservative=0.07, moderate=0.10, aggressive=0.13
    growthRothPortfolio: number;     // Auto: conservative=0.08, moderate=0.12, aggressive=0.15
  };

  goalSolver: {
    targetNetWorth: number;
    employerMatchPercent: number;    // e.g., 4 = 4%
  };

  growthRates: {
    traditional401k: number;         // Decimal (0.10 = 10%)
    roth401k: number;
    traditionalIRA: number;
    rothIRA: number;
    privatePortfolio: number;
    foreignPension: number;
    plan529: number;
  };

  sensitivity: {
    bearAdjustment: number;          // e.g., -0.04
    bullAdjustment: number;          // e.g., +0.02
  };

  tax: {
    mode: "BRACKET" | "FLAT";
    standardDeduction: number;       // Auto: MFJ=30000, SINGLE=15000
    cgTaxablePortion: number;        // Default 0.75
    ssTaxablePortion: number;        // Default 0.85
    flatFederalRate: number;         // Only for FLAT mode, default 0.139
  };

  inflation: {
    general: number;                 // e.g., 1.03
    medical: number;                 // e.g., 1.06
    incomeGrowth: number;            // e.g., 1.03
  };

  moves: Move[];
}
```

### Move

```typescript
export type MoveCategory =
  | "contribution"
  | "conversion"
  | "withdrawal"
  | "income"
  | "social_security"
  | "lifestyle"
  | "rule";

export type MoveUnit = "$" | "%" | "auto" | "full_balance";

export interface Move {
  id: string;              // C1, C2, X1, W0, W1, I1, S1, L1, R1, etc.
  enabled: boolean;
  name: string;
  category: MoveCategory;
  startAge: number;
  amount: number;
  unit: MoveUnit;
  description: string;
  conflicts: string[];     // IDs of conflicting moves
  dependencies: string[];
  taxImpact: string;
  notes: string;
}
```

### YearResult (one row of simulation output)

```typescript
export interface YearResult {
  year: number;
  age: number;
  isRetired: boolean;

  // Income
  w2Income: number;
  w9Income: number;
  socialSecurity: number;
  otherIncome: number;           // I1 + I2 + I3
  totalIncome: number;

  // Taxes
  ordinaryTaxableIncome: number; // Column M: taxable income excluding SS
  federalTax: number;
  stateTax: number;
  ssTax: number;
  totalTax: number;
  federalMarginalRate: number;
  cgRate: number;                // 0, 0.15, or 0.20

  // Expenses (9 categories)
  housing: number;
  lumpyExpenses: number;
  carExpenses: number;
  groceries: number;
  bills: number;
  lifestyle: number;
  medical: number;
  miscellaneous: number;
  kids: number;
  totalExpenses: number;

  // Cash Flow
  annualCashFlow: number;
  monthlyCashRemaining: number;
  status: "OK" | "FAIL";

  // Account Balances (end of year)
  traditional401k: number;
  roth401k: number;
  traditionalIRA: number;
  rothIRA: number;
  privatePortfolio: number;
  plan529: number;
  foreignPension: number;

  // Flows
  rothConversionAmount: number;    // AB: Trad -> Roth conversion
  roth401kTransfer: number;        // AD: Roth 401k -> Roth IRA
  portfolioSellAmount: number;     // AI: total sold from portfolio
  portfolioSellFedTax: number;
  portfolioSellStateTax: number;
  foreignPensionAfterTax: number;
  rothIRAContribution: number;     // AG: display

  // Aggregates
  totalTaxDeferred: number;        // AR: Trad 401k + Trad IRA
  totalTaxFree: number;            // AS: Roth 401k + Roth IRA + Portfolio
  totalNetWorth: number;           // AR + AS + 529 + Foreign

  // W0 breakdown
  w0Gap: number;
  w0FromPortfolio: number;
  w0FromTraditional: number;
  w0FromRoth: number;

  // Sensitivity
  bearNetWorth: number;
  bullNetWorth: number;
  bearStatus: "OK" | "FAIL";
  bullStatus: "OK" | "FAIL";

  // Active moves
  activeMoves: string[];
}
```

### SimulationResult (full output)

```typescript
export interface SimulationResult {
  years: YearResult[];
  summary: SimulationSummary;
}

export interface SimulationSummary {
  firstFailureAge: number | null;   // null = never fails
  yearsOfRunway: number;
  totalFailYears: number;

  netWorthAtRetirement: number;
  netWorthAt60: number;
  netWorthAt65: number;
  netWorthAt70: number;
  netWorthAt75: number;
  netWorthAt80: number;
  peakNetWorth: number;

  totalTaxesPaid: number;
  totalIncomeEarned: number;
  totalExpenses: number;
  totalSSReceived: number;
  totalPortfolioSold: number;
  effectiveTaxRate: number;

  // By phase
  cashFlowWorking: number;
  cashFlowEarlyRetire: number;
  cashFlowPreSS: number;
  cashFlowSSYears: number;
  cashFlowLateRetire: number;

  // Sensitivity
  bearFirstFailureAge: number | null;
  bullFirstFailureAge: number | null;
  bearYearsOfRunway: number;
  bullYearsOfRunway: number;
  bearNWAt80: number;
  bullNWAt80: number;

  // CG insights
  cgRateAtRetirement: number;
  yearsAt0CG: number;
  annual0CGHarvestCapacity: number;

  // Account balances at retirement
  balancesAtRetirement: {
    traditional401k: number;
    roth401k: number;
    rothIRA: number;
    privatePortfolio: number;
    foreignPension: number;
    plan529: number;
  };
}
```

### Goal Solver Result

```typescript
export interface GoalSolverResult {
  yearsToRetire: number;
  futureValueExisting: number;
  futureValueMatch: number;
  gap: number;
  annualSavings: number;
  monthlySavings: number;
  savingsRate: number;           // As decimal (0.20 = 20%)
  feasibility: "on_track" | "achievable" | "moderate" | "aggressive" | "very_aggressive";
  allocation: {
    to401k: number;
    toRoth: number;
    toBrokerage: number;
    matchAmount: number;
  };
}
```

### Scenario

```typescript
export interface Scenario {
  id: string;
  name: string;
  createdAt: Date;
  config: Partial<UserPlan>;      // The plan config at snapshot time
  result: SimulationResult;       // Frozen simulation output
}

export interface ScenarioComparison {
  current: SimulationResult;
  scenarios: Scenario[];
  deltas: {
    scenarioId: string;
    deltaNWAt80: number;
    deltaTotalTaxes: number;
    deltaFailYears: number;
    verdict: "better" | "worse" | "similar";
  }[];
}
```

---

## Constants

### Federal Tax Brackets (2025)

```typescript
export const FEDERAL_BRACKETS_MFJ = [
  { floor: 0,      ceiling: 23850,    rate: 0.10 },
  { floor: 23850,  ceiling: 96950,    rate: 0.12 },
  { floor: 96950,  ceiling: 206700,   rate: 0.22 },
  { floor: 206700, ceiling: 394600,   rate: 0.24 },
  { floor: 394600, ceiling: 501050,   rate: 0.32 },
  { floor: 501050, ceiling: 751600,   rate: 0.35 },
  { floor: 751600, ceiling: Infinity, rate: 0.37 },
];

export const FEDERAL_BRACKETS_SINGLE = [
  { floor: 0,      ceiling: 11925,    rate: 0.10 },
  { floor: 11925,  ceiling: 48475,    rate: 0.12 },
  { floor: 48475,  ceiling: 103350,   rate: 0.22 },
  { floor: 103350, ceiling: 197300,   rate: 0.24 },
  { floor: 197300, ceiling: 250525,   rate: 0.32 },
  { floor: 250525, ceiling: 626350,   rate: 0.35 },
  { floor: 626350, ceiling: Infinity, rate: 0.37 },
];
```

### Capital Gains Brackets

```typescript
export const CG_THRESHOLDS = {
  MFJ:    { zero: 96700,  fifteen: 600050 },
  SINGLE: { zero: 48350,  fifteen: 533400 },
};
```

### State Tax Rates (all 50 states)

```typescript
export const STATE_TAX_RATES: Record<string, number> = {
  "Alabama": 0.05, "Alaska": 0, "Arizona": 0.025, "Arkansas": 0.044,
  "California": 0.133, "Colorado": 0.044, "Connecticut": 0.0699,
  "Delaware": 0.066, "Florida": 0, "Georgia": 0.0549, "Hawaii": 0.11,
  "Idaho": 0.058, "Illinois": 0.0495, "Indiana": 0.0305, "Iowa": 0.057,
  "Kansas": 0.057, "Kentucky": 0.04, "Louisiana": 0.0425, "Maine": 0.0715,
  "Maryland": 0.0575, "Massachusetts": 0.05, "Michigan": 0.0425,
  "Minnesota": 0.0985, "Mississippi": 0.05, "Missouri": 0.048,
  "Montana": 0.059, "Nebraska": 0.0664, "Nevada": 0, "New Hampshire": 0,
  "New Jersey": 0.1075, "New Mexico": 0.059, "New York": 0.109,
  "North Carolina": 0.045, "North Dakota": 0.029, "Ohio": 0.0375,
  "Oklahoma": 0.0475, "Oregon": 0.099, "Pennsylvania": 0.0307,
  "Rhode Island": 0.0599, "South Carolina": 0.065, "South Dakota": 0,
  "Tennessee": 0, "Texas": 0, "Utah": 0.0465, "Vermont": 0.0875,
  "Virginia": 0.0575, "Washington": 0, "West Virginia": 0.0512,
  "Wisconsin": 0.0753, "Wyoming": 0,
};
```

### Default Moves (38 total)

```typescript
export const DEFAULT_MOVES: Move[] = [
  // Contributions
  { id: "C1", enabled: true,  name: "Contribute to Traditional 401k", category: "contribution", startAge: 41, amount: 23000, unit: "$", description: "Pre-tax salary deferral", conflicts: ["C2"], dependencies: [], taxImpact: "Reduces taxable income; taxed on withdrawal", notes: "$23k limit 2024" },
  { id: "C2", enabled: false, name: "Contribute to Roth 401k", category: "contribution", startAge: 41, amount: 23000, unit: "$", description: "After-tax salary deferral", conflicts: ["C1"], dependencies: [], taxImpact: "No deduction; tax-free withdrawal", notes: "Same $23k limit shared with C1" },
  { id: "C3", enabled: true,  name: "Contribute to Roth IRA", category: "contribution", startAge: 41, amount: 7500, unit: "$", description: "After-tax personal Roth", conflicts: ["C8"], dependencies: [], taxImpact: "Tax-free growth and withdrawal", notes: "$7,500/yr limit" },
  { id: "C4", enabled: true,  name: "Contribute to Private Portfolio", category: "contribution", startAge: 41, amount: 13000, unit: "$", description: "Taxable brokerage", conflicts: [], dependencies: [], taxImpact: "Capital gains on growth", notes: "No limits" },
  { id: "C5", enabled: true,  name: "Contribute to 529 Plan", category: "contribution", startAge: 41, amount: 2000, unit: "$", description: "College savings", conflicts: [], dependencies: [], taxImpact: "Tax-free for education", notes: "" },
  { id: "C7", enabled: false, name: "Mega Backdoor Roth", category: "contribution", startAge: 41, amount: 0, unit: "$", description: "After-tax 401k converted to Roth", conflicts: [], dependencies: [], taxImpact: "After-tax; conversion gains taxable", notes: "Requires employer support" },
  { id: "C8", enabled: false, name: "Backdoor Roth IRA", category: "contribution", startAge: 41, amount: 7500, unit: "$", description: "Trad IRA → Roth bypass", conflicts: ["C3"], dependencies: [], taxImpact: "Tax-neutral if no deductible IRA", notes: "For high earners" },

  // Conversions
  { id: "X1", enabled: true,  name: "Roth Conversion Ladder", category: "conversion", startAge: 47, amount: 45000, unit: "$", description: "Annual Trad→Roth conversion", conflicts: [], dependencies: [], taxImpact: "Ordinary income in conversion year", notes: "5-year rule applies" },
  { id: "X2", enabled: true,  name: "Transfer Roth 401k → Roth IRA", category: "conversion", startAge: 55, amount: 0, unit: "full_balance", description: "One-time Roth consolidation", conflicts: [], dependencies: [], taxImpact: "No tax (Roth to Roth)", notes: "" },
  { id: "X3", enabled: false, name: "Rollover Trad 401k → Trad IRA", category: "conversion", startAge: 55, amount: 0, unit: "full_balance", description: "Consolidate Traditional", conflicts: [], dependencies: [], taxImpact: "No tax (Trad to Trad)", notes: "Enables X4" },
  { id: "X4", enabled: false, name: "Partial Roth Conversion (IRA)", category: "conversion", startAge: 55, amount: 45000, unit: "$", description: "IRA to Roth conversion", conflicts: [], dependencies: ["X3"], taxImpact: "Ordinary income", notes: "After X3 rollover" },

  // Withdrawals
  { id: "W0", enabled: false, name: "Auto-Withdraw (Priority Queue)", category: "withdrawal", startAge: 56, amount: 0, unit: "auto", description: "Tax-optimal auto-withdrawal", conflicts: ["W1", "W7"], dependencies: [], taxImpact: "CG → Ordinary → Tax-free", notes: "Sells only what you need" },
  { id: "W1", enabled: true,  name: "Withdraw from Private Portfolio", category: "withdrawal", startAge: 56, amount: 185000, unit: "$", description: "Flat annual portfolio sell", conflicts: ["W0", "W7"], dependencies: [], taxImpact: "Capital gains tax", notes: "" },
  { id: "W7", enabled: false, name: "Dividend Income from Portfolio", category: "withdrawal", startAge: 56, amount: 0.03, unit: "%", description: "Live off dividends", conflicts: ["W0", "W1"], dependencies: [], taxImpact: "Qualified dividend rate", notes: "Income = balance × yield" },
  { id: "W2", enabled: false, name: "Withdraw from Roth IRA", category: "withdrawal", startAge: 60, amount: 50000, unit: "$", description: "Tax-free Roth withdrawal", conflicts: ["W9"], dependencies: [], taxImpact: "Tax-free after 59.5", notes: "" },
  { id: "W3", enabled: false, name: "Withdraw Trad 401k (Rule of 55)", category: "withdrawal", startAge: 55, amount: 50000, unit: "$", description: "Penalty-free at 55+ if separated", conflicts: ["W8"], dependencies: [], taxImpact: "Ordinary income, no penalty", notes: "Current employer plan only" },
  { id: "W4", enabled: false, name: "Withdraw from Traditional IRA", category: "withdrawal", startAge: 60, amount: 50000, unit: "$", description: "IRA distribution", conflicts: ["W10"], dependencies: [], taxImpact: "Ordinary income", notes: "" },
  { id: "W5", enabled: true,  name: "Liquidate Foreign Pension", category: "withdrawal", startAge: 56, amount: 0, unit: "full_balance", description: "Cash out foreign pension", conflicts: [], dependencies: [], taxImpact: "~35% combined tax", notes: "One-time; proceeds to portfolio" },
  { id: "W6", enabled: false, name: "Use 529 for Education", category: "withdrawal", startAge: 50, amount: 0, unit: "$", description: "529 distribution", conflicts: [], dependencies: [], taxImpact: "Tax-free if qualified", notes: "" },
  { id: "W8", enabled: false, name: "Liquidate Trad 401k", category: "withdrawal", startAge: 55, amount: 0, unit: "full_balance", description: "Lump sum 401k cashout", conflicts: ["W3", "X1"], dependencies: [], taxImpact: "Full income + penalty if <59.5", notes: "Nuclear option" },
  { id: "W9", enabled: false, name: "Liquidate Roth IRA", category: "withdrawal", startAge: 60, amount: 0, unit: "full_balance", description: "Lump sum Roth cashout", conflicts: ["W2"], dependencies: [], taxImpact: "Contributions free; earnings penalized", notes: "" },
  { id: "W10", enabled: false, name: "Liquidate Trad IRA", category: "withdrawal", startAge: 60, amount: 0, unit: "full_balance", description: "Lump sum IRA cashout", conflicts: ["W4", "X4"], dependencies: [], taxImpact: "Full income + penalty if <59.5", notes: "" },
  { id: "W11", enabled: false, name: "Liquidate ALL Accounts", category: "withdrawal", startAge: 55, amount: 0, unit: "full_balance", description: "Cash out everything", conflicts: ["W2","W3","W4","W8","W9","W10"], dependencies: [], taxImpact: "Massive tax hit", notes: "Nuclear option" },

  // Income
  { id: "I1", enabled: false, name: "Part-Time / Freelance Income", category: "income", startAge: 55, amount: 30000, unit: "$", description: "Supplemental retirement income", conflicts: [], dependencies: [], taxImpact: "Ordinary income", notes: "Bridges gap years" },
  { id: "I2", enabled: false, name: "Rental Income", category: "income", startAge: 41, amount: 20000, unit: "$", description: "Net rental income", conflicts: [], dependencies: [], taxImpact: "Ordinary income", notes: "Net after expenses" },
  { id: "I3", enabled: false, name: "Annuity / Pension Payments", category: "income", startAge: 65, amount: 0, unit: "$", description: "Guaranteed income stream", conflicts: [], dependencies: [], taxImpact: "Varies by type", notes: "" },

  // Social Security
  { id: "S1", enabled: true,  name: "Claim Social Security", category: "social_security", startAge: 70, amount: 0, unit: "auto", description: "SS at chosen age", conflicts: [], dependencies: [], taxImpact: "Up to 85% taxable", notes: "62-70, auto-computed" },

  // Lifestyle
  { id: "L1", enabled: false, name: "Sell the House", category: "lifestyle", startAge: 67, amount: 0, unit: "$", description: "Eliminate housing costs", conflicts: ["L5"], dependencies: [], taxImpact: "Up to $500k excluded", notes: "" },
  { id: "L2", enabled: false, name: "Pay Off Mortgage Early", category: "lifestyle", startAge: 55, amount: 0, unit: "$", description: "Lump sum payoff", conflicts: [], dependencies: [], taxImpact: "None", notes: "From portfolio" },
  { id: "L3", enabled: false, name: "ACA Subsidy Optimization", category: "lifestyle", startAge: 55, amount: 0, unit: "$", description: "Manage income for ACA", conflicts: [], dependencies: [], taxImpact: "Keep MAGI in range", notes: "Pre-Medicare only" },
  { id: "L4", enabled: false, name: "Relocate to Lower Cost Area", category: "lifestyle", startAge: 55, amount: 0, unit: "$", description: "Reduce expenses ~20%", conflicts: [], dependencies: [], taxImpact: "Possible state savings", notes: "" },
  { id: "L5", enabled: false, name: "Downsize Home", category: "lifestyle", startAge: 65, amount: 200000, unit: "$", description: "Net equity to portfolio", conflicts: ["L1"], dependencies: [], taxImpact: "Up to $500k excluded", notes: "" },
  { id: "L6", enabled: false, name: "Pay Off Debts", category: "lifestyle", startAge: 41, amount: 0, unit: "$", description: "Lump sum debt payoff", conflicts: [], dependencies: [], taxImpact: "None", notes: "From portfolio" },

  // Rules
  { id: "R1", enabled: true,  name: "401k Catch-Up Contributions", category: "rule", startAge: 50, amount: 7500, unit: "$", description: "Extra 401k at 50+", conflicts: [], dependencies: [], taxImpact: "Same as regular 401k", notes: "$7.5k age 50-59; $11.25k age 60-63" },
  { id: "R2", enabled: true,  name: "Medicare Eligibility", category: "rule", startAge: 65, amount: 0, unit: "$", description: "Medical costs drop", conflicts: [], dependencies: [], taxImpact: "None", notes: "~30% reduction" },
  { id: "R3", enabled: true,  name: "Required Minimum Distributions", category: "rule", startAge: 73, amount: 0, unit: "$", description: "Forced Trad withdrawals", conflicts: [], dependencies: [], taxImpact: "Ordinary income", notes: "" },
  { id: "R4", enabled: true,  name: "Roth 5-Year Rule", category: "rule", startAge: 18, amount: 0, unit: "$", description: "Info: conversions need 5yr", conflicts: [], dependencies: [], taxImpact: "10% penalty if early", notes: "Tracking only" },
  { id: "R5", enabled: true,  name: "No IRA Age Limit", category: "rule", startAge: 18, amount: 0, unit: "$", description: "SECURE Act: any age", conflicts: [], dependencies: [], taxImpact: "Varies", notes: "Info only" },
];
```

### Default UserPlan (for testing and new users)

```typescript
export const DEFAULT_PLAN: UserPlan = {
  id: "",
  name: "My Plan",
  mode: "velocity",
  createdAt: new Date(),
  updatedAt: new Date(),
  personal: { currentAge: 41, retirementAge: 55, filingStatus: "MFJ", state: "Georgia", stateEffectiveRate: 0.0549 },
  income: { w2Salary: 180000, w9Income: 15000, annualRaise: 3, partTimeInRetirement: false, partTimeAmount: 0 },
  socialSecurity: { monthlyBenefitAtFRA: 3000, quartersEarned: 40, claimingAge: 70 },
  balances: { traditional401k: 56000, rothIRA: 5500, privatePortfolio: 200000, foreignPension: 145000, plan529: 0 },
  housing: { ownershipType: "own_mortgage", monthlyMortgage: 2684, monthlyPropertyTax: 300, monthlyInsurance: 250, monthlyHOA: 115, mortgageBalance: 467977, mortgageEndAge: 67 },
  expenses: {
    groceries: 1100, diningOut: 600, kidsExpenses: 350,
    utilities: { gas: 100, electricity: 120, water: 90, exterminator: 75 },
    subscriptions: { amazonPrime: 16, instacart: 11, walmart: 9, homeSecurity: 33, streaming: 18, selfDriving: 100, other: 75 },
    otherSpending: { clothes: 100, sports: 100, gym: 50, storage: 5, onlineGames: 20, miscellaneous: 25 },
  },
  healthcare: { monthlyPremium: 450, chronicConditions: "none", projectedAnnualAge50Plus: 18000 },
  lifestyle: { annualTravelHobby: 43000, expectToRelocate: false, expectToDownsize: false, inflationRate: 3 },
  investment: { style: "moderate", growth401k: 0.10, growthRothPortfolio: 0.12 },
  goalSolver: { targetNetWorth: 2000000, employerMatchPercent: 4 },
  growthRates: { traditional401k: 0.10, roth401k: 0.10, traditionalIRA: 0.10, rothIRA: 0.12, privatePortfolio: 0.12, foreignPension: 0.12, plan529: 0.10 },
  sensitivity: { bearAdjustment: -0.04, bullAdjustment: 0.02 },
  tax: { mode: "BRACKET", standardDeduction: 30000, cgTaxablePortion: 0.75, ssTaxablePortion: 0.85, flatFederalRate: 0.139 },
  inflation: { general: 1.03, medical: 1.06, incomeGrowth: 1.03 },
  moves: DEFAULT_MOVES,
};
```

---

## Computed Expense Totals (derived from UserPlan.expenses)

These are the annualized expense totals that feed into the simulation engine. The engine should compute these on the fly, not store them.

```typescript
export function computeAnnualExpenses(plan: UserPlan) {
  const e = plan.expenses;
  return {
    housing: (plan.housing.monthlyMortgage + plan.housing.monthlyPropertyTax + plan.housing.monthlyInsurance + plan.housing.monthlyHOA) * 12,
    groceries: (e.groceries + e.diningOut) * 12,
    bills: (e.utilities.gas + e.utilities.electricity + e.utilities.water + e.utilities.exterminator + e.subscriptions.amazonPrime + e.subscriptions.instacart + e.subscriptions.walmart + e.subscriptions.homeSecurity + e.subscriptions.streaming + e.subscriptions.selfDriving + e.subscriptions.other) * 12,
    lifestyle: plan.lifestyle.annualTravelHobby,
    medical: plan.healthcare.monthlyPremium * 12,
    miscellaneous: (e.otherSpending.clothes + e.otherSpending.sports + e.otherSpending.gym + e.otherSpending.storage + e.otherSpending.onlineGames + e.otherSpending.miscellaneous) * 12,
    kids: e.kidsExpenses * 12,
    housingNonMortgage: (plan.housing.monthlyPropertyTax + plan.housing.monthlyInsurance + plan.housing.monthlyHOA) * 12,
  };
}
```
