export function formatCurrency(value: number, compact = true): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (compact && abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (compact && abs >= 1_000) {
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  }
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

export function formatCurrencyWithContext(
  value: number,
  context: string,
  mode: "horizon" | "velocity",
): string {
  const formatted = formatCurrency(value);
  if (mode === "horizon") {
    return `${formatted} ${context}`;
  }
  return formatted;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPercentFromDecimal(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatAge(age: number): string {
  return `Age ${age}`;
}

export function formatMonthly(annual: number): string {
  return formatCurrency(annual / 12);
}
