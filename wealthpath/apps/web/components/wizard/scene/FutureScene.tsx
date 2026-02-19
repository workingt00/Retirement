"use client";

import Ground from "../scene-elements/Ground";
import House, { getHouseTier } from "../scene-elements/House";
import Garden from "../scene-elements/Garden";
import Yard from "../scene-elements/Yard";

interface FutureSceneProps {
  avatarId: string | null;
  fogOpacity: number;
  developmentLevel: number; // 0-1 how rich the scene is
  retirementAge: number | null;
  savingsLevel: number; // 0-1 based on monthly savings
  width: number;
  height: number;
}

export default function FutureScene({
  developmentLevel,
  width,
  height,
}: FutureSceneProps) {
  const groundY = height * 0.82;
  const centerX = width * 0.5;
  const tier = developmentLevel > 0 ? getHouseTier(developmentLevel) : 0;

  // Layout: garden clearly to the left, house to the right, no overlap
  // Push garden further left for bigger houses (tiers 4-5) to avoid overlap
  const houseX = centerX + 15;
  const gardenOffset = tier >= 5 ? 190 : tier >= 4 ? 115 : 80;
  const gardenX = centerX - gardenOffset;

  return (
    <g>
      {/* Ground */}
      <Ground y={groundY} width={width} height={40} color="#1a4a0a" />

      {/* Yard (trees, fences, pool, etc.) — behind everything */}
      {tier > 0 && (
        <Yard x={centerX} y={groundY} tier={tier} width={width} />
      )}

      {/* Garden — clearly to the left of the house */}
      {tier > 0 && (
        <Garden x={gardenX} y={groundY - 8} bloomLevel={developmentLevel} />
      )}

      {/* House — to the right, rendered last so it's always in front */}
      {tier > 0 && (
        <House
          x={houseX}
          y={groundY - 5}
          developmentLevel={developmentLevel}
          scale={1.35}
        />
      )}
    </g>
  );
}
