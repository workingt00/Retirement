import { computeAnnualDeferral, computeEmployerMatchFromTiers } from '../src/accounts';
import type { EmployerMatchTier } from '../src/types';

describe('computeAnnualDeferral', () => {
  const salary = 180000;
  const irsLimit = 23500;

  it('computes percent mode correctly', () => {
    expect(computeAnnualDeferral(salary, "percent", 10, 0, 24, 0, irsLimit)).toBe(18000);
  });

  it('computes dollar mode correctly (semi-monthly)', () => {
    // $750/paycheck × 24 = $18,000
    expect(computeAnnualDeferral(salary, "dollar", 0, 750, 24, 0, irsLimit)).toBe(18000);
  });

  it('computes dollar mode correctly (biweekly)', () => {
    // $500/paycheck × 26 = $13,000
    expect(computeAnnualDeferral(salary, "dollar", 0, 500, 26, 0, irsLimit)).toBe(13000);
  });

  it('caps at IRS elective limit', () => {
    // 20% of $180K = $36,000 → capped at $23,500
    expect(computeAnnualDeferral(salary, "percent", 20, 0, 24, 0, irsLimit)).toBe(23500);
  });

  it('caps at max deferral percentage', () => {
    // 95% of $180K = $171,000 → capped at 90% = $162,000 → then capped at IRS $23,500
    expect(computeAnnualDeferral(salary, "percent", 95, 0, 24, 90, irsLimit)).toBe(23500);
    // With higher IRS limit to test the 90% cap in isolation
    expect(computeAnnualDeferral(salary, "percent", 95, 0, 24, 90, 999999)).toBe(162000);
  });

  it('returns 0 for 0% deferral', () => {
    expect(computeAnnualDeferral(salary, "percent", 0, 0, 24, 0, irsLimit)).toBe(0);
  });

  it('returns 0 for 0 salary', () => {
    expect(computeAnnualDeferral(0, "percent", 10, 0, 24, 0, irsLimit)).toBe(0);
  });

  it('does not apply max deferral cap when set to 0 (unlimited)', () => {
    // 13% of $180K = $23,400 (under IRS limit)
    expect(computeAnnualDeferral(salary, "percent", 13, 0, 24, 0, irsLimit)).toBe(23400);
  });
});

describe('computeEmployerMatchFromTiers', () => {
  const salary = 180000;

  it('returns 0 with no tiers', () => {
    expect(computeEmployerMatchFromTiers(salary, 10, [])).toBe(0);
  });

  it('returns 0 with 0% deferral', () => {
    const tiers: EmployerMatchTier[] = [{ matchPct: 100, upToPct: 3 }];
    expect(computeEmployerMatchFromTiers(salary, 0, tiers)).toBe(0);
  });

  it('computes single tier: 100% on first 3%', () => {
    const tiers: EmployerMatchTier[] = [{ matchPct: 100, upToPct: 3 }];
    // 3% × $180K × 100% = $5,400
    expect(computeEmployerMatchFromTiers(salary, 10, tiers)).toBe(5400);
  });

  it('computes single tier: 50% on first 6%', () => {
    const tiers: EmployerMatchTier[] = [{ matchPct: 50, upToPct: 6 }];
    // 6% × $180K × 50% = $5,400
    expect(computeEmployerMatchFromTiers(salary, 10, tiers)).toBe(5400);
  });

  it('computes two tiers: 100% on 3%, 50% on next 2%', () => {
    const tiers: EmployerMatchTier[] = [
      { matchPct: 100, upToPct: 3 },
      { matchPct: 50, upToPct: 2 },
    ];
    // Tier 1: 3% × $180K × 100% = $5,400
    // Tier 2: 2% × $180K × 50%  = $1,800
    expect(computeEmployerMatchFromTiers(salary, 10, tiers)).toBe(7200);
  });

  it('handles partial deferral (deferral < tier coverage)', () => {
    const tiers: EmployerMatchTier[] = [
      { matchPct: 100, upToPct: 3 },
      { matchPct: 50, upToPct: 2 },
    ];
    // Employee only defers 2% — only partial tier 1 applies
    // Tier 1: 2% × $180K × 100% = $3,600 (only 2% consumed out of 3% tier)
    // Tier 2: 0% (nothing left to match)
    expect(computeEmployerMatchFromTiers(salary, 2, tiers)).toBe(3600);
  });

  it('handles deferral exactly at tier boundary', () => {
    const tiers: EmployerMatchTier[] = [
      { matchPct: 100, upToPct: 3 },
      { matchPct: 50, upToPct: 2 },
    ];
    // Employee defers exactly 3% — fills tier 1, nothing for tier 2
    expect(computeEmployerMatchFromTiers(salary, 3, tiers)).toBe(5400);
  });

  it('handles deferral between tiers', () => {
    const tiers: EmployerMatchTier[] = [
      { matchPct: 100, upToPct: 3 },
      { matchPct: 50, upToPct: 2 },
    ];
    // Employee defers 4% — fills tier 1 (3%), partial tier 2 (1%)
    // Tier 1: 3% × $180K × 100% = $5,400
    // Tier 2: 1% × $180K × 50%  = $900
    expect(computeEmployerMatchFromTiers(salary, 4, tiers)).toBe(6300);
  });

  it('excess deferral beyond all tiers gets no match', () => {
    const tiers: EmployerMatchTier[] = [{ matchPct: 100, upToPct: 3 }];
    // Deferring 20% but only 3% is matched
    expect(computeEmployerMatchFromTiers(salary, 20, tiers)).toBe(5400);
  });

  it('handles three tiers', () => {
    const tiers: EmployerMatchTier[] = [
      { matchPct: 100, upToPct: 2 },
      { matchPct: 75, upToPct: 2 },
      { matchPct: 50, upToPct: 2 },
    ];
    // Tier 1: 2% × $180K × 100% = $3,600
    // Tier 2: 2% × $180K × 75%  = $2,700
    // Tier 3: 2% × $180K × 50%  = $1,800
    expect(computeEmployerMatchFromTiers(salary, 10, tiers)).toBe(8100);
  });

  it('returns 0 for 0 salary', () => {
    const tiers: EmployerMatchTier[] = [{ matchPct: 100, upToPct: 3 }];
    expect(computeEmployerMatchFromTiers(0, 10, tiers)).toBe(0);
  });
});
