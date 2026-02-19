import { YearResult } from './types';

export function computeSensitivity(
  baseResults: YearResult[],
  bearAdj: number,
  bullAdj: number,
  avgGrowth: number,
  retirementAge: number
): { bear: { nw: number; status: "OK" | "FAIL" }[]; bull: { nw: number; status: "OK" | "FAIL" }[] } {
  const bear: { nw: number; status: "OK" | "FAIL" }[] = [];
  const bull: { nw: number; status: "OK" | "FAIL" }[] = [];

  for (let i = 0; i < baseResults.length; i++) {
    const yr = baseResults[i];
    const baseNW = yr.totalNetWorth;

    if (i === 0) {
      bear.push({ nw: baseNW, status: "OK" });
      bull.push({ nw: baseNW, status: "OK" });
    } else {
      const prevBearNW = bear[i - 1].nw;
      const prevBullNW = bull[i - 1].nw;
      const prevBaseNW = baseResults[i - 1].totalNetWorth;
      const nonGrowthDelta = baseNW - prevBaseNW - prevBaseNW * avgGrowth;

      const bearNW = Math.max(0, prevBearNW * (1 + avgGrowth + bearAdj) + nonGrowthDelta);
      const bullNW = Math.max(0, prevBullNW * (1 + avgGrowth + bullAdj) + nonGrowthDelta);

      bear.push({ nw: bearNW, status: bearNW <= 0 && yr.isRetired ? "FAIL" : "OK" });
      bull.push({ nw: bullNW, status: bullNW <= 0 && yr.isRetired ? "FAIL" : "OK" });
    }
  }

  return { bear, bull };
}
