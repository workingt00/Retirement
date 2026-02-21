"use client";

import { useMode } from "@/components/shared/ModeProvider";

export default function AmbientGlow() {
  const { theme } = useMode();

  return (
    <div
      className="pointer-events-none fixed inset-0 hidden overflow-hidden md:block"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          top: "-10%",
          right: "-5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.gradientFrom}08 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "drift 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "500px",
          height: "500px",
          bottom: "10%",
          left: "-5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.gradientTo}06 0%, transparent 70%)`,
          filter: "blur(40px)",
          animation: "drift 30s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "400px",
          height: "400px",
          top: "40%",
          left: "30%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.primary}04 0%, transparent 70%)`,
          filter: "blur(60px)",
          animation: "drift 20s ease-in-out infinite 2s",
        }}
      />
    </div>
  );
}
