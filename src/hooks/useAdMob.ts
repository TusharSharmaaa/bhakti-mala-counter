import { useEffect, useRef, useState } from 'react';
import { adMobService, PLACEMENTS } from '@/services/admob';

// Hook for banner ads
export const useBannerAd = (enabled: boolean = true, position: 'top' | 'bottom' = 'bottom') => {
  useEffect(() => {
    if (!enabled) return;

    // Show banner when component mounts
    adMobService.showBanner(position);

    // Hide banner when component unmounts
    return () => {
      adMobService.hideBanner();
    };
  }, [enabled, position]);
};

// Hook for interstitial ads with smart triggering
export const useInterstitialAd = () => {
  const lastTriggerTime = useRef(0);
  const malaCompletionStack = useRef<number[]>([]);

  const showAfterMalaCompletion = async (currentCount: number) => {
    const now = Date.now();
    
    // Track mala completion times to detect rapid completions
    malaCompletionStack.current.push(now);
    
    // Keep only last 3 completions
    if (malaCompletionStack.current.length > 3) {
      malaCompletionStack.current.shift();
    }

    // Check if user completed multiple malas within 10 seconds (skip ad in this case)
    const recentCompletions = malaCompletionStack.current.filter(time => now - time < 10000);
    if (recentCompletions.length > 1) {
      console.log('Multiple malas completed quickly, skipping interstitial');
      return false;
    }

    // Check if this is a multiple of 3 malas (324 = 3*108)
    const malasCompleted = Math.floor(currentCount / 108);
    if (malasCompleted % 3 === 0 && malasCompleted > 0) {
      // Show interstitial after mala completion
      return await adMobService.showInterstitial(PLACEMENTS.INT_AFTER_3_MALAS);
    }

    return false;
  };

  const showAfterTimerSession = async (durationMinutes: number) => {
    // Only show if session was at least 10 minutes
    if (durationMinutes >= 10) {
      return await adMobService.showInterstitial(PLACEMENTS.INT_TIMER_POST_SESSION);
    }
    return false;
  };

  return {
    showAfterMalaCompletion,
    showAfterTimerSession,
  };
};

// Hook for rewarded ads
export const useRewardedAd = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Preload rewarded ad when hook mounts
    adMobService.preloadRewarded();
  }, []);

  const showForShareReward = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await adMobService.showRewarded(PLACEMENTS.REW_SHARE_STATS_CARD);
      return result.watched;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showForShareReward,
    isLoading,
  };
};

// Hook for checking AdMob availability
export const useAdMobAvailable = () => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Check if we're in native environment
    const checkAvailability = () => {
      setAvailable(adMobService.isAvailable());
    };

    checkAvailability();
    
    // Re-check after a delay in case initialization is slow
    const timer = setTimeout(checkAvailability, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return available;
};

// Developer hook for testing ads
export const useAdMobDebug = () => {
  const [stats, setStats] = useState<any>(null);

  const refreshStats = () => {
    setStats(adMobService.getFrequencyStats());
  };

  const testBanner = () => {
    adMobService.showBanner('bottom');
  };

  const testInterstitial = () => {
    adMobService.showInterstitial('test_placement');
  };

  const testRewarded = async () => {
    const result = await adMobService.showRewarded('test_placement');
    return result.watched;
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return {
    stats,
    refreshStats,
    testBanner,
    testInterstitial,
    testRewarded,
  };
};
