import { computeW0 } from '../src/w0-queue';

describe('computeW0', () => {
  it('returns zeros when no gap', () => {
    const result = computeW0(0, 100000, 100000, 100000, 50000, 'MFJ', 0.0549, 0.75, 30000);
    expect(result.fromPortfolio).toBe(0);
    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(0);
  });

  it('fills gap from portfolio first', () => {
    const result = computeW0(50000, 1000000, 500000, 500000, 0, 'MFJ', 0.0549, 0.75, 30000);
    // With low ordinary income, CG rate is 0%, so effective rate = 0.75 * 0.0549
    expect(result.fromPortfolio).toBeGreaterThan(0);
    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(0);
  });

  it('uses trad when portfolio insufficient', () => {
    const result = computeW0(100000, 10000, 500000, 500000, 0, 'MFJ', 0.0549, 0.75, 30000);
    expect(result.fromPortfolio).toBeGreaterThan(0);
    expect(result.fromTrad).toBeGreaterThan(0);
  });

  it('uses roth as last resort', () => {
    const result = computeW0(100000, 0, 0, 500000, 0, 'MFJ', 0.0549, 0.75, 30000);
    expect(result.fromPortfolio).toBe(0);
    expect(result.fromTrad).toBe(0);
    expect(result.fromRoth).toBe(100000);
  });
});
