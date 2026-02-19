import { Move, UserPlan } from './types';

// Helper to check if a move is active for a given age
export function isMoveActive(move: Move, age: number): boolean {
  return move.enabled && age >= move.startAge;
}

// Get a move by ID from the moves array
export function getMove(moves: Move[], id: string): Move | undefined {
  return moves.find(m => m.id === id);
}

// Get the effective amount for a move, handling unit types
export function getMoveAmount(move: Move, balance?: number): number {
  if (!move.enabled) return 0;
  if (move.unit === "full_balance") return balance ?? 0;
  if (move.unit === "%") return (balance ?? 0) * move.amount;
  if (move.unit === "auto") return 0; // Handled by engine logic
  return move.amount;
}

// Compute catch-up contribution amount based on age (R1)
export function getCatchUpAmount(age: number, r1Move: Move | undefined): number {
  if (!r1Move || !r1Move.enabled || age < r1Move.startAge) return 0;
  if (age >= 60 && age <= 63) return 11250;
  if (age >= 50) return 7500;
  return 0;
}

// Compute RMD factor (simplified) for R3
export function getRMDFactor(age: number): number {
  // IRS Uniform Lifetime Table (simplified)
  const table: Record<number, number> = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
    78: 22.0, 79: 21.1, 80: 20.2,
  };
  return table[age] ?? 20.0;
}
