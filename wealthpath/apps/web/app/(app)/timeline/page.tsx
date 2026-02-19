"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlanStore } from "@/stores/planStore";
import { formatCurrency } from "@/lib/formatters";
import StatusBadge from "@/components/shared/StatusBadge";

function HorizonTimeline() {
  const { theme } = useMode();
  const { result } = useSimulation();
  const plan = usePlanStore((s) => s.plan);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  if (!result || !plan) return null;

  const milestones = [
    { age: plan.personal.retirementAge, label: "Retire" },
    { age: plan.housing.mortgageEndAge, label: "Mortgage paid" },
    { age: plan.socialSecurity.claimingAge, label: "SS starts" },
    { age: 65, label: "Medicare" },
  ].filter((m) => m.age >= plan.personal.currentAge && m.age <= 80);

  const selected = selectedAge ? result.years.find((y) => y.age === selectedAge) : null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>
        Your Timeline
      </h1>

      {/* Horizontal timeline */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex gap-1" style={{ minWidth: `${(81 - plan.personal.currentAge) * 48}px` }}>
          {result.years.filter((y) => y.age <= 80).map((year) => {
            const milestone = milestones.find((m) => m.age === year.age);
            const isSelected = selectedAge === year.age;
            return (
              <button
                key={year.age}
                onClick={() => setSelectedAge(year.age)}
                className="flex flex-col items-center"
                style={{ minWidth: "44px", minHeight: "48px" }}
              >
                {milestone && (
                  <span className="mb-1 whitespace-nowrap text-[9px] font-medium" style={{ color: theme.primary }}>
                    {milestone.label}
                  </span>
                )}
                <div
                  className="h-8 w-8 rounded-full text-[10px] font-medium leading-8 text-center transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? theme.primary
                      : year.status === "FAIL"
                        ? `${theme.danger}30`
                        : year.isRetired
                          ? `${theme.secondary}20`
                          : `${theme.textMuted}10`,
                    color: isSelected ? "#fff" : theme.text,
                  }}
                >
                  {year.age}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year detail */}
      {selected ? (
        <div className="rounded-2xl p-6" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.textMuted}15` }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: theme.text }}>
              Age {selected.age} ({selected.year})
            </h2>
            <StatusBadge status={selected.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Income", value: selected.totalIncome },
              { label: "Total Taxes", value: selected.totalTax },
              { label: "Total Expenses", value: selected.totalExpenses },
              { label: "Cash Flow", value: selected.annualCashFlow, highlight: true },
              { label: "Net Worth", value: selected.totalNetWorth },
              { label: "401k", value: selected.traditional401k },
              { label: "Roth IRA", value: selected.rothIRA },
              { label: "Portfolio", value: selected.privatePortfolio },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs" style={{ color: theme.textMuted }}>{item.label}</p>
                <p
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: theme.fontMono,
                    color: item.highlight
                      ? selected.annualCashFlow >= 0 ? theme.success : theme.danger
                      : theme.text,
                  }}
                >
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>
          {selected.activeMoves.length > 0 && (
            <div className="mt-4">
              <p className="text-xs" style={{ color: theme.textMuted }}>Active moves:</p>
              <p className="text-xs" style={{ color: theme.text }}>
                {selected.activeMoves.join(", ")}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-sm" style={{ color: theme.textMuted }}>
          Tap a year to see details.
        </p>
      )}
    </div>
  );
}

function VelocityTimeline() {
  const { theme } = useMode();
  const { result } = useSimulation();
  const plan = usePlanStore((s) => s.plan);
  const [expandedAge, setExpandedAge] = useState<number | null>(null);

  if (!result || !plan) return null;

  const scrollToRetirement = () => {
    const el = document.getElementById(`age-${plan.personal.retirementAge}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: theme.text }}>
          Year-by-Year Engine
        </h1>
        <button
          onClick={scrollToRetirement}
          className="rounded px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
        >
          Jump to retirement
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" style={{ fontFamily: theme.fontMono }}>
          <thead>
            <tr style={{ color: theme.textMuted }}>
              <th className="sticky left-0 px-2 py-2 text-[10px]" style={{ backgroundColor: theme.bg }}>Age</th>
              <th className="px-2 py-2 text-[10px]">Income</th>
              <th className="px-2 py-2 text-[10px]">Tax</th>
              <th className="px-2 py-2 text-[10px]">Expenses</th>
              <th className="px-2 py-2 text-[10px]">Cash Flow</th>
              <th className="px-2 py-2 text-[10px]">Status</th>
              <th className="px-2 py-2 text-[10px]">401k</th>
              <th className="px-2 py-2 text-[10px]">Roth</th>
              <th className="px-2 py-2 text-[10px]">Portfolio</th>
              <th className="px-2 py-2 text-[10px]">Net Worth</th>
            </tr>
          </thead>
          <tbody>
            {result.years.filter((y) => y.age <= 80).map((y) => (
              <>
                <tr
                  key={y.age}
                  id={`age-${y.age}`}
                  className="cursor-pointer border-b transition-colors hover:opacity-80"
                  style={{
                    borderColor: `${theme.textMuted}10`,
                    backgroundColor: y.isRetired ? `${theme.primary}05` : "transparent",
                  }}
                  onClick={() => setExpandedAge(expandedAge === y.age ? null : y.age)}
                >
                  <td className="sticky left-0 px-2 py-1.5 font-semibold" style={{ backgroundColor: theme.bg, color: theme.text }}>
                    {y.age}
                  </td>
                  <td className="px-2 py-1.5" style={{ color: theme.text }}>{formatCurrency(y.totalIncome)}</td>
                  <td className="px-2 py-1.5" style={{ color: theme.danger }}>{formatCurrency(y.totalTax)}</td>
                  <td className="px-2 py-1.5" style={{ color: theme.text }}>{formatCurrency(y.totalExpenses)}</td>
                  <td className="px-2 py-1.5" style={{ color: y.annualCashFlow >= 0 ? theme.success : theme.danger }}>
                    {formatCurrency(y.annualCashFlow)}
                  </td>
                  <td className="px-2 py-1.5">
                    <span style={{ color: y.status === "OK" ? theme.success : theme.danger }}>{y.status}</span>
                  </td>
                  <td className="px-2 py-1.5" style={{ color: theme.text }}>{formatCurrency(y.traditional401k)}</td>
                  <td className="px-2 py-1.5" style={{ color: theme.text }}>{formatCurrency(y.rothIRA)}</td>
                  <td className="px-2 py-1.5" style={{ color: theme.text }}>{formatCurrency(y.privatePortfolio)}</td>
                  <td className="px-2 py-1.5 font-semibold" style={{ color: theme.text }}>{formatCurrency(y.totalNetWorth)}</td>
                </tr>
                {expandedAge === y.age && (
                  <tr key={`${y.age}-detail`}>
                    <td colSpan={10} className="px-4 py-3" style={{ backgroundColor: theme.surface }}>
                      <div className="grid grid-cols-3 gap-3 text-[11px] md:grid-cols-6">
                        <div>
                          <span style={{ color: theme.textMuted }}>W2:</span>{" "}
                          <span style={{ color: theme.text }}>{formatCurrency(y.w2Income)}</span>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>SS:</span>{" "}
                          <span style={{ color: theme.text }}>{formatCurrency(y.socialSecurity)}</span>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>Fed Tax:</span>{" "}
                          <span style={{ color: theme.text }}>{formatCurrency(y.federalTax)}</span>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>State Tax:</span>{" "}
                          <span style={{ color: theme.text }}>{formatCurrency(y.stateTax)}</span>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>Roth Conv:</span>{" "}
                          <span style={{ color: theme.text }}>{formatCurrency(y.rothConversionAmount)}</span>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>Moves:</span>{" "}
                          <span style={{ color: theme.text }}>{y.activeMoves.join(", ") || "none"}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [tab, setTab] = useState<"visual" | "table">("visual");
  const { theme } = useMode();

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {([["visual", "Visual Timeline"], ["table", "Data Table"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === key ? theme.primary : `${theme.textMuted}10`,
              color: tab === key ? "#fff" : theme.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "visual" ? <HorizonTimeline /> : <VelocityTimeline />}
    </div>
  );
}
