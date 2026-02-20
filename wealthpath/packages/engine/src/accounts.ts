// Account balance computations for the 7 account types.
// Each function computes end-of-year balance given prior balance, contributions, withdrawals, growth.

import type { EmployerMatchTier } from './types';

/**
 * Compute the annual 401(k) employee deferral.
 * Supports percent-of-salary and dollar-per-paycheck modes,
 * respects an optional employer max-deferral cap and the IRS elective limit.
 */
export function computeAnnualDeferral(
  grossSalary: number,
  mode: "percent" | "dollar",
  deferralPercent: number,
  deferralDollarPerPaycheck: number,
  payFrequency: number,
  maxDeferralPct: number,
  irsLimit: number,
): number {
  let annual: number;
  if (mode === "dollar") {
    annual = deferralDollarPerPaycheck * payFrequency;
  } else {
    annual = grossSalary * (deferralPercent / 100);
  }

  // Employer max-deferral cap (0 means no cap)
  if (maxDeferralPct > 0) {
    const capAmount = grossSalary * (maxDeferralPct / 100);
    annual = Math.min(annual, capAmount);
  }

  // IRS elective limit
  annual = Math.min(annual, irsLimit);

  return Math.max(0, annual);
}

/**
 * Compute the annual employer match from an N-tier schedule.
 * Each tier specifies a match rate and the band of employee deferral it applies to.
 * Tiers are evaluated in order; each tier consumes employee deferral percentage up to its `upToPct`.
 */
export function computeEmployerMatchFromTiers(
  grossSalary: number,
  employeeDeferralPct: number,
  tiers: EmployerMatchTier[],
): number {
  if (tiers.length === 0 || grossSalary <= 0 || employeeDeferralPct <= 0) return 0;

  let totalMatch = 0;
  let remainingDeferralPct = employeeDeferralPct;

  for (const tier of tiers) {
    if (remainingDeferralPct <= 0) break;
    const applicablePct = Math.min(remainingDeferralPct, tier.upToPct);
    totalMatch += grossSalary * (applicablePct / 100) * (tier.matchPct / 100);
    remainingDeferralPct -= applicablePct;
  }

  return totalMatch;
}

export function growBalance(balance: number, growthRate: number): number {
  return balance * (1 + growthRate);
}

export function computeTraditional401k(
  prevBalance: number,
  growthRate: number,
  contribution: number,
  catchUp: number,
  employerMatch: number,
  rothConversion: number,
  withdrawal: number,
  rolloverOut: number
): number {
  return Math.max(0, (prevBalance + contribution + catchUp + employerMatch) * (1 + growthRate) - rothConversion - withdrawal - rolloverOut);
}

export function computeRoth401k(
  prevBalance: number,
  growthRate: number,
  contribution: number,
  megaBackdoor: number,
  transferOut: number
): number {
  return Math.max(0, (prevBalance + contribution + megaBackdoor) * (1 + growthRate) - transferOut);
}

export function computeTraditionalIRA(
  prevBalance: number,
  growthRate: number,
  rolloverIn: number,
  conversionOut: number,
  withdrawal: number
): number {
  return Math.max(0, (prevBalance + rolloverIn) * (1 + growthRate) - conversionOut - withdrawal);
}

export function computeRothIRA(
  prevBalance: number,
  growthRate: number,
  contribution: number,
  backdoorIn: number,
  roth401kTransferIn: number,
  x4ConversionIn: number,
  withdrawal: number
): number {
  return Math.max(0, (prevBalance + contribution + backdoorIn + roth401kTransferIn + x4ConversionIn) * (1 + growthRate) - withdrawal);
}

export function computePrivatePortfolio(
  prevBalance: number,
  growthRate: number,
  contribution: number,
  sellAmount: number,
  foreignPensionCash: number,
  downsizeEquity: number,
  mortgagePayoff: number,
  debtPayoff: number
): number {
  return Math.max(0, (prevBalance + contribution) * (1 + growthRate) - sellAmount + foreignPensionCash + downsizeEquity - mortgagePayoff - debtPayoff);
}

export function compute529(
  prevBalance: number,
  growthRate: number,
  contribution: number,
  withdrawal: number
): number {
  return Math.max(0, (prevBalance + contribution) * (1 + growthRate) - withdrawal);
}

export function computeForeignPension(
  prevBalance: number,
  growthRate: number,
  liquidated: boolean
): number {
  if (liquidated) return 0;
  return prevBalance * (1 + growthRate);
}
