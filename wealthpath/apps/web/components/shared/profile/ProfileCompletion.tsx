"use client";

import { useMode } from "@/components/shared/ModeProvider";
import { usePlanStore } from "@/stores/planStore";
import Link from "next/link";

const TAB_WEIGHTS = [
  { tab: "Personal", weight: 20, check: "personal" },
  { tab: "Income", weight: 15, check: "income" },
  { tab: "Accounts", weight: 25, check: "accounts" },
  { tab: "Taxes", weight: 15, check: "taxes" },
  { tab: "Benefits", weight: 10, check: "benefits" },
  { tab: "Expenses & Risk", weight: 15, check: "expenses" },
] as const;

export function useProfileCompletion() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return { score: 0, lowestTab: "Personal" };

  let score = 0;
  let lowestTab = TAB_WEIGHTS[0].tab;
  let lowestWeight = Infinity;

  // Personal: all required fields filled
  const personalComplete =
    plan.personal.currentAge > 0 &&
    plan.personal.retirementAge > 0 &&
    plan.personal.gender != null &&
    plan.personal.filingStatus != null &&
    plan.personal.state != null;
  if (personalComplete) score += 20;
  else if (20 < lowestWeight) { lowestWeight = 20; lowestTab = "Personal"; }

  // Income: annual_salary filled
  const incomeComplete = plan.income.w2Salary > 0;
  if (incomeComplete) score += 15;
  else if (15 < lowestWeight) { lowestWeight = 15; lowestTab = "Income"; }

  // Accounts: at least one complete account entry
  const accountsComplete =
    plan.accounts.length > 0 &&
    plan.accounts.some((a) => a.currentBalance > 0 && a.expectedReturnRate > 0);
  if (accountsComplete) score += 25;
  else if (25 < lowestWeight) { lowestWeight = 25; lowestTab = "Accounts"; }

  // Taxes: deduction_type and contribution_preference filled
  const taxesComplete = plan.tax.deductionType != null && plan.tax.contributionPreference != null;
  if (taxesComplete) score += 15;
  else if (15 < lowestWeight) { lowestWeight = 15; lowestTab = "Taxes"; }

  // Benefits: ss_claiming_age filled
  const benefitsComplete = plan.socialSecurity.claimingAge >= 62;
  if (benefitsComplete) score += 10;
  else if (10 < lowestWeight) { lowestWeight = 10; lowestTab = "Benefits"; }

  // Expenses & Risk: annual_living_expenses and risk_tolerance filled
  const expensesComplete =
    plan.expensesRisk.annualLivingExpenses > 0 &&
    plan.expensesRisk.riskTolerance != null;
  if (expensesComplete) score += 15;
  else if (15 < lowestWeight) { lowestWeight = 15; lowestTab = "Expenses & Risk"; }

  return { score, lowestTab };
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
