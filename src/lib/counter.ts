/**
 * Counter math and progress calculation
 * Fixes the 1% progress bug by correctly calculating percentage
 */

export interface ProgressInfo {
  percentage: number;
  rounds: number;
  remaining: number;
  currentMalaCount: number;
}

export function calculateProgress(count: number, goal: number = 108): ProgressInfo {
  const currentMalaCount = count % goal;
  const percentage = Math.floor((currentMalaCount * 100) / goal);
  const rounds = Math.floor(count / goal);
  const remaining = goal - currentMalaCount;
  
  return {
    percentage,
    rounds,
    remaining,
    currentMalaCount
  };
}

export function isMilestone(count: number): 'complete' | 'major' | 'minor' | null {
  const malaCount = count % 108;
  if (malaCount === 0 && count > 0) return 'complete'; // Mala complete
  if (malaCount === 27 || malaCount === 54 || malaCount === 81) return 'major';
  if (malaCount === 9 || malaCount === 21 || malaCount === 36 || malaCount === 63 || malaCount === 99) return 'minor';
  return null;
}
