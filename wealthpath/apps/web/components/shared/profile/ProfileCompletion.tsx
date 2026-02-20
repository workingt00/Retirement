"use client";

import { useEffect, useRef } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import Link from "next/link";

type TabKey = "personal" | "income" | "accounts" | "taxes" | "benefits" | "expenses";

const TAB_WEIGHTS: Record<TabKey, number> = {
  personal: 20,
  income: 15,
  accounts: 25,
  taxes: 15,
  benefits: 10,
  expenses: 15,
};

const TAB_LABELS: Record<TabKey, string> = {
  personal: "Personal",
  income: "Income",
  accounts: "Accounts",
  taxes: "Taxes",
  benefits: "Benefits",
  expenses: "Expenses & Risk",
};

export interface ProfileCompletionResult {
  score: number;
  lowestTab: string;
  tabCompletion: Record<TabKey, number>;
  justCompleted: TabKey | null;
}

function computeTabCompletion(plan: ReturnType<typeof usePlanStore.getState>["plan"]): Record<TabKey, number> {
  const result: Record<TabKey, number> = {
    personal: 0, income: 0, accounts: 0, taxes: 0, benefits: 0, expenses: 0,
  };

  if (!plan) return result;

  // Personal
  const personalChecks = [
    plan.personal.currentAge > 0,
    plan.personal.retirementAge > 0,
    plan.personal.gender != null,
    plan.personal.filingStatus != null,
    plan.personal.state != null,
  ];
  result.personal = personalChecks.filter(Boolean).length / personalChecks.length;

  // Income
  result.income = plan.income.w2Salary > 0 ? 1 : 0;

  // Accounts
  const hasCompleteAccount =
    plan.accounts.length > 0 &&
    plan.accounts.some((a) => a.currentBalance > 0 && a.expectedReturnRate > 0);
  result.accounts = hasCompleteAccount ? 1 : 0;

  // Taxes
  const taxChecks = [
    plan.tax.deductionType != null,
    plan.tax.contributionPreference != null,
  ];
  result.taxes = taxChecks.filter(Boolean).length / taxChecks.length;

  // Benefits
  result.benefits = plan.socialSecurity.claimingAge >= 62 ? 1 : 0;

  // Expenses
  const expenseChecks = [
    plan.expensesRisk.annualLivingExpenses > 0,
    plan.expensesRisk.riskTolerance != null,
  ];
  result.expenses = expenseChecks.filter(Boolean).length / expenseChecks.length;

  return result;
}

export function useProfileCompletion(): ProfileCompletionResult {
  const plan = usePlanStore((s) => s.plan);
  const prevCompletion = useRef<Record<TabKey, number> | null>(null);

  const tabCompletion = computeTabCompletion(plan);

  // Compute aggregate score
  let score = 0;
  let lowestTab = "Personal";
  let lowestWeightedScore = -1;

  for (const key of Object.keys(TAB_WEIGHTS) as TabKey[]) {
    const weight = TAB_WEIGHTS[key];
    score += tabCompletion[key] >= 1 ? weight : 0;

    if (tabCompletion[key] < 1) {
      const weightedScore = weight * (1 - tabCompletion[key]);
      if (weightedScore > lowestWeightedScore) {
        lowestWeightedScore = weightedScore;
        lowestTab = TAB_LABELS[key];
      }
    }
  }

  // Detect if a tab just completed
  let justCompleted: TabKey | null = null;
  if (prevCompletion.current) {
    for (const key of Object.keys(TAB_WEIGHTS) as TabKey[]) {
      if (tabCompletion[key] >= 1 && prevCompletion.current[key] < 1) {
        justCompleted = key;
        break;
      }
    }
  }

  useEffect(() => {
    prevCompletion.current = { ...tabCompletion };
  });

  return { score, lowestTab, tabCompletion, justCompleted };
}

export default function ProfileCompletion() {
  const { theme } = useMode();
  const { score, lowestTab } = useProfileCompletion();

  if (score >= 100) return null;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: `${theme.primary}08`, borderColor: `${theme.primary}20` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: theme.text }}>
          Profile Completion
        </span>
        <span className="text-sm font-bold" style={{ color: theme.primary, fontFamily: theme.fontMono }}>
          {score}%
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${theme.textMuted}20` }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: theme.primary }}
        />
      </div>
      <p className="text-sm" style={{ color: theme.textMuted }}>
        Your plan is {score}% complete &mdash;{" "}
        <Link href="/profile" className="font-medium" style={{ color: theme.primary }}>
          add your {lowestTab} details
        </Link>{" "}
        to improve projection accuracy.
      </p>
    </div>
  );
}
