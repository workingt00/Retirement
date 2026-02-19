import { computeFederalTax, computeCGTax, marginalCGRate, marginalOrdinaryRate, computeSSBenefit, computeStateTax } from '../src/tax';

describe('computeFederalTax', () => {
  it('returns 0 for income below standard deduction (MFJ)', () => {
    expect(computeFederalTax(25000, 'MFJ', 30000)).toBe(0);
  });

  it('computes 10% bracket correctly (MFJ)', () => {
    // 50000 - 30000 = 20000 taxable, all in 10% bracket (ceiling 23850)
    expect(computeFederalTax(50000, 'MFJ', 30000)).toBeCloseTo(2000, 0);
  });

  it('computes multi-bracket tax (MFJ)', () => {
    // 180000 - 30000 = 150000 taxable
    // 10%: 23850 * 0.10 = 2385
    // 12%: (96950 - 23850) * 0.12 = 8772
    // 22%: (150000 - 96950) * 0.22 = 11671
    // Total = 22828
    const tax = computeFederalTax(180000, 'MFJ', 30000);
    expect(tax).toBeCloseTo(22828, 0);
  });

  it('uses SINGLE brackets', () => {
    // 50000 - 15000 = 35000 taxable
    // 10%: 11925 * 0.10 = 1192.5
    // 12%: (35000 - 11925) * 0.12 = 2769
    // Total = 3961.5
    const tax = computeFederalTax(50000, 'SINGLE', 15000);
    expect(tax).toBeCloseTo(3961.5, 0);
  });
});

describe('computeCGTax', () => {
  it('returns 0 for gains in 0% bracket', () => {
    // Ordinary taxable = 0, gains = 50000, MFJ 0% threshold = 96700
    expect(computeCGTax(50000, 0, 'MFJ', 0.75)).toBe(0);
  });

  it('taxes at 15% when ordinary income fills 0% bracket', () => {
    // Ordinary taxable = 100000 (above 96700), all gains at 15%
    const tax = computeCGTax(100000, 100000, 'MFJ', 0.75);
    expect(tax).toBeCloseTo(100000 * 0.75 * 0.15, 0);
  });

  it('handles split across 0% and 15% brackets', () => {
    // Ordinary = 80000, room at 0% = 96700 - 80000 = 16700
    // Gains taxable = 100000 * 0.75 = 75000
    // At 0%: 16700, At 15%: 75000 - 16700 = 58300
    const tax = computeCGTax(100000, 80000, 'MFJ', 0.75);
    expect(tax).toBeCloseTo(58300 * 0.15, 0);
  });
});

describe('marginalCGRate', () => {
  it('returns 0 below zero threshold', () => {
    expect(marginalCGRate(50000, 'MFJ')).toBe(0);
  });

  it('returns 0.15 between thresholds', () => {
    expect(marginalCGRate(100000, 'MFJ')).toBe(0.15);
  });

  it('returns 0.20 above fifteen threshold', () => {
    expect(marginalCGRate(700000, 'MFJ')).toBe(0.20);
  });
});

describe('marginalOrdinaryRate', () => {
  it('returns 10% for low income', () => {
    expect(marginalOrdinaryRate(10000, 'MFJ')).toBe(0.10);
  });

  it('returns 22% for mid income', () => {
    expect(marginalOrdinaryRate(150000, 'MFJ')).toBe(0.22);
  });
});

describe('computeSSBenefit', () => {
  it('computes benefit at FRA (67)', () => {
    const benefit = computeSSBenefit(3000, 67, 40);
    expect(benefit).toBeCloseTo(36000, 0); // 3000 * 12 * 1.0
  });

  it('reduces for early claiming (62)', () => {
    const benefit = computeSSBenefit(3000, 62, 40);
    // ageFactor = 1 - (67-62) * 0.0667 = 1 - 0.3335 = 0.6665
    expect(benefit).toBeCloseTo(3000 * 12 * 0.6665, 0);
  });

  it('increases for delayed claiming (70)', () => {
    const benefit = computeSSBenefit(3000, 70, 40);
    // ageFactor = 1 + (70-67) * 0.08 = 1.24
    expect(benefit).toBeCloseTo(3000 * 12 * 1.24, 0);
  });

  it('scales by quarters earned', () => {
    const benefit = computeSSBenefit(3000, 67, 20);
    expect(benefit).toBeCloseTo(36000 * 0.5, 0);
  });
});

describe('computeStateTax', () => {
  it('computes state tax on income + CG portion', () => {
    const tax = computeStateTax(100000, 50000, 0.75, 0.0549);
    expect(tax).toBeCloseTo((100000 + 50000 * 0.75) * 0.0549, 0);
  });

  it('returns 0 for no-tax state', () => {
    expect(computeStateTax(100000, 50000, 0.75, 0)).toBe(0);
  });
});
