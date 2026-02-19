"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { themes, type ThemeTokens } from "@/lib/theme";

type Mode = "horizon" | "velocity";

interface ModeContextValue {
  mode: Mode;
  theme: ThemeTokens;
  setMode: (m: Mode) => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({
  initialMode,
  children,
}: {
  initialMode: Mode;
  children: ReactNode;
}) {
  const [mode, setModeState] = useState<Mode>(initialMode);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    // Persist mode change to server
    fetch("/api/trpc/user.setMode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: m }),
    }).catch(() => {});
  }, []);

  const theme = themes[mode];

  return (
    <ModeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
}
