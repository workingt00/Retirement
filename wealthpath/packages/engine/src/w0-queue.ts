import { marginalCGRate, marginalOrdinaryRate } from './tax';

export function computeW0(
  expenseGap: number,
  portfolioBalance: number,
  tradBalance: number,
  rothBalance: number,
  ordinaryTaxableIncome: number,
  filingStatus: "MFJ" | "SINGLE" | "MFS" | "HOH",
  stateRate: number,
  cgPortion: number,
  standardDeduction: number
): { fromPortfolio: number; fromTrad: number; fromRoth: number } {
  if (expenseGap <= 0) return { fromPortfolio: 0, fromTrad: 0, fromRoth: 0 };

  const taxableOrd = Math.max(0, ordinaryTaxableIncome - standardDeduction);

  // Priority 1: Portfolio (capital gains rates)
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

  // Priority 3: Roth (tax-free)
  const remaining2 = Math.max(0, expenseGap - netPortfolio - netTrad);
  const fromRoth = Math.min(remaining2, rothBalance);

  return { fromPortfolio: grossPortfolio, fromTrad: grossTrad, fromRoth };
}
