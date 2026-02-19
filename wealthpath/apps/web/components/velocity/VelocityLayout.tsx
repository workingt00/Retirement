"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMode } from "@/components/shared/ModeProvider";
import { useEffect, useCallback, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", shortcut: "D" },
  { href: "/strategy", label: "Moves", shortcut: "M" },
  { href: "/scenarios", label: "Scenarios", shortcut: "S" },
  { href: "/insights", label: "Insights", shortcut: "I" },
  { href: "/timeline", label: "Timeline", shortcut: "T" },
  { href: "/settings", label: "Params", shortcut: "P" },
];

export default function VelocityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useMode();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") {
        setShowHelp((h) => !h);
        return;
      }
      const item = NAV_ITEMS.find((i) => i.shortcut.toLowerCase() === e.key.toLowerCase());
      if (item) window.location.href = item.href;
    },
    [],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="velocity-scale flex min-h-screen flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: theme.fontFamily, fontSize: theme.fontSize }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between border-b px-4 py-2"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}20` }}
      >
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold" style={{ color: theme.primary }}>
            WP
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: active ? `${theme.primary}20` : "transparent",
                    color: active ? theme.primary : theme.textMuted,
                  }}
                >
                  {item.label}
                  <kbd
                    className="rounded px-1 text-[10px]"
                    style={{ backgroundColor: `${theme.textMuted}20`, color: theme.textMuted }}
                  >
                    {item.shortcut}
                  </kbd>
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={() => setShowHelp((h) => !h)}
          className="rounded px-2 py-1 text-xs"
          style={{ color: theme.textMuted }}
        >
          ? Help
        </button>
      </header>

      {/* Mobile nav */}
      <nav
        className="flex border-b md:hidden"
        style={{ backgroundColor: theme.surface, borderColor: `${theme.textMuted}20` }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 py-2 text-center text-[11px] font-medium"
              style={{ color: active ? theme.primary : theme.textMuted }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-sm rounded-lg p-6"
            style={{ backgroundColor: theme.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-sm font-bold">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-xs">
              {NAV_ITEMS.map((i) => (
                <div key={i.shortcut} className="flex justify-between">
                  <span style={{ color: theme.textMuted }}>{i.label}</span>
                  <kbd className="rounded bg-gray-700 px-1.5 py-0.5">{i.shortcut}</kbd>
                </div>
              ))}
              <div className="flex justify-between">
                <span style={{ color: theme.textMuted }}>Toggle help</span>
                <kbd className="rounded bg-gray-700 px-1.5 py-0.5">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
