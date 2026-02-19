"use client";

import { useEffect } from "react";
import { ModeProvider, useMode } from "@/components/shared/ModeProvider";
import { SimulationProvider } from "@/components/shared/SimulationProvider";
import { usePlan } from "@/hooks/usePlan";
import HorizonLayout from "@/components/horizon/HorizonLayout";
import VelocityLayout from "@/components/velocity/VelocityLayout";

function AppShell({ children }: { children: React.ReactNode }) {
  usePlan(); // Loads plan into store on mount

  return <HorizonLayout>{children}</HorizonLayout>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In production, initialMode would come from the server session
  return (
    <ModeProvider initialMode="horizon">
      <SimulationProvider>
        <AppShell>{children}</AppShell>
      </SimulationProvider>
    </ModeProvider>
  );
}
