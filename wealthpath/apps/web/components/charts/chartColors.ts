export const chartColors = {
  horizon: {
    taxDeferred: "#E8985E",
    taxFree: "#2D6A4F",
    other: "#6B8CAE",
    bear: "#DC3545",
    base: "#2D6A4F",
    bull: "#2D6A4F80",
    positive: "#2D6A4F",
    negative: "#DC3545",
    neutral: "#D4A843",
    background: "#FAF9F6",
    gridLines: "#E5E7EB",
    text: "#1A1A2E",
    textMuted: "#6B7280",
  },
  velocity: {
    taxDeferred: "#F59E0B",
    taxFree: "#10B981",
    other: "#3B82F6",
    bear: "#EF4444",
    base: "#3B82F6",
    bull: "#10B981",
    positive: "#10B981",
    negative: "#EF4444",
    neutral: "#F59E0B",
    background: "#0F172A",
    gridLines: "#334155",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
  },
} as const;

export const accountColors = {
  horizon: {
    trad401k: "#E8985E",
    roth401k: "#A3D9A5",
    tradIRA: "#D4A843",
    rothIRA: "#2D6A4F",
    portfolio: "#4A90D9",
    plan529: "#9B8EC8",
    foreign: "#6B8CAE",
  },
  velocity: {
    trad401k: "#F59E0B",
    roth401k: "#34D399",
    tradIRA: "#FBBF24",
    rothIRA: "#10B981",
    portfolio: "#3B82F6",
    plan529: "#8B5CF6",
    foreign: "#64748B",
  },
} as const;

export const bracketColors: Record<number, string> = {
  0.10: "#86EFAC",
  0.12: "#4ADE80",
  0.22: "#BEF264",
  0.24: "#FDE047",
  0.32: "#FB923C",
  0.35: "#F97316",
  0.37: "#EF4444",
};

export type Theme = "horizon" | "velocity";

export function formatDollar(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    const k = value / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}
