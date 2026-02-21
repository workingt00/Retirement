import type { UserPlan } from './types';

/**
 * Migrate plans from older formats to the current schema.
 * Called when loading a plan from the DB to ensure all fields exist.
 *
 * Handles:
 * 1. Old flat employerMatchPct/employerMatchCapPct → employerMatchTiers[]
 * 2. Old goalSolver.employerMatchPercent → employerMatchTiers[]
 * 3. Missing new deferral fields get sensible defaults
 */
export function migratePlan(raw: Record<string, unknown>): Record<string, unknown> {
  const plan = structuredClone(raw);
  const income = plan.income as Record<string, unknown> | undefined;
  const goalSolver = plan.goalSolver as Record<string, unknown> | undefined;

  if (!income) return plan;

  // --- Migrate to tiered match ---
  const existingTiers = income.employerMatchTiers as unknown[] | undefined;
  const hasTiers = Array.isArray(existingTiers) && existingTiers.length > 0;

  if (!hasTiers) {
    const oldMatchPct = (income.employerMatchPct as number) ?? 0;
    const oldCapPct = (income.employerMatchCapPct as number) ?? 0;
    const oldGoalSolverPct = goalSolver ? (goalSolver.employerMatchPercent as number) ?? 0 : 0;

    if (oldMatchPct > 0 && oldCapPct > 0) {
      // Old UI model: "X% match on up to Y% of salary"
      income.employerMatchTiers = [{ matchPct: oldMatchPct, upToPct: oldCapPct }];
    } else if (oldGoalSolverPct > 0) {
      // Old engine model: flat X% of W2 → approximate as 100% match on first X%
      income.employerMatchTiers = [{ matchPct: 100, upToPct: oldGoalSolverPct }];
    } else {
      income.employerMatchTiers = [];
    }
  }

  // --- Remove deprecated goalSolver.employerMatchPercent ---
  if (goalSolver && 'employerMatchPercent' in goalSolver) {
    delete goalSolver.employerMatchPercent;
  }

  // --- Default new deferral fields ---
  income.deferralMode ??= "percent";
  income.deferralPercent ??= 0;
  income.deferralDollarPerPaycheck ??= 0;
  income.payFrequency ??= 24;
  income.maxDeferralPct ??= 0;

  return plan;
}
