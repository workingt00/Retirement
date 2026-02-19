import { Move } from './types';

export const MOVE_CONFLICTS: [string, string][] = [
  ["C1", "C2"], ["C3", "C8"],
  ["W0", "W1"], ["W0", "W7"], ["W1", "W7"],
  ["W2", "W9"], ["W3", "W8"], ["W4", "W10"],
  ["X1", "W8"], ["X4", "W10"], ["L1", "L5"],
  ["W11", "W2"], ["W11", "W3"], ["W11", "W4"],
  ["W11", "W8"], ["W11", "W9"], ["W11", "W10"],
];

export function detectConflicts(moves: Move[]): { moveId: string; conflictsWith: string }[] {
  const enabled = new Set(moves.filter(m => m.enabled).map(m => m.id));
  const conflicts: { moveId: string; conflictsWith: string }[] = [];
  for (const [a, b] of MOVE_CONFLICTS) {
    if (enabled.has(a) && enabled.has(b)) {
      conflicts.push({ moveId: a, conflictsWith: b });
    }
  }
  return conflicts;
}
