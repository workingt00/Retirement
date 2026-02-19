import type { ReactNode } from "react";

export default function GetStartedLayout({ children }: { children: ReactNode }) {
  // Override the marketing layout's white background.
  // The wizard renders its own full-screen dark container.
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0f172a]">
      {children}
    </div>
  );
}
