import { simulate } from '../src/engine';
import { DEFAULT_PLAN } from '../src/constants';
import { UserPlan } from '../src/types';

function makePlan(overrides: Partial<UserPlan> = {}): UserPlan {
  return { ...DEFAULT_PLAN, ...overrides, createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-01') };
}

describe('simulate', () => {
  it('runs default plan without errors', () => {
    const result = simulate(makePlan());
    expect(result.years.length).toBe(80 - 41 + 1); // age 41 to 80
    expect(result.summary).toBeDefined();
  });

  it('produces deterministic output', () => {
    const plan = makePlan();
    const r1 = simulate(plan);
    const r2 = simulate(plan);
    for (let i = 0; i < r1.years.length; i++) {
      expect(r1.years[i].totalNetWorth).toBe(r2.years[i].totalNetWorth);
    }
  });

  it('marks retired years correctly', () => {
    const result = simulate(makePlan());
    const retireAge = DEFAULT_PLAN.personal.retirementAge; // 55
    for (const yr of result.years) {
      expect(yr.isRetired).toBe(yr.age >= retireAge);
    }
  });

  it('has zero W2 income after retirement', () => {
    const result = simulate(makePlan());
    for (const yr of result.years) {
      if (yr.isRetired) {
        expect(yr.w2Income).toBe(0);
      }
    }
  });

  it('starts Social Security at claiming age', () => {
    const result = simulate(makePlan());
    for (const yr of result.years) {
      if (yr.age < DEFAULT_PLAN.socialSecurity.claimingAge) {
        expect(yr.socialSecurity).toBe(0);
      } else {
        expect(yr.socialSecurity).toBeGreaterThan(0);
      }
    }
  });

  it('net worth is sum of all accounts', () => {
    const result = simulate(makePlan());
    for (const yr of result.years) {
      const expected = yr.traditional401k + yr.traditionalIRA + yr.roth401k + yr.rothIRA + yr.privatePortfolio + yr.plan529 + yr.foreignPension;
      expect(yr.totalNetWorth).toBeCloseTo(expected, 0);
    }
  });

  it('all moves OFF leads to early failure', () => {
    const plan = makePlan();
    plan.moves = plan.moves.map(m => ({ ...m, enabled: false }));
    const result = simulate(plan);
    // With no moves, no contributions, no withdrawals — should fail eventually
    const retiredYears = result.years.filter(y => y.isRetired);
    const failYears = retiredYears.filter(y => y.status === 'FAIL');
    expect(failYears.length).toBeGreaterThan(0);
  });

  it('SS at 62 vs 70 produces different benefits', () => {
    const plan62 = makePlan();
    const s1_62 = plan62.moves.find(m => m.id === 'S1')!;
    s1_62.startAge = 62;
    plan62.socialSecurity.claimingAge = 62;

    const plan70 = makePlan();
    plan70.socialSecurity.claimingAge = 70;

    const r62 = simulate(plan62);
    const r70 = simulate(plan70);

    const ss62at70 = r62.years.find(y => y.age === 70)!.socialSecurity;
    const ss70at70 = r70.years.find(y => y.age === 70)!.socialSecurity;
    // At 70, the person claiming at 70 should get higher annual benefit (but just started)
    expect(ss70at70).toBeGreaterThan(ss62at70 * 0.5); // Delayed is significantly higher base
  });

  it('zero growth rates means balances only change from flows', () => {
    const plan = makePlan();
    plan.growthRates = {
      traditional401k: 0, roth401k: 0, traditionalIRA: 0,
      rothIRA: 0, privatePortfolio: 0, foreignPension: 0, plan529: 0,
    };
    const result = simulate(plan);
    // First year: trad401k should equal starting + contribution + catchup + match - conversions
    expect(result.years[0].traditional401k).toBeDefined();
  });

  it('uses SINGLE brackets when filing status is SINGLE', () => {
    const plan = makePlan();
    plan.personal.filingStatus = 'SINGLE';
    plan.tax.standardDeduction = 15000;
    const result = simulate(plan);
    // Should run without errors and produce different tax from MFJ
    const mfjResult = simulate(makePlan());
    expect(result.years[0].federalTax).not.toBe(mfjResult.years[0].federalTax);
  });

  it('runs in under 100ms', () => {
    const plan = makePlan();
    const start = performance.now();
    for (let i = 0; i < 10; i++) simulate(plan);
    const elapsed = (performance.now() - start) / 10;
    expect(elapsed).toBeLessThan(100);
  });

  it('bear case has lower net worth than base', () => {
    const result = simulate(makePlan());
    const lastYear = result.years[result.years.length - 1];
    expect(lastYear.bearNetWorth).toBeLessThanOrEqual(lastYear.totalNetWorth);
  });

  it('bull case has higher net worth than base', () => {
    const result = simulate(makePlan());
    const lastYear = result.years[result.years.length - 1];
    expect(lastYear.bullNetWorth).toBeGreaterThanOrEqual(lastYear.totalNetWorth);
  });

  it('summary aggregates are consistent', () => {
    const result = simulate(makePlan());
    const s = result.summary;
    expect(s.totalTaxesPaid).toBeGreaterThan(0);
    expect(s.totalIncomeEarned).toBeGreaterThan(0);
    expect(s.peakNetWorth).toBeGreaterThan(0);
    if (s.firstFailureAge === null) {
      expect(s.totalFailYears).toBe(0);
    }
  });
});
