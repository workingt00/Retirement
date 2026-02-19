"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMode } from "@/components/shared/ModeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortcut: "D", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/profile", label: "My Profile", shortcut: "P", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/strategy", label: "Smart Moves", shortcut: "M", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/scenarios", label: "Scenarios", shortcut: "S", icon: "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/insights", label: "Insights", shortcut: "I", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { href: "/timeline", label: "Timeline", shortcut: "T", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/reports", label: "Reports", shortcut: "R", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/settings", label: "Settings", shortcut: "G", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

export default function HorizonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useMode();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
    if (e.key === "?") {
      setShowHelp((h) => !h);
      return;
    }
    const item = NAV_ITEMS.find((i) => i.shortcut.toLowerCase() === e.key.toLowerCase());
    if (item) window.location.href = item.href;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: theme.fontFamily }}
    >
      {/* Sidebar */}
      <aside
        className="hidden w-64 flex-col border-r md:flex"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}20` }}
      >
        <div className="px-6 py-5">
          <Link href="/dashboard" className="text-xl font-bold" style={{ color: theme.primary }}>
            WealthPath
          </Link>
          <p className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Your retirement roadmap
          </p>
        </div>
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? `${theme.primary}15` : "transparent",
                  color: active ? theme.primary : theme.textMuted,
                  minHeight: "48px",
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t md:hidden"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}20` }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px]"
              style={{ color: active ? theme.primary : theme.textMuted, minHeight: "48px" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Keyboard shortcuts help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-sm rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: theme.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold" style={{ color: theme.text }}>Keyboard Shortcuts</h3>
            <div className="space-y-3 text-sm">
              {NAV_ITEMS.map((i) => (
                <div key={i.shortcut} className="flex items-center justify-between">
                  <span style={{ color: theme.textMuted }}>{i.label}</span>
                  <kbd
                    className="rounded-lg px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${theme.textMuted}15`, color: theme.text }}
                  >
                    {i.shortcut}
                  </kbd>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span style={{ color: theme.textMuted }}>Toggle help</span>
                <kbd
                  className="rounded-lg px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${theme.textMuted}15`, color: theme.text }}
                >
                  ?
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8" style={{ fontSize: theme.fontSize }}>
          {children}
        </div>
      </main>
    </div>
  );
}
