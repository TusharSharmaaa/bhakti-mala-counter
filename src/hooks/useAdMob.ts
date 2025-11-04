import { useEffect, useRef, useState } from 'react';
import { getAdMobService, PLACEMENTS } from '@/services/admob';

// Hook for banner ads
export const useBannerAd = (enabled: boolean = true, position: 'top' | 'bottom' = 'bottom') => {
  useEffect(() => {
    const adMobService = getAdMobService();
    
    // Initialize AdMob on first use
    adMobService.initialize().catch(console.error);
    
    if (!enabled) return;

    // Show banner when component mounts
    const showBannerAsync = async () => {
      await adMobService.initialize();
      await adMobService.showBanner(position);
    };
    
    showBannerAsync().catch(console.error);

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
    const adMobService = getAdMobService();
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
    const adMobService = getAdMobService();
    
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
    // Initialize and preload rewarded ad when hook mounts
    const initAndPreload = async () => {
      const adMobService = getAdMobService();
      await adMobService.initialize();
      await adMobService.preloadRewarded();
    };
    initAndPreload().catch(console.error);
  }, []);

  const showForShareReward = async (): Promise<boolean> => {
    const adMobService = getAdMobService();
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
    const checkAvailability = async () => {
      const adMobService = getAdMobService();
      await adMobService.initialize();
      setAvailable(adMobService.isAvailable());
    };

    checkAvailability().catch(console.error);
    
    // Re-check after a delay in case initialization is slow
    const timer = setTimeout(() => {
      checkAvailability().catch(console.error);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return available;
};

// Developer hook for testing ads
export const useAdMobDebug = () => {
  const [stats, setStats] = useState<any>(null);

  const refreshStats = () => {
    const adMobService = getAdMobService();
    setStats(adMobService.getFrequencyStats());
  };

  const testBanner = () => {
    const adMobService = getAdMobService();
    adMobService.showBanner('bottom');
  };

  const testInterstitial = () => {
    const adMobService = getAdMobService();
    adMobService.showInterstitial('test_placement');
  };

  const testRewarded = async () => {
    const adMobService = getAdMobService();
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
