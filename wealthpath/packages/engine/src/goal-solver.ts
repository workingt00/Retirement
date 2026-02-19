import { UserPlan, GoalSolverResult } from './types';

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

  const annualMatch = plan.income.w2Salary * plan.goalSolver.employerMatchPercent / 100;
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
      to401k: Math.min(23000, annualSavings),
      toRoth: Math.min(7500, Math.max(0, annualSavings - 23000)),
      toBrokerage: Math.max(0, annualSavings - 23000 - 7500),
      matchAmount: annualMatch,
    },
  };
}
