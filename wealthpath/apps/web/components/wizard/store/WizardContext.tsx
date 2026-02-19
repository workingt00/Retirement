"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { WizardState, WizardAction, NavigationDirection } from "./types";
import { runProjection, type ProjectionInputs } from "../engine/projection";
import { saveWizardState, loadWizardState, clearWizardState } from "../utils/persistence";

const initialState: WizardState = {
  currentStep: 0,
  completedSteps: [],
  direction: "forward",
  avatarId: null,
  age: null,
  annualIncome: null,
  totalSavings: null,
  monthlySpending: null,
  monthlySavings: null,
  projection: null,
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "GO_NEXT": {
      const nextStep = state.currentStep + 1;
      const completed = state.completedSteps.includes(state.currentStep)
        ? state.completedSteps
        : [...state.completedSteps, state.currentStep];
      return { ...state, currentStep: nextStep, completedSteps: completed, direction: "forward" };
    }
    case "GO_BACK": {
      if (state.currentStep <= 0) return state;
      return { ...state, currentStep: state.currentStep - 1, direction: "back" };
    }
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step, direction: action.direction };
    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step],
      };
    case "SET_AVATAR":
      return { ...state, avatarId: action.avatarId };
    case "SET_AGE":
      return { ...state, age: action.age };
    case "SET_ANNUAL_INCOME":
      return { ...state, annualIncome: action.annualIncome };
    case "SET_TOTAL_SAVINGS":
      return { ...state, totalSavings: action.totalSavings };
    case "SET_MONTHLY_SPENDING":
      return { ...state, monthlySpending: action.monthlySpending };
    case "SET_MONTHLY_SAVINGS":
      return { ...state, monthlySavings: action.monthlySavings };
    case "SET_PROJECTION":
      return { ...state, projection: action.projection };
    case "RESTORE_STATE":
      return { ...state, ...action.state };
    case "RESET":
      return { ...initialState, direction: "reset" };
    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number, direction?: NavigationDirection) => void;
  reset: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const initializedRef = useRef(false);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const saved = loadWizardState();
    if (saved) {
      dispatch({ type: "RESTORE_STATE", state: saved as Partial<WizardState> });
    }
  }, []);

  // Persist to sessionStorage on change
  useEffect(() => {
    if (!initializedRef.current) return;
    const { projection, ...persistable } = state;
    saveWizardState(persistable);
  }, [state]);

  // Recalculate projection when inputs change (debounced 200ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const { age, annualIncome, totalSavings, monthlySpending, monthlySavings } = state;
      if (
        age !== null &&
        annualIncome !== null &&
        totalSavings !== null &&
        monthlySpending !== null &&
        monthlySpending > 0
      ) {
        const inputs: ProjectionInputs = {
          currentAge: age,
          annualIncome,
          totalSavings,
          monthlySpending,
          monthlySavings: monthlySavings ?? 0,
        };
        const result = runProjection(inputs);
        dispatch({ type: "SET_PROJECTION", projection: result });
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [
    state.age,
    state.annualIncome,
    state.totalSavings,
    state.monthlySpending,
    state.monthlySavings,
  ]);

  const goNext = useCallback(() => {
    dispatch({ type: "GO_NEXT" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "GO_BACK" });
  }, []);

  const goToStep = useCallback((step: number, direction: NavigationDirection = "forward") => {
    dispatch({ type: "GO_TO_STEP", step, direction });
  }, []);

  const reset = useCallback(() => {
    clearWizardState();
    dispatch({ type: "RESET" });
  }, []);

  return (
    <WizardContext.Provider value={{ state, dispatch, goNext, goBack, goToStep, reset }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return ctx;
}
