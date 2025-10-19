import { supabase } from '@/integrations/supabase/client';
import { StreakData, calculateStreak } from '@/lib/streak';

/**
 * Supabase integration for streak management
 */

export interface StreakRecord {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_jap_date: string | null;
  last_share_date: string | null;
  total_malas: number;
  created_at: string;
  updated_at: string;
}

/**
 * Load user's streak data from Supabase
 */
export async function loadStreakData(): Promise<StreakData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error loading streak data:', error);
      return null;
    }

    return {
      current_streak: data.current_streak || 0,
      longest_streak: data.longest_streak || 0,
      last_jap_date: data.last_jap_date,
      last_share_date: data.last_share_date,
      total_malas: data.total_malas || 0
    };
  } catch (error) {
    console.error('Error loading streak data:', error);
    return null;
  }
}

/**
 * Save streak data to Supabase
 */
export async function saveStreakData(streakData: StreakData): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('streaks')
      .upsert({
        user_id: user.id,
        current_streak: streakData.current_streak,
        longest_streak: streakData.longest_streak,
        last_jap_date: streakData.last_jap_date,
        last_share_date: streakData.last_share_date,
        total_malas: streakData.total_malas,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving streak data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving streak data:', error);
    return false;
  }
}

/**
 * Update streak when user does jap counting
 */
export async function updateStreakOnJap(japCount: number): Promise<StreakData | null> {
  try {
    const currentStreakData = await loadStreakData();
    if (!currentStreakData) {
      // Create new streak record
      const newStreakData = calculateStreak(0, null, null, japCount);
      await saveStreakData(newStreakData);
      return newStreakData;
    }

    const updatedStreakData = calculateStreak(
      currentStreakData.current_streak,
      currentStreakData.last_jap_date,
      currentStreakData.last_share_date,
      japCount
    );

    await saveStreakData(updatedStreakData);
    return updatedStreakData;
  } catch (error) {
    console.error('Error updating streak on jap:', error);
    return null;
  }
}

/**
 * Update streak when user shares content on WhatsApp
 */
export async function updateStreakOnShare(): Promise<StreakData | null> {
  try {
    const currentStreakData = await loadStreakData();
    if (!currentStreakData) {
      // Create new streak record
      const newStreakData = calculateStreak(0, null, null, 0);
      newStreakData.last_share_date = new Date().toISOString().split('T')[0];
      await saveStreakData(newStreakData);
      return newStreakData;
    }

    const updatedStreakData = calculateStreak(
      currentStreakData.current_streak,
      currentStreakData.last_jap_date,
      currentStreakData.last_share_date,
      0
    );

    // Mark today as shared
    updatedStreakData.last_share_date = new Date().toISOString().split('T')[0];

    await saveStreakData(updatedStreakData);
    return updatedStreakData;
  } catch (error) {
    console.error('Error updating streak on share:', error);
    return null;
  }
}

/**
 * Initialize streak record for new user
 */
export async function initializeStreak(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('streaks')
      .insert({
        user_id: user.id,
        current_streak: 0,
        longest_streak: 0,
        last_jap_date: null,
        last_share_date: null,
        total_malas: 0
      });

    if (error) {
      console.error('Error initializing streak:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing streak:', error);
    return false;
  }
}

