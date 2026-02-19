"use client";

import { useState } from "react";
import { useMode } from "@/components/shared/ModeProvider";
import RoadmapDashboard from "@/components/horizon/RoadmapDashboard";
import CommandCenter from "@/components/velocity/CommandCenter";
import ProfileCompletion from "@/components/shared/profile/ProfileCompletion";

export default function DashboardPage() {
  const [tab, setTab] = useState<"roadmap" | "command">("roadmap");
  const { theme } = useMode();

  return (
    <div>
      <div className="mb-6">
        <ProfileCompletion />
      </div>
      <div className="mb-6 flex gap-2">
        {([["roadmap", "Roadmap"], ["command", "Command Center"]] as const).map(([key, label]) => (
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
      {tab === "roadmap" ? <RoadmapDashboard /> : <CommandCenter />}
    </div>
  );
}
