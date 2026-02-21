import { UserPlan, GoalSolverResult } from './types';
import { computeAnnualDeferral, computeEmployerMatchFromTiers } from './accounts';
import { IRS_401K_ELECTIVE_LIMIT } from './constants';

export function solveGoal(plan: UserPlan): GoalSolverResult {
  const years = plan.personal.retirementAge - plan.personal.currentAge;
  const g = plan.growthRates;
  const avgGrowth = (g.traditional401k + g.privatePortfolio) / 2;

  const fvExisting =
    plan.balances.traditional401k * Math.pow(1 + g.traditional401k, years) +
    plan.balances.rothIRA * Math.pow(1 + g.rothIRA, years) +
    plan.balances.privatePortfolio * Math.pow(1 + g.privatePortfolio, years) +
    plan.balances.foreignPension * Math.pow(1 + g.foreignPension, years) +
    plan.balances.plan529 * Math.pow(1 + g.plan529, years);

  // Compute annual employer match from tiered structure
  const tiers = plan.income.employerMatchTiers ?? [];
  let annualMatch = 0;

  if (tiers.length > 0) {
    const deferral = computeAnnualDeferral(
      plan.income.w2Salary,
      plan.income.deferralMode ?? "percent",
      plan.income.deferralPercent ?? 0,
      plan.income.deferralDollarPerPaycheck ?? 0,
      plan.income.payFrequency ?? 24,
      plan.income.maxDeferralPct ?? 0,
      IRS_401K_ELECTIVE_LIMIT,
    );
    const effectivePct = plan.income.w2Salary > 0 ? (deferral / plan.income.w2Salary) * 100 : 0;
    annualMatch = computeEmployerMatchFromTiers(plan.income.w2Salary, effectivePct, tiers);
  } else if ((plan.goalSolver as Record<string, unknown>).employerMatchPercent != null) {
    // Legacy fallback for unmigrated plans
    annualMatch = plan.income.w2Salary * ((plan.goalSolver as Record<string, unknown>).employerMatchPercent as number) / 100;
  }

  const fvMatch = avgGrowth > 0
    ? annualMatch * (Math.pow(1 + avgGrowth, years) - 1) / avgGrowth
    : annualMatch * years;

  const gap = Math.max(0, plan.goalSolver.targetNetWorth - fvExisting - fvMatch);
  const annualSavings = gap <= 0 ? 0 : gap * avgGrowth / (Math.pow(1 + avgGrowth, years) - 1);
  const savingsRate = plan.income.w2Salary > 0 ? annualSavings / plan.income.w2Salary : 0;

  return {
    yearsToRetire: years,
    futureValueExisting: fvExisting,
    futureValueMatch: fvMatch,
    gap,
    annualSavings,
    monthlySavings: annualSavings / 12,
    savingsRate,
    feasibility: gap <= 0 ? "on_track" : savingsRate > 0.5 ? "very_aggressive" : savingsRate > 0.3 ? "aggressive" : savingsRate > 0.2 ? "moderate" : "achievable",
    allocation: {
      to401k: Math.min(IRS_401K_ELECTIVE_LIMIT, annualSavings),
      toRoth: Math.min(7500, Math.max(0, annualSavings - IRS_401K_ELECTIVE_LIMIT)),
      toBrokerage: Math.max(0, annualSavings - IRS_401K_ELECTIVE_LIMIT - 7500),
      matchAmount: annualMatch,
    },
  };
}
