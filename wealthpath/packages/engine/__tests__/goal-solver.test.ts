import { solveGoal } from '../src/goal-solver';
import { DEFAULT_PLAN } from '../src/constants';

describe('solveGoal', () => {
  it('returns result with correct years to retire', () => {
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.yearsToRetire).toBe(14); // 55 - 41
  });

  it('computes future value of existing balances', () => {
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.futureValueExisting).toBeGreaterThan(0);
  });

  it('includes employer match', () => {
    const result = solveGoal(DEFAULT_PLAN);
    expect(result.futureValueMatch).toBeGreaterThan(0);
    expect(result.allocation.matchAmount).toBe(180000 * 0.04);
  });

  it('returns on_track when existing exceeds target', () => {
    const plan = { ...DEFAULT_PLAN, goalSolver: { targetNetWorth: 100000, employerMatchPercent: 4 } };
    const result = solveGoal(plan);
    expect(result.feasibility).toBe('on_track');
    expect(result.gap).toBe(0);
    expect(result.annualSavings).toBe(0);
  });

  it('allocates savings to 401k first, then Roth, then brokerage', () => {
    const result = solveGoal(DEFAULT_PLAN);
    if (result.annualSavings > 23000) {
      expect(result.allocation.to401k).toBe(23000);
    }
    if (result.annualSavings > 30500) {
      expect(result.allocation.toRoth).toBe(7500);
    }
  });
});
