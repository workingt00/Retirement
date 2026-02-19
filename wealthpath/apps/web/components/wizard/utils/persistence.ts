const STORAGE_KEY = "wealthpath_wizard_state";

export function saveWizardState(state: Record<string, unknown>): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // Silently fail - storage might be full or unavailable
  }
}

export function loadWizardState(): Record<string, unknown> | null {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {
    // Silently fail
  }
  return null;
}

export function clearWizardState(): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Silently fail
  }
}
