"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import ProfilePersonalTab from "@/components/shared/profile/ProfilePersonalTab";
import ProfileIncomeTab from "@/components/shared/profile/ProfileIncomeTab";
import ProfileAccountsTab from "@/components/shared/profile/ProfileAccountsTab";
import ProfileTaxesTab from "@/components/shared/profile/ProfileTaxesTab";
import ProfileBenefitsTab from "@/components/shared/profile/ProfileBenefitsTab";
import ProfileExpensesRiskTab from "@/components/shared/profile/ProfileExpensesRiskTab";

const TABS = [
  { key: "personal", label: "Personal" },
  { key: "income", label: "Income" },
  { key: "accounts", label: "Accounts" },
  { key: "taxes", label: "Taxes" },
  { key: "benefits", label: "Benefits" },
  { key: "expenses", label: "Expenses & Risk" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ProfilePage() {
  const { theme } = useMode();
  const [activeTab, setActiveTab] = useState<TabKey>("personal");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>My Profile</h1>

      {/* Tab navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? theme.primary : `${theme.textMuted}10`,
              color: activeTab === tab.key ? "#fff" : theme.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}15` }}
      >
        {activeTab === "personal" && <ProfilePersonalTab />}
        {activeTab === "income" && <ProfileIncomeTab />}
        {activeTab === "accounts" && <ProfileAccountsTab />}
        {activeTab === "taxes" && <ProfileTaxesTab />}
        {activeTab === "benefits" && <ProfileBenefitsTab />}
        {activeTab === "expenses" && <ProfileExpensesRiskTab />}
      </div>
    </div>
  );
}
