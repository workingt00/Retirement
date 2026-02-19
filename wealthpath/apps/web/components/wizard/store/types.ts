import type { ProjectionResult } from "../engine/projection";

export type NavigationDirection = "forward" | "back" | "reset";

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
  direction: NavigationDirection;

  // User inputs
  avatarId: string | null;
  age: number | null;
  annualIncome: number | null;
  totalSavings: number | null;
  monthlySpending: number | null;
  monthlySavings: number | null;

  // Derived
  projection: ProjectionResult | null;
}

export type WizardAction =
  | { type: "GO_NEXT" }
  | { type: "GO_BACK" }
  | { type: "GO_TO_STEP"; step: number; direction: NavigationDirection }
  | { type: "COMPLETE_STEP"; step: number }
  | { type: "SET_AVATAR"; avatarId: string }
  | { type: "SET_AGE"; age: number | null }
  | { type: "SET_ANNUAL_INCOME"; annualIncome: number }
  | { type: "SET_TOTAL_SAVINGS"; totalSavings: number }
  | { type: "SET_MONTHLY_SPENDING"; monthlySpending: number }
  | { type: "SET_MONTHLY_SAVINGS"; monthlySavings: number }
  | { type: "SET_PROJECTION"; projection: ProjectionResult }
  | { type: "RESTORE_STATE"; state: Partial<WizardState> }
  | { type: "RESET" };

export const TOTAL_STEPS = 8; // 0-7
