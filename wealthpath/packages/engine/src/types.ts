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
  id: string;
  enabled: boolean;
  name: string;
  category: MoveCategory;
  startAge: number;
  amount: number;
  unit: MoveUnit;
  description: string;
  conflicts: string[];
  dependencies: string[];
  taxImpact: string;
  notes: string;
}

export type AccountType =
  | "401k"
  | "403b"
  | "traditional_ira"
  | "roth_ira"
  | "sep_ira"
  | "simple_ira"
  | "taxable_brokerage"
  | "hsa";

export interface ProfileAccount {
  id: string;
  accountType: AccountType;
  currentBalance: number;
  annualContribution: number;
  contributionPctOfSalary?: number;
  investmentStrategyPreset: "conservative" | "moderate" | "aggressive" | "custom";
  expectedReturnRate: number;
}

export interface MajorExpenditure {
  label: string;
  year: number;
  amount: number;
}

export interface UserPlan {
  id: string;
  name: string;
  mode: "horizon" | "velocity";
  createdAt: Date;
  updatedAt: Date;

  personal: {
    currentAge: number;
    retirementAge: number;
    filingStatus: "MFJ" | "SINGLE" | "MFS" | "HOH";
    state: string;
    stateEffectiveRate: number;
    gender?: "male" | "female" | "other";
    dependents: number;
    retirementState?: string;
  };

  income: {
    w2Salary: number;
    w9Income: number;
    annualRaise: number;
    partTimeInRetirement: boolean;
    partTimeAmount: number;
    bonusIncome: number;
    commissionIncome?: number;
    rsuIncome?: number;
    otherIncome: number;
    salaryGrowthRate: number;
    // Employee 401(k) deferral
    deferralMode?: "percent" | "dollar";
    deferralPercent?: number;
    deferralDollarPerPaycheck?: number;
    payFrequency?: 12 | 24 | 26 | 52;
    maxDeferralPct?: number;
    // Employer match (N-tier)
    employerMatchTiers?: EmployerMatchTier[];
    // Deprecated — kept for migration from old flat model
    employerMatchPct: number;
    employerMatchCapPct: number;
  };

  socialSecurity: {
    monthlyBenefitAtFRA: number;
    quartersEarned: number;
    claimingAge: number;
    spouseSsBenefit: number;
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
    mortgageEndAge: number;
  };

  expenses: {
    groceries: number;
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
    projectedAnnualAge50Plus: number;
  };

  lifestyle: {
    annualTravelHobby: number;
    expectToRelocate: boolean;
    expectToDownsize: boolean;
    inflationRate: number;
  };

  investment: {
    style: "conservative" | "moderate" | "aggressive";
    growth401k: number;
    growthRothPortfolio: number;
  };

  goalSolver: {
    targetNetWorth: number;
    /** @deprecated Use income.employerMatchTiers instead */
    employerMatchPercent?: number;
  };

  growthRates: {
    traditional401k: number;
    roth401k: number;
    traditionalIRA: number;
    rothIRA: number;
    privatePortfolio: number;
    foreignPension: number;
    plan529: number;
  };

  sensitivity: {
    bearAdjustment: number;
    bullAdjustment: number;
  };

  tax: {
    mode: "BRACKET" | "FLAT";
    standardDeduction: number;
    cgTaxablePortion: number;
    ssTaxablePortion: number;
    flatFederalRate: number;
    deductionType: "standard" | "itemized";
    contributionPreference: "traditional" | "roth" | "both";
    expectedRetirementTaxRate?: number;
    federalTaxBracket?: number;
    stateTaxRate?: number;
    itemizedDeductions?: number;
    taxableBrokerageBalance: number;
    amtApplicable: boolean;
  };

  benefits: {
    hasPension: boolean;
    pensionType?: "defined_benefit" | "defined_contribution";
    pensionMonthlyBenefit?: number;
  };

  accounts: ProfileAccount[];

  expensesRisk: {
    annualLivingExpenses: number;
    healthcareExpenses: number;
    inflationRate: number;
    mortgageBalance: number;
    otherDebt: number;
    majorExpenditures: MajorExpenditure[];
    riskTolerance: "low" | "medium" | "high";
    stocksPct: number;
    bondsPct: number;
    cashPct: number;
    alternativesPct: number;
    preferTaxEfficient: boolean;
  };

  scenarios: {
    rateOfReturnModerate: number;
    inflationScenario: "low" | "medium" | "high";
    rateOfReturnConservative: number;
    rateOfReturnAggressive: number;
    autoContributionIncreasePct: number;
    lifeExpectancy: number;
    lifeExpectancyMax: number;
    simulateMarketCrash: boolean;
  };

  inflation: {
    general: number;
    medical: number;
    incomeGrowth: number;
  };

  moves: Move[];
}

export interface YearResult {
  year: number;
  age: number;
  isRetired: boolean;

  w2Income: number;
  w9Income: number;
  socialSecurity: number;
  otherIncome: number;
  totalIncome: number;

  ordinaryTaxableIncome: number;
  federalTax: number;
  stateTax: number;
  ssTax: number;
  totalTax: number;
  federalMarginalRate: number;
  cgRate: number;

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

  annualCashFlow: number;
  monthlyCashRemaining: number;
  status: "OK" | "FAIL";

  traditional401k: number;
  roth401k: number;
  traditionalIRA: number;
  rothIRA: number;
  privatePortfolio: number;
  plan529: number;
  foreignPension: number;

  rothConversionAmount: number;
  roth401kTransfer: number;
  portfolioSellAmount: number;
  portfolioSellFedTax: number;
  portfolioSellStateTax: number;
  foreignPensionAfterTax: number;
  rothIRAContribution: number;

  totalTaxDeferred: number;
  totalTaxFree: number;
  totalNetWorth: number;

  w0Gap: number;
  w0FromPortfolio: number;
  w0FromTraditional: number;
  w0FromRoth: number;

  bearNetWorth: number;
  bullNetWorth: number;
  bearStatus: "OK" | "FAIL";
  bullStatus: "OK" | "FAIL";

  activeMoves: string[];
}

export interface SimulationSummary {
  firstFailureAge: number | null;
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

  cashFlowWorking: number;
  cashFlowEarlyRetire: number;
  cashFlowPreSS: number;
  cashFlowSSYears: number;
  cashFlowLateRetire: number;

  bearFirstFailureAge: number | null;
  bullFirstFailureAge: number | null;
  bearYearsOfRunway: number;
  bullYearsOfRunway: number;
  bearNWAt80: number;
  bullNWAt80: number;

  cgRateAtRetirement: number;
  yearsAt0CG: number;
  annual0CGHarvestCapacity: number;

  balancesAtRetirement: {
    traditional401k: number;
    roth401k: number;
    rothIRA: number;
    privatePortfolio: number;
    foreignPension: number;
    plan529: number;
  };
}

export interface SimulationResult {
  years: YearResult[];
  summary: SimulationSummary;
}

export interface GoalSolverResult {
  yearsToRetire: number;
  futureValueExisting: number;
  futureValueMatch: number;
  gap: number;
  annualSavings: number;
  monthlySavings: number;
  savingsRate: number;
  feasibility: "on_track" | "achievable" | "moderate" | "aggressive" | "very_aggressive";
  allocation: {
    to401k: number;
    toRoth: number;
    toBrokerage: number;
    matchAmount: number;
  };
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: Date;
  config: Partial<UserPlan>;
  result: SimulationResult;
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

export interface TaxBracket {
  floor: number;
  ceiling: number;
  rate: number;
}

export interface EmployerMatchTier {
  /** Match rate as percentage, e.g. 100 = dollar-for-dollar */
  matchPct: number;
  /** Applies to the first X% of salary deferred in this tier */
  upToPct: number;
}
