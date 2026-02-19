export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions.toFixed(millions >= 10 ? 1 : 2)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value).toLocaleString()}`;
  }
  return `$${Math.round(value)}`;
}

export function formatCurrencyFull(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export function parseCurrencyInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export function formatInputDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString();
}
