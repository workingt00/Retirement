"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulationContext } from "@/components/shared/SimulationProvider";
import { usePlanStore } from "@/stores/planStore";
import AnimatedNumber from "@/components/charts/AnimatedNumber";
import {
  computeAnnualDeferral,
  computeEmployerMatchFromTiers,
  computeAnnualExpenses,
  IRS_401K_ELECTIVE_LIMIT,
  STATE_TAX_RATES,
} from "@wealthpath/engine";

const FEASIBILITY_COLORS: Record<string, string> = {
  on_track: "#10B981",
  achievable: "#22C55E",
  moderate: "#F59E0B",
  aggressive: "#F97316",
  very_aggressive: "#EF4444",
};

const FEASIBILITY_LABELS: Record<string, string> = {
  on_track: "On Track",
  achievable: "Achievable",
  moderate: "Moderate",
  aggressive: "Aggressive",
  very_aggressive: "Very Aggressive",
};

function DeltaArrow({ direction, show }: { direction: "up" | "down"; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className="ml-1 text-xs font-bold"
          style={{ color: direction === "up" ? "#10B981" : "#EF4444" }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {direction === "up" ? "\u2191" : "\u2193"}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

interface MetricState {
  netWorth: number;
  retireAge: number;
  runway: number;
  monthlyIncome: number;
}

function useDelta(current: MetricState) {
  const prev = useRef<MetricState>(current);
  const [deltas, setDeltas] = useState<Record<string, "up" | "down" | null>>({
    netWorth: null, retireAge: null, runway: null, monthlyIncome: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const newDeltas: Record<string, "up" | "down" | null> = {
      netWorth: null, retireAge: null, runway: null, monthlyIncome: null,
    };
    let hasChange = false;

    for (const key of Object.keys(newDeltas) as (keyof MetricState)[]) {
      if (current[key] !== prev.current[key]) {
        newDeltas[key] = current[key] > prev.current[key] ? "up" : "down";
        hasChange = true;
      }
    }

    prev.current = { ...current };

    if (hasChange) {
      setDeltas(newDeltas);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDeltas({ netWorth: null, retireAge: null, runway: null, monthlyIncome: null });
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current]);

  return deltas;
}

function fmtCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${Math.round(v).toLocaleString()}`;
}

function fmtPct(v: number, decimals = 1): string {
  return `${v.toFixed(decimals)}%`;
}

/* ─────────────────── Tab-specific context sections ─────────────────── */

function ContextMetric({ label, value }: { label: string; value: string }) {
  const { theme } = useMode();
  return (
    <div>
      <div className="mb-0.5 text-[10px] uppercase tracking-wider" style={{ color: theme.textMuted }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
        {value}
      </div>
    </div>
  );
}

function PersonalContext() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return null;

  const yearsUntil = plan.personal.retirementAge - plan.personal.currentAge;
  const lifeExp = plan.scenarios.lifeExpectancy;
  const lifeExpMax = plan.scenarios.lifeExpectancyMax;
  const stateRate = STATE_TAX_RATES[plan.personal.state] ?? 0;
  const retireStateRate = plan.personal.retirementState
    ? STATE_TAX_RATES[plan.personal.retirementState] ?? stateRate
    : stateRate;

  return (
    <div className="space-y-3">
      <ContextMetric label="Years to retirement" value={`${yearsUntil} years`} />
      <ContextMetric label="Life expectancy" value={`${lifeExp}–${lifeExpMax}`} />
      <ContextMetric label="State tax rate" value={fmtPct(stateRate * 100, 2)} />
      {plan.personal.retirementState && plan.personal.retirementState !== plan.personal.state && (
        <ContextMetric label="Retirement state rate" value={fmtPct(retireStateRate * 100, 2)} />
      )}
    </div>
  );
}

function IncomeContext() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return null;

  const { w2Salary, bonusIncome, otherIncome, salaryGrowthRate } = plan.income;
  const commission = plan.income.commissionIncome ?? 0;
  const rsu = plan.income.rsuIncome ?? 0;
  const totalComp = w2Salary + bonusIncome + commission + rsu + otherIncome;
  const deferralBase = w2Salary + bonusIncome + commission;

  const deferral = computeAnnualDeferral(
    deferralBase,
    plan.income.deferralMode ?? "percent",
    plan.income.deferralPercent ?? 0,
    plan.income.deferralDollarPerPaycheck ?? 0,
    plan.income.payFrequency ?? 24,
    plan.income.maxDeferralPct ?? 0,
    IRS_401K_ELECTIVE_LIMIT,
  );
  const effectivePct = deferralBase > 0 ? (deferral / deferralBase) * 100 : 0;
  const match = computeEmployerMatchFromTiers(deferralBase, effectivePct, plan.income.employerMatchTiers ?? []);
  const total401k = deferral + match;
  const salary10y = w2Salary * Math.pow(1 + salaryGrowthRate / 100, 10);

  return (
    <div className="space-y-3">
      <ContextMetric label="Total compensation" value={fmtCurrency(totalComp)} />
      {total401k > 0 && <ContextMetric label="401(k) total" value={`${fmtCurrency(total401k)}/yr`} />}
      {salaryGrowthRate > 0 && <ContextMetric label="Salary in 10 yrs" value={fmtCurrency(salary10y)} />}
    </div>
  );
}

function AccountsContext() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return null;

  const totalValue = plan.accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalContrib = plan.accounts.reduce((sum, a) => sum + a.annualContribution, 0);
  const avgReturn = plan.accounts.length > 0
    ? plan.accounts.reduce((sum, a) => sum + a.expectedReturnRate, 0) / plan.accounts.length
    : 0;

  return (
    <div className="space-y-3">
      <ContextMetric label="Total portfolio" value={fmtCurrency(totalValue)} />
      <ContextMetric label="Annual contributions" value={`${fmtCurrency(totalContrib)}/yr`} />
      <ContextMetric label="Avg expected return" value={fmtPct(avgReturn)} />
    </div>
  );
}

function TaxesContext() {
  const { result } = useSimulationContext();
  const plan = usePlanStore((s) => s.plan);
  if (!plan || !result) return null;

  const effectiveRate = result.summary.effectiveTaxRate;
  const marginalRate = result.years[0]?.federalMarginalRate ?? 0;
  const stateRate = STATE_TAX_RATES[plan.personal.state] ?? 0;
  const deduction = plan.tax.standardDeduction;

  return (
    <div className="space-y-3">
      <ContextMetric label="Effective tax rate" value={fmtPct(effectiveRate * 100)} />
      <ContextMetric label="Federal marginal" value={fmtPct(marginalRate * 100)} />
      <ContextMetric label="State rate" value={fmtPct(stateRate * 100, 2)} />
      <ContextMetric label="Standard deduction" value={fmtCurrency(deduction)} />
    </div>
  );
}

function BenefitsContext() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return null;

  const ssMonthly = plan.socialSecurity.monthlyBenefitAtFRA;
  const claimAge = plan.socialSecurity.claimingAge;
  const hasPension = plan.benefits.hasPension;
  const pensionMonthly = plan.benefits.pensionMonthlyBenefit ?? 0;

  return (
    <div className="space-y-3">
      <ContextMetric label="SS monthly at FRA" value={fmtCurrency(ssMonthly)} />
      <ContextMetric label="Claiming age" value={String(claimAge)} />
      <ContextMetric label="SS annual" value={`${fmtCurrency(ssMonthly * 12)}/yr`} />
      {hasPension && pensionMonthly > 0 && (
        <ContextMetric label="Pension monthly" value={fmtCurrency(pensionMonthly)} />
      )}
    </div>
  );
}

function ExpensesContext() {
  const plan = usePlanStore((s) => s.plan);
  if (!plan) return null;

  const exp = computeAnnualExpenses(plan);
  const totalAnnual = exp.housing + exp.groceries + exp.bills + exp.lifestyle + exp.medical + exp.miscellaneous + exp.kids;
  const monthlyBurn = Math.round(totalAnnual / 12);
  const w2 = plan.income.w2Salary;
  const ratio = w2 > 0 ? totalAnnual / w2 : 0;

  return (
    <div className="space-y-3">
      <ContextMetric label="Annual expenses" value={fmtCurrency(totalAnnual)} />
      <ContextMetric label="Monthly burn" value={fmtCurrency(monthlyBurn)} />
      {w2 > 0 && <ContextMetric label="Expense-to-income" value={fmtPct(ratio * 100)} />}
    </div>
  );
}

const TAB_CONTEXT: Record<string, () => JSX.Element | null> = {
  personal: PersonalContext,
  income: IncomeContext,
  accounts: AccountsContext,
  taxes: TaxesContext,
  benefits: BenefitsContext,
  expenses: ExpensesContext,
};

const TAB_LABELS: Record<string, string> = {
  personal: "Personal",
  income: "Income",
  accounts: "Accounts",
  taxes: "Taxes",
  benefits: "Benefits",
  expenses: "Expenses",
};

/* ─────────────────── Main Component ─────────────────── */

export default function ProjectionPulse({ compact = false, activeTab }: { compact?: boolean; activeTab?: string }) {
  const { theme } = useMode();
  const { result, goalResult } = useSimulationContext();
  const plan = usePlanStore((s) => s.plan);

  const retireAge = plan
    ? plan.personal.currentAge + (goalResult?.yearsToRetire ?? (plan.personal.retirementAge - plan.personal.currentAge))
    : 0;
  const netWorth = result?.summary.netWorthAtRetirement ?? 0;
  const runway = result?.summary.yearsOfRunway ?? 0;
  const ssMonthly = plan?.socialSecurity.monthlyBenefitAtFRA ?? 0;
  const monthlyIncome = Math.round((netWorth * 0.04) / 12) + ssMonthly;
  const feasibility = goalResult?.feasibility ?? "moderate";

  const deltas = useDelta({ netWorth, retireAge, runway, monthlyIncome });

  const feasColor = FEASIBILITY_COLORS[feasibility] ?? "#F59E0B";
  const feasLabel = FEASIBILITY_LABELS[feasibility] ?? "Unknown";

  if (compact) {
    return (
      <div
        className="flex items-center gap-4 overflow-x-auto rounded-xl px-4 py-3"
        style={{
          backgroundColor: theme.surfaceGlass,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${theme.borderGlass}`,
        }}
      >
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>Retire</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={retireAge} format="integer" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>NW</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={netWorth} format="currency" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-xs" style={{ color: theme.textMuted }}>Monthly</span>
          <span className="text-sm font-bold" style={{ color: theme.text, fontFamily: theme.fontMono }}>
            <AnimatedNumber value={monthlyIncome} format="currency" duration={400} />
          </span>
        </div>
        <div className="h-4 w-px" style={{ backgroundColor: `${theme.textMuted}30` }} />
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: `${feasColor}20`, color: feasColor }}
        >
          {feasLabel}
        </span>
      </div>
    );
  }

  const ContextComponent = activeTab ? TAB_CONTEXT[activeTab] : null;
  const tabLabel = activeTab ? TAB_LABELS[activeTab] : null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        backgroundColor: theme.surfaceGlass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${theme.borderGlass}`,
        boxShadow: theme.shadowCard,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Gradient top accent bar */}
      <div
        className="absolute left-0 right-0 top-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
        }}
      />

      <h3
        className="mb-5 text-xs font-semibold uppercase tracking-widest"
        style={{
          background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Your Projection
      </h3>

      <div className="space-y-5">
        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Retirement Age</div>
          <div className="flex items-baseline">
            <span
              className="text-3xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 20px ${theme.primary}30` : "none",
              }}
            >
              <AnimatedNumber value={retireAge} format="integer" duration={500} />
            </span>
            <DeltaArrow direction={deltas.retireAge === "down" ? "up" : "down"} show={deltas.retireAge !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Net Worth at Retirement</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: theme.fontMono,
              }}
            >
              <AnimatedNumber value={netWorth} format="currency" duration={500} />
            </span>
            <DeltaArrow direction={deltas.netWorth ?? "up"} show={deltas.netWorth !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Est. Monthly Income</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 15px ${theme.primary}20` : "none",
              }}
            >
              <AnimatedNumber value={monthlyIncome} format="currency" duration={500} />
            </span>
            <DeltaArrow direction={deltas.monthlyIncome ?? "up"} show={deltas.monthlyIncome !== null} />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs" style={{ color: theme.textMuted }}>Years of Runway</div>
          <div className="flex items-baseline">
            <span
              className="text-2xl font-bold"
              style={{
                color: theme.text,
                fontFamily: theme.fontMono,
                textShadow: theme.isDark ? `0 0 15px ${theme.primary}20` : "none",
              }}
            >
              <AnimatedNumber value={runway} format="integer" duration={500} />
            </span>
            <span className="ml-1 text-sm" style={{ color: theme.textMuted }}>years</span>
            <DeltaArrow direction={deltas.runway ?? "up"} show={deltas.runway !== null} />
          </div>
        </div>

        <div className="pt-2">
          <motion.span
            key={feasibility}
            className="inline-block rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, ${feasColor}20, ${feasColor}10)`,
              color: feasColor,
              border: `1px solid ${feasColor}30`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {feasLabel}
          </motion.span>
        </div>
      </div>

      {/* ─── Tab-specific contextual info ─── */}
      {ContextComponent && (
        <>
          <div
            className="my-5"
            style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${theme.textMuted}30, transparent)`,
            }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tabLabel && (
                <h4
                  className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: theme.textMuted }}
                >
                  {tabLabel} Details
                </h4>
              )}
              <ContextComponent />
            </motion.div>
          </AnimatePresence>
        </>
      )}

      <p className="mt-6 text-[10px] leading-tight" style={{ color: `${theme.textMuted}80` }}>
        For educational purposes only. Not financial advice.
      </p>
    </motion.div>
  );
}
