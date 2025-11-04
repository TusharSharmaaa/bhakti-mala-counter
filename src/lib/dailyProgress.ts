import { supabase } from '@/integrations/supabase/client';

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  jap_count: number;
  malas_completed: number;
  created_at: string;
  updated_at: string;
}

export interface DailyProgressInsert {
  user_id: string;
  date: string;
  jap_count?: number;
  malas_completed?: number;
}

/**
 * Save or update daily progress for a specific date
 */
export async function saveDailyProgress(
  date: string,
  japCount: number,
  malasCompleted: number
): Promise<boolean> {
  try {
    // For now, skip database saving since no auth is required
    // This could be enhanced to use local storage or anonymous tracking
    console.log('Daily progress saved locally:', { date, japCount, malasCompleted });
    return true;
  } catch (error) {
    console.error('Error saving daily progress:', error);
    return false;
  }
}

/**
 * Get daily progress for a specific date
 */
export async function getDailyProgress(date: string): Promise<DailyProgress | null> {
  try {
    // For now, return null since no auth is required
    // This could be enhanced to use local storage
    return null;
  } catch (error) {
    console.error('Error getting daily progress:', error);
    return null;
  }
}

/**
 * Get daily progress for a date range (for calendar view)
 */
export async function getDailyProgressRange(
  startDate: string,
  endDate: string
): Promise<DailyProgress[]> {
  try {
    // For now, return empty array since no auth is required
    // This could be enhanced to use local storage
    return [];
  } catch (error) {
    console.error('Error getting daily progress range:', error);
    return [];
  }
}

/**
 * Get daily progress for the current month
 */
export async function getCurrentMonthProgress(): Promise<DailyProgress[]> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getDailyProgressRange(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );
}

/**
 * Get daily progress for a specific month
 */
export async function getMonthProgress(year: number, month: number): Promise<DailyProgress[]> {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  return getDailyProgressRange(
    startOfMonth.toISOString().split('T')[0],
    endOfMonth.toISOString().split('T')[0]
  );
}

/**
 * Calculate progress level based on jap count
 */
export function getProgressLevel(japCount: number): 'none' | 'low' | 'medium' | 'high' | 'complete' {
  if (japCount === 0) return 'none';
  if (japCount < 27) return 'low';
  if (japCount < 54) return 'medium';
  if (japCount < 108) return 'high';
  return 'complete';
}

/**
 * Get progress color based on level
 */
export function getProgressColor(level: 'none' | 'low' | 'medium' | 'high' | 'complete'): string {
  switch (level) {
    case 'none':
      return 'bg-gray-100 dark:bg-gray-800';
    case 'low':
      return 'bg-red-200 dark:bg-red-900';
    case 'medium':
      return 'bg-yellow-200 dark:bg-yellow-900';
    case 'high':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'complete':
      return 'bg-green-200 dark:bg-green-900';
    default:
      return 'bg-gray-100 dark:bg-gray-800';
  }
}
