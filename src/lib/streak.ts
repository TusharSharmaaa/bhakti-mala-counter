/**
 * Streak calculation and management utilities
 * Tracks consecutive days based on jap counting OR WhatsApp sharing
 */

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_jap_date: string | null;
  last_share_date: string | null;
  total_malas: number;
}

export interface StreakUpdate {
  didJapToday: boolean;
  sharedToday: boolean;
  japCount: number;
}

/**
 * Calculate streak based on jap counting or WhatsApp sharing
 * Streak continues if user did jap yesterday OR shared content yesterday
 */
export function calculateStreak(
  currentStreak: number,
  lastJapDate: string | null,
  lastShareDate: string | null,
  todayJapCount: number
): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Check if user did jap yesterday
  const didJapYesterday = lastJapDate === yesterday;
  
  // Check if user shared content yesterday
  const sharedYesterday = lastShareDate === yesterday;
  
  // Check if user did jap today
  const didJapToday = todayJapCount > 0;
  
  // Check if user shared today
  const sharedToday = lastShareDate === today;
  
  let newCurrentStreak = currentStreak;
  let newLongestStreak = currentStreak;
  
  // Streak logic:
  // 1. If user did jap today OR shared today, check if streak should continue
  if (didJapToday || sharedToday) {
    // If user did jap yesterday OR shared yesterday, continue streak
    if (didJapYesterday || sharedYesterday) {
      newCurrentStreak = currentStreak + 1;
    } else if (currentStreak === 0) {
      // Start new streak if current streak is 0
      newCurrentStreak = 1;
    }
    // If streak was broken (no jap and no share yesterday), start fresh
    else if (!didJapYesterday && !sharedYesterday) {
      newCurrentStreak = 1;
    }
  } else {
    // If user didn't do jap today AND didn't share today, check if streak should break
    if (currentStreak > 0 && !didJapYesterday && !sharedYesterday) {
      newCurrentStreak = 0;
    }
  }
  
  // Update longest streak if current streak is higher
  if (newCurrentStreak > currentStreak) {
    newLongestStreak = Math.max(currentStreak, newCurrentStreak);
  }
  
  return {
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_jap_date: didJapToday ? today : lastJapDate,
    last_share_date: sharedToday ? today : lastShareDate,
    total_malas: Math.floor(todayJapCount / 108)
  };
}

/**
 * Check if streak should be maintained based on yesterday's activity
 */
export function shouldMaintainStreak(
  lastJapDate: string | null,
  lastShareDate: string | null
): boolean {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return lastJapDate === yesterday || lastShareDate === yesterday;
}

/**
 * Get streak status message
 */
export function getStreakStatusMessage(currentStreak: number): string {
  if (currentStreak === 0) {
    return "Start your spiritual journey today!";
  } else if (currentStreak === 1) {
    return "Great start! Keep the momentum going!";
  } else if (currentStreak < 7) {
    return "Building a beautiful habit!";
  } else if (currentStreak < 30) {
    return "Amazing dedication!";
  } else if (currentStreak < 100) {
    return "Incredible spiritual discipline!";
  } else {
    return "Divine devotion at its finest!";
  }
}

/**
 * Get streak emoji based on current streak
 */
export function getStreakEmoji(currentStreak: number): string {
  if (currentStreak === 0) return "💪";
  if (currentStreak < 3) return "🌱";
  if (currentStreak < 7) return "🔥";
  if (currentStreak < 30) return "🏆";
  if (currentStreak < 100) return "👑";
  return "🕉️";
}

