// Account balance computations for the 7 account types.
// Each function computes end-of-year balance given prior balance, contributions, withdrawals, growth.

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
