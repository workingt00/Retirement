"use client";

import { motion } from "framer-motion";
import Avatar, { AVATAR_PRESETS } from "../scene-elements/Avatar";
import { useWizard } from "../store";
import { staggerContainer, staggerItem } from "../utils/animations";

export default function StepAvatar() {
  const { state, dispatch, goNext } = useWizard();

  const handleSelect = (id: string) => {
    dispatch({ type: "SET_AVATAR", avatarId: id });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
          Let&apos;s meet your future self
        </h1>
        <p className="mb-10 text-lg text-gray-400">
          Pick the character that feels like you
        </p>
      </div>

      <motion.div
        className="grid grid-cols-4 gap-3 md:gap-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {AVATAR_PRESETS.map((config) => (
          <motion.div
            key={config.id}
            variants={staggerItem}
            className="flex items-center justify-center"
          >
            <Avatar
              config={config}
              size={135}
              selected={state.avatarId === config.id}
              onClick={() => handleSelect(config.id)}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        className="mt-8 rounded-xl px-8 py-3 text-lg font-semibold transition-colors"
        onClick={goNext}
        disabled={!state.avatarId}
        whileHover={state.avatarId ? { scale: 1.03 } : undefined}
        whileTap={state.avatarId ? { scale: 0.97 } : undefined}
        style={{
          backgroundColor: state.avatarId ? "#F59E0B" : "rgba(148, 163, 184, 0.15)",
          color: state.avatarId ? "#1c1917" : "#64748b",
          cursor: state.avatarId ? "pointer" : "default",
        }}
      >
        Continue
      </motion.button>
    </div>
  );
}
