export { simulate } from './engine';
export { solveGoal } from './goal-solver';
export { detectConflicts, MOVE_CONFLICTS } from './validators';
export { computeFederalTax, computeCGTax, marginalCGRate, marginalOrdinaryRate, computeSSBenefit, computeStateTax } from './tax';
export { computeW0 } from './w0-queue';
export { computeSensitivity } from './sensitivity';
export type { UserPlan, YearResult, SimulationResult, SimulationSummary, Move, GoalSolverResult, Scenario, ScenarioComparison, MoveCategory, MoveUnit, TaxBracket, ProfileAccount, AccountType, MajorExpenditure } from './types';
export { DEFAULT_PLAN, DEFAULT_MOVES, FEDERAL_BRACKETS_MFJ, FEDERAL_BRACKETS_SINGLE, FEDERAL_BRACKETS_MFS, FEDERAL_BRACKETS_HOH, CG_THRESHOLDS, STATE_TAX_RATES, TIER_LIMITS, STANDARD_DEDUCTIONS, computeAnnualExpenses } from './constants';
