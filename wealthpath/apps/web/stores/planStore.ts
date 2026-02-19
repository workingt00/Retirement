"use client";

import { create } from "zustand";
import type { UserPlan, Move, ProfileAccount } from "@wealthpath/engine";
import { DEFAULT_PLAN } from "@wealthpath/engine";

interface PlanStore {
  plan: UserPlan | null;
  dbPlanId: string | null;
  isDirty: boolean;
  setPlan: (plan: UserPlan, dbPlanId?: string) => void;
  updateField: (path: string, value: unknown) => void;
  toggleMove: (moveId: string) => void;
  updateMove: (moveId: string, field: keyof Move, value: unknown) => void;
  addAccount: () => void;
  removeAccount: (id: string) => void;
  updateAccount: (id: string, field: keyof ProfileAccount, value: unknown) => void;
  markClean: () => void;
  reset: () => void;
}

function setNestedField(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return result;
}

let saveTimeout: ReturnType<typeof setTimeout> | undefined;

function debouncedSave(plan: UserPlan, dbPlanId: string | null) {
  clearTimeout(saveTimeout);
  if (!dbPlanId) return; // No DB record yet — skip save
  saveTimeout = setTimeout(() => {
    fetch("/api/trpc/plan.update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dbPlanId, data: plan }),
    }).catch(() => {});
  }, 500);
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  dbPlanId: null,
  isDirty: false,

  setPlan: (plan, dbPlanId) => set({ plan, dbPlanId: dbPlanId ?? get().dbPlanId, isDirty: false }),

  updateField: (path, value) => {
    const { plan, dbPlanId } = get();
    if (!plan) return;
    const updated = setNestedField(plan as unknown as Record<string, unknown>, path, value) as unknown as UserPlan;
    updated.updatedAt = new Date();
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  toggleMove: (moveId) => {
    const { plan, dbPlanId } = get();
    if (!plan) return;

    const move = plan.moves.find((m) => m.id === moveId);
    if (!move) return;

    // Auto-disable conflicting moves when enabling
    const newMoves = plan.moves.map((m) => {
      if (m.id === moveId) return { ...m, enabled: !m.enabled };
      if (!move.enabled && move.conflicts.includes(m.id)) {
        return { ...m, enabled: false };
      }
      return m;
    });

    const updated = { ...plan, moves: newMoves, updatedAt: new Date() };
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  updateMove: (moveId, field, value) => {
    const { plan, dbPlanId } = get();
    if (!plan) return;
    const newMoves = plan.moves.map((m) =>
      m.id === moveId ? { ...m, [field]: value } : m,
    );
    const updated = { ...plan, moves: newMoves, updatedAt: new Date() };
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  addAccount: () => {
    const { plan, dbPlanId } = get();
    if (!plan) return;
    const newAccount: ProfileAccount = {
      id: crypto.randomUUID(),
      accountType: "401k",
      currentBalance: 0,
      annualContribution: 0,
      investmentStrategyPreset: "moderate",
      expectedReturnRate: 6.0,
    };
    const updated = { ...plan, accounts: [...plan.accounts, newAccount], updatedAt: new Date() };
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  removeAccount: (id) => {
    const { plan, dbPlanId } = get();
    if (!plan || plan.accounts.length <= 1) return;
    const updated = { ...plan, accounts: plan.accounts.filter((a) => a.id !== id), updatedAt: new Date() };
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  updateAccount: (id, field, value) => {
    const { plan, dbPlanId } = get();
    if (!plan) return;
    const newAccounts = plan.accounts.map((a) =>
      a.id === id ? { ...a, [field]: value } : a,
    );
    const updated = { ...plan, accounts: newAccounts, updatedAt: new Date() };
    set({ plan: updated, isDirty: true });
    debouncedSave(updated, dbPlanId);
  },

  markClean: () => set({ isDirty: false }),

  reset: () => {
    const { dbPlanId } = get();
    const plan = { ...DEFAULT_PLAN, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    set({ plan, isDirty: true });
    debouncedSave(plan, dbPlanId);
  },
}));
