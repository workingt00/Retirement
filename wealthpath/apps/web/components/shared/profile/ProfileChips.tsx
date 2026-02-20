"use client";

import { motion } from "framer-motion";
import { useMode } from "@/components/shared/ModeProvider";

interface ChipOption {
  value: string;
  label: string;
}

interface ProfileChipsProps {
  options: ChipOption[];
  value: string | undefined | null;
  onChange: (value: string) => void;
}

export default function ProfileChips({ options, value, onChange }: ProfileChipsProps) {
  const { theme } = useMode();

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, i) => {
        const isSelected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: isSelected
                ? `linear-gradient(135deg, ${theme.gradientFrom}20, ${theme.gradientTo}20)`
                : theme.surfaceGlass,
              border: isSelected
                ? `1.5px solid ${theme.gradientFrom}50`
                : `1px solid ${theme.borderGlass}`,
              color: isSelected ? theme.text : theme.textMuted,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: isSelected ? theme.glowPrimary : "none",
              minHeight: "44px",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
