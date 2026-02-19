"use client";

import { useMode } from "@/components/shared/ModeProvider";

export default function ReportsPage() {
  const { theme } = useMode();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: theme.text }}>Reports</h1>
      <div
        className="flex flex-col items-center justify-center rounded-xl border py-16"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}15` }}
      >
        <svg className="mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} style={{ color: theme.textMuted }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
          Reports coming soon
        </p>
        <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
          Detailed retirement projections and downloadable summaries
        </p>
      </div>
    </div>
  );
}
