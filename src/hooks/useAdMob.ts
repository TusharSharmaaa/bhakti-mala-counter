import { useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { ADS_ENABLED } from '@/config/ads';

// Safe hooks that use dynamic imports to avoid crashes in web preview
// AdMob only works in native Android/iOS builds

// Hook for banner ads
export function useBannerAd(enabled: boolean, position: 'top' | 'bottom' = 'bottom') {
  const mountedRef = useRef(false);
  
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    let cleanup: (() => void) | undefined;
    
    (async () => {
      if (!enabled || !ADS_ENABLED) return;
      
      try {
        const { getAdMobService } = await import('@/services/admob');
        const service = getAdMobService();
        
        await service.initialize();
        await service.showBanner(position);
        
        cleanup = () => {
          service.hideBanner().catch(() => {});
        };
      } catch (error) {
        // AdMob not available (web preview), silently ignore
      }
    })();

    return () => {
      cleanup?.();
    };
  }, [enabled, position]);
}

// Hook for interstitial ads with smart frequency management
export function useInterstitialAd() {
  const showAfterMalaCompletion = async (currentCount: number) => {
    const malasCompleted = Math.floor(currentCount / 108);
    if (malasCompleted % 3 !== 0) return false;

    try {
      const { getAdMobService, PLACEMENTS } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      return await service.showInterstitial(PLACEMENTS.INT_AFTER_3_MALAS);
    } catch {
      return false;
    }
  };

  const showAfterTimerSession = async (durationMinutes: number) => {
    if (durationMinutes < 10) return false;

    try {
      const { getAdMobService, PLACEMENTS } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      return await service.showInterstitial(PLACEMENTS.INT_TIMER_POST_SESSION);
    } catch {
      return false;
    }
  };

  return { showAfterMalaCompletion, showAfterTimerSession };
}

// Hook for rewarded ads
export function useRewardedAd() {
  const [isLoading, setIsLoading] = React.useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        const { getAdMobService } = await import('@/services/admob');
        const service = getAdMobService();
        await service.initialize();
        await service.preloadRewarded();
      } catch {
        // Ignore in web preview
      }
    })();
  }, []);

  const showForShareReward = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { getAdMobService, PLACEMENTS } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      const result = await service.showRewarded(PLACEMENTS.REW_SHARE_STATS_CARD);
      return result.watched;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { showForShareReward, isLoading };
}

// Check if AdMob is available (native environment)
export function useAdMobAvailable() {
  const [available, setAvailable] = React.useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    (async () => {
      try {
        const { getAdMobService } = await import('@/services/admob');
        const service = getAdMobService();
        await service.initialize();
        setAvailable(service.isAvailable());
      } catch {
        setAvailable(false);
      }
    })();
  }, []);

  return available;
}

// Developer/testing hook for manually triggering ads
export function useAdMobDebug() {
  const [stats, setStats] = React.useState<any>(null);
  const mountedRef = useRef(false);

  const refreshStats = async () => {
    try {
      const { getAdMobService } = await import('@/services/admob');
      const service = getAdMobService();
      const currentStats = service.getFrequencyStats();
      setStats(currentStats);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    refreshStats();
  }, []);

  const testBanner = async () => {
    try {
      const { getAdMobService } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      await service.showBanner('bottom');
    } catch (error) {
      console.error('Test banner failed:', error);
    }
  };

  const testInterstitial = async () => {
    try {
      const { getAdMobService } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      await service.showInterstitial('test_manual');
    } catch (error) {
      console.error('Test interstitial failed:', error);
    }
  };

  const testRewarded = async (): Promise<boolean> => {
    try {
      const { getAdMobService } = await import('@/services/admob');
      const service = getAdMobService();
      await service.initialize();
      const result = await service.showRewarded('test_manual_rewarded');
      return result.watched;
    } catch (error) {
      console.error('Test rewarded failed:', error);
      return false;
    }
  };

  return { stats, refreshStats, testBanner, testInterstitial, testRewarded };
}
