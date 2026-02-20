import { solveGoal } from '../src/goal-solver';
import { DEFAULT_PLAN } from '../src/constants';
import type { UserPlan } from '../src/types';

describe('solveGoal', () => {
  it('returns result with correct years to retire', () => {
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.yearsToRetire).toBe(14); // 55 - 41
  });

  it('computes future value of existing balances', () => {
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.futureValueExisting).toBeGreaterThan(0);
  });

  it('computes employer match from tiers', () => {
    const plan: UserPlan = {
      ...DEFAULT_PLAN,
      income: {
        ...DEFAULT_PLAN.income,
        deferralMode: "percent",
        deferralPercent: 10,
        employerMatchTiers: [
          { matchPct: 100, upToPct: 3 },
          { matchPct: 50, upToPct: 2 },
        ],
      },
    };
    const result = solveGoal(plan);
    // 3% of 180k * 100% = 5400 + 2% of 180k * 50% = 1800 = 7200/yr
    expect(result.allocation.matchAmount).toBe(7200);
    expect(result.futureValueMatch).toBeGreaterThan(0);
  });

  it('returns 0 match with no tiers and no legacy field', () => {
    // DEFAULT_PLAN has empty tiers and no employerMatchPercent
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.allocation.matchAmount).toBe(0);
    expect(result.futureValueMatch).toBe(0);
  });

  it('returns on_track when existing exceeds target', () => {
    const plan: UserPlan = {
      ...DEFAULT_PLAN,
      goalSolver: { targetNetWorth: 100000 },
    };
    const result = solveGoal(plan);
    expect(result.feasibility).toBe('on_track');
    expect(result.gap).toBe(0);
    expect(result.annualSavings).toBe(0);
  });

  it('allocates savings to 401k first, then Roth, then brokerage', () => {
    const result = solveGoal(DEFAULT_PLAN);
    if (result.annualSavings > 23500) {
      expect(result.allocation.to401k).toBe(23500);
    }
    if (result.annualSavings > 31000) {
      expect(result.allocation.toRoth).toBe(7500);
    }
  });
});
