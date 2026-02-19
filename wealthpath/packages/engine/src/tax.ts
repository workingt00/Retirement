import {
  FEDERAL_BRACKETS_MFJ,
  FEDERAL_BRACKETS_SINGLE,
  FEDERAL_BRACKETS_MFS,
  FEDERAL_BRACKETS_HOH,
  CG_THRESHOLDS,
} from './constants';
import type { TaxBracket } from './types';

type FilingStatus = "MFJ" | "SINGLE" | "MFS" | "HOH";

function getBrackets(filingStatus: FilingStatus): TaxBracket[] {
  switch (filingStatus) {
    case "MFJ": return FEDERAL_BRACKETS_MFJ;
    case "MFS": return FEDERAL_BRACKETS_MFS;
    case "HOH": return FEDERAL_BRACKETS_HOH;
    default: return FEDERAL_BRACKETS_SINGLE;
  }
}

function getCGThresholds(filingStatus: FilingStatus) {
  return CG_THRESHOLDS[filingStatus] ?? CG_THRESHOLDS.SINGLE;
}

export function computeFederalTax(
  ordinaryIncome: number,
  filingStatus: FilingStatus,
  standardDeduction: number
): number {
  const brackets = getBrackets(filingStatus);
  const taxable = Math.max(0, ordinaryIncome - standardDeduction);

  let tax = 0;
  for (const bracket of brackets) {
    const inBracket = Math.max(0, Math.min(taxable, bracket.ceiling) - bracket.floor);
    tax += inBracket * bracket.rate;
  }
  return tax;
}

export function computeFederalTaxFlat(
  ordinaryIncome: number,
  standardDeduction: number,
  flatRate: number
): number {
  return Math.max(0, ordinaryIncome - standardDeduction) * flatRate;
}

export function computeCGTax(
  gains: number,
  ordinaryTaxableIncome: number,
  filingStatus: FilingStatus,
  cgTaxablePortion: number = 0.75
): number {
  const t = getCGThresholds(filingStatus);
  const taxableGains = gains * cgTaxablePortion;

  if (taxableGains <= 0) return 0;

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
  filingStatus: FilingStatus
): number {
  const t = getCGThresholds(filingStatus);
  if (ordinaryTaxableIncome < t.zero) return 0;
  if (ordinaryTaxableIncome < t.fifteen) return 0.15;
  return 0.20;
}

export function marginalOrdinaryRate(
  taxableIncome: number,
  filingStatus: FilingStatus
): number {
  const brackets = getBrackets(filingStatus);
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].floor) return brackets[i].rate;
  }
  return brackets[0].rate;
}

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

export function computeStateTax(
  taxableIncome: number,
  portfolioGains: number,
  cgPortion: number,
  stateRate: number
): number {
  return (taxableIncome + portfolioGains * cgPortion) * stateRate;
}
