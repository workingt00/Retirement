"use client";

import { motion, type MotionValue } from "framer-motion";
import Ground from "../scene-elements/Ground";
import Car from "../scene-elements/Car";
import { type AvatarConfig } from "../scene-elements/Avatar";

interface TodaySceneProps {
  avatarId: string | null;
  showWorkspace: boolean;
  incomeLevel: number;
  carXSpring: MotionValue<number>;
  width: number;
  height: number;
  avatarConfig?: AvatarConfig | null;
}

export default function TodayScene({
  incomeLevel,
  carXSpring,
  width,
  height,
  avatarConfig,
}: TodaySceneProps) {
  const groundY = height * 0.82;

  return (
    <g>
      <Ground y={groundY} width={width} height={40} color="#2D5016" />
      <motion.g style={{ x: carXSpring }}>
        <Car
          x={0}
          y={groundY}
          incomeLevel={incomeLevel}
          sceneWidth={width}
          avatarConfig={avatarConfig}
        />
      </motion.g>
    </g>
  );
}
