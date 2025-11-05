import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { ADS_TEST_MODE } from '@/config/ads';

// Platform detection helper
const platformKey = (): 'android' | 'ios' => {
  return (Capacitor.getPlatform() === 'ios' ? 'ios' : 'android') as 'android' | 'ios';
};

// Production Ad Unit IDs - Platform-specific
export const AD_UNITS = {
  android: {
    banner: 'ca-app-pub-2816806517862101/8728062518',
    interstitial: 'ca-app-pub-2816806517862101/2144781799',
    rewarded: 'ca-app-pub-2816806517862101/1671699576',
    native: 'ca-app-pub-2816806517862101/3747855119',
  },
  ios: {
    banner: 'ca-app-pub-2816806517862101/8728062518', // Same for now, can be updated later
    interstitial: 'ca-app-pub-2816806517862101/2144781799',
    rewarded: 'ca-app-pub-2816806517862101/1671699576',
    native: 'ca-app-pub-2816806517862101/3747855119',
  },
};

// Google official test Ad Unit IDs
const TEST_AD_UNITS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
    native: 'ca-app-pub-3940256099942544/2247696110',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    native: 'ca-app-pub-3940256099942544/3986624511',
  },
};

// Helper to get ad units for current platform
const getAdUnits = () => {
  const platform = platformKey();
  const units = (ADS_TEST_MODE ? TEST_AD_UNITS : AD_UNITS)[platform];
  console.log('[AdMob] platform=', platform, 'mode=', ADS_TEST_MODE ? 'TEST' : 'PROD', 'banner=', units.banner, 'interstitial=', units.interstitial, 'rewarded=', units.rewarded);
  return units;
};

// App ID for AndroidManifest.xml: ca-app-pub-2816806517862101~3158480561

// Placement IDs for tracking
export const PLACEMENTS = {
  BANNER_GLOBAL_BOTTOM: 'banner_global_bottom',
  INT_AFTER_3_MALAS: 'int_after_3_malas',
  INT_TIMER_POST_SESSION: 'int_timer_post_session',
  INT_CONTENT_EXIT: 'int_content_exit',
  REW_SHARE_STATS_CARD: 'rew_share_stats_card',
  REW_TIMER_DOUBLE_MINUTES: 'rew_timer_double_minutes',
  REW_CONTENT_PREMIUM_SHARE: 'rew_content_premium_share',
  NATIVE_CONTENT_STREAM: 'native_content_stream',
};

// Remote config defaults (can be overridden)
export const AD_CONFIG = {
  enabled: true,
  banner: {
    enabled_counter: true,
    enabled_stats: true,
    enabled_content: true,
    enabled_settings: true,
    enabled_timer: false, // Hidden during active meditation
  },
  interstitial: {
    max_per_day: 6,
    cooldown_minutes: 3,
    enabled_after_3_malas: true,
    enabled_timer_post_session: false,
    timer_min_duration_minutes: 10,
    enabled_content_exit: false,
    content_exit_min_dwell_seconds: 45,
  },
  native: {
    frequency_every_n_items: 3,
    enabled_content: true,
  },
  rewarded: {
    enabled_share_stats: true,
    enabled_timer_double_minutes: false,
  },
  consent: {
    enforce_ump: true,
  },
};

// State management for ad frequency caps
class AdFrequencyManager {
  private static STORAGE_KEY = 'ad_frequency_data';
  
  private data: {
    interstitial_shown_today: number;
    last_interstitial_shown_at: number;
    last_date: string;
    placement_history: Record<string, number>;
  };

  constructor() {
    this.data = this.loadData();
    this.checkDayReset();
  }

  private loadData() {
    const stored = localStorage.getItem(AdFrequencyManager.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      interstitial_shown_today: 0,
      last_interstitial_shown_at: 0,
      last_date: new Date().toDateString(),
      placement_history: {},
    };
  }

  private saveData() {
    localStorage.setItem(AdFrequencyManager.STORAGE_KEY, JSON.stringify(this.data));
  }

  private checkDayReset() {
    const today = new Date().toDateString();
    if (this.data.last_date !== today) {
      this.data.interstitial_shown_today = 0;
      this.data.last_date = today;
      this.saveData();
    }
  }

  canShowInterstitial(): boolean {
    this.checkDayReset();
    
    const now = Date.now();
    const cooldownMs = AD_CONFIG.interstitial.cooldown_minutes * 60 * 1000;
    const timeSinceLastAd = now - this.data.last_interstitial_shown_at;
    
    const withinDailyLimit = this.data.interstitial_shown_today < AD_CONFIG.interstitial.max_per_day;
    const cooldownPassed = timeSinceLastAd >= cooldownMs;
    
    return withinDailyLimit && cooldownPassed;
  }

  recordInterstitialShown(placement: string) {
    this.data.interstitial_shown_today++;
    this.data.last_interstitial_shown_at = Date.now();
    this.data.placement_history[placement] = Date.now();
    this.saveData();
  }

  getInterstitialStats() {
    return {
      shown_today: this.data.interstitial_shown_today,
      max_per_day: AD_CONFIG.interstitial.max_per_day,
      last_shown: this.data.last_interstitial_shown_at,
      cooldown_ms: AD_CONFIG.interstitial.cooldown_minutes * 60 * 1000,
    };
  }
}

export const frequencyManager = new AdFrequencyManager();

// AdMob Service
class AdMobService {
  private initialized = false;
  private bannerVisible = false;
  private interstitialLoaded = false;
  private rewardedLoaded = false;
  private appLaunchTime = Date.now();

  async initialize() {
    if (this.initialized) return;

    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: ADS_TEST_MODE,
      });

      this.initialized = true;
      console.log('[AdMob] initialized', { mode: ADS_TEST_MODE ? 'TEST' : 'PROD' });
      console.log('[AdMob] platform=', platformKey());

      // Preload ads in background
      await this.preloadInterstitial();
      await this.preloadRewarded();
      
    } catch (error: any) {
      console.error('[AdMob] initialization failed:', error?.code || error?.message || error);
    }
  }

  // Banner Ads
  async showBanner(position: 'top' | 'bottom' = 'bottom') {
    if (!AD_CONFIG.enabled) {
      console.log('[AdMob] showBanner skipped: AD_CONFIG.enabled = false');
      return;
    }
    
    if (this.bannerVisible) {
      console.log('[AdMob] showBanner skipped: banner already visible');
      return;
    }

    const units = getAdUnits();
    const adId = units.banner;
    const platform = platformKey();

    console.log('[AdMob] showBanner request', { adId, platform, position });

    const baseOptions = (adId: string): BannerAdOptions => ({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'bottom' ? BannerAdPosition.BOTTOM_CENTER : BannerAdPosition.TOP_CENTER,
      margin: 0,
    });

    // If a banner is already visible, remove it before showing a new one
    if (this.bannerVisible) {
      try { await AdMob.removeBanner(); } catch {}
      this.bannerVisible = false;
      try { document.body.classList.remove('has-banner-ad'); } catch {}
    }

    let attemptedTest = false;
    let loadedListener: any;
    let failedListener: any;

    const cleanupListeners = () => {
      try { loadedListener?.remove?.(); } catch {}
      try { failedListener?.remove?.(); } catch {}
    };

    try {
      const options: BannerAdOptions = {
        adId: adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: position === 'bottom' ? BannerAdPosition.BOTTOM_CENTER : BannerAdPosition.TOP_CENTER,
        margin: 0,
      };

      await AdMob.showBanner(options);
      this.bannerVisible = true;
      
      // Add CSS class to body to adjust layout
      if (typeof document !== 'undefined') {
        document.body.classList.add('has-banner-ad');
      }
      
      console.log('[AdMob] banner shown successfully', { adId, platform });
    } catch (error: any) {
      console.warn('[AdMob] banner error', { 
        code: error?.code, 
        message: error?.message || error,
        adId,
        platform 
      });
      // NO TEST FALLBACK - Silently skip if ad fails
    }
  }

  async hideBanner() {
    if (!this.bannerVisible) return;

    try {
      await AdMob.hideBanner();
      this.bannerVisible = false;
<<<<<<< HEAD
      try { document.body.classList.remove('has-banner-ad'); } catch {}
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner:', error);
=======
      // Remove CSS class from body
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-banner-ad');
      }
      console.log('[AdMob] banner hidden');
    } catch (error: any) {
      console.error('[AdMob] hideBanner error', { code: error?.code, message: error?.message || error });
>>>>>>> aa83e6c (New branch created and pushed)
    }
  }

  async removeBanner() {
    if (!this.bannerVisible) return;

    try {
      await AdMob.removeBanner();
      this.bannerVisible = false;
<<<<<<< HEAD
      try { document.body.classList.remove('has-banner-ad'); } catch {}
      console.log('Banner ad removed');
    } catch (error) {
      console.error('Failed to remove banner:', error);
=======
      // Remove CSS class from body
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-banner-ad');
      }
      console.log('[AdMob] banner removed');
    } catch (error: any) {
      console.error('[AdMob] removeBanner error', { code: error?.code, message: error?.message || error });
>>>>>>> aa83e6c (New branch created and pushed)
    }
  }

  // Interstitial Ads
  async preloadInterstitial() {
    if (this.interstitialLoaded) return;

    const units = getAdUnits();
    const adId = units.interstitial;
    const platform = platformKey();

    console.log('[AdMob] preloadInterstitial request', { adId, platform });

    try {
      await AdMob.prepareInterstitial({ adId: adId });
      this.interstitialLoaded = true;
      console.log('[AdMob] interstitial preloaded', { adId, platform });
    } catch (error: any) {
      console.warn('[AdMob] preloadInterstitial error', { 
        code: error?.code, 
        message: error?.message || error,
        adId,
        platform 
      });
      // NO TEST FALLBACK - Retry with backoff
      setTimeout(() => this.preloadInterstitial(), 30000);
    }
  }

  async showInterstitial(placement: string): Promise<boolean> {
    // Check if we're within first 15 seconds of app launch
    const timeSinceLaunch = Date.now() - this.appLaunchTime;
    if (timeSinceLaunch < 15000) {
      console.log('[AdMob] showInterstitial skipped: within first 15 seconds of app launch');
      return false;
    }

    if (!AD_CONFIG.enabled) {
      console.log('[AdMob] showInterstitial skipped: AD_CONFIG.enabled = false');
      return false;
    }

    // Check frequency manager first - skip quickly if not available
    if (!frequencyManager.canShowInterstitial()) {
      console.log('[AdMob] showInterstitial skipped: frequency cap reached');
      return false;
    }

    if (!this.interstitialLoaded) {
      await this.preloadInterstitial();
      if (!this.interstitialLoaded) {
        console.log('[AdMob] showInterstitial skipped: not loaded');
        return false;
      }
    }

    const units = getAdUnits();
    const platform = platformKey();

    console.log('[AdMob] showInterstitial request', { placement, adId: units.interstitial, platform });

    try {
      await AdMob.showInterstitial();
      frequencyManager.recordInterstitialShown(placement);
      this.interstitialLoaded = false;
      // Preload next one after cooldown
      setTimeout(() => this.preloadInterstitial(), AD_CONFIG.interstitial.cooldown_minutes * 60 * 1000);
      console.log('[AdMob] interstitial shown', { placement, adId: units.interstitial, platform });
      return true;
    } catch (error: any) {
      console.warn('[AdMob] showInterstitial error', { 
        code: error?.code, 
        message: error?.message || error,
        placement,
        adId: units.interstitial,
        platform 
      });
      this.interstitialLoaded = false;
      this.preloadInterstitial();
      return false;
    }
  }

  // Rewarded Ads
  async preloadRewarded() {
    if (this.rewardedLoaded) return;

    const units = getAdUnits();
    const adId = units.rewarded;
    const platform = platformKey();

    console.log('[AdMob] preloadRewarded request', { adId, platform });

    try {
      await AdMob.prepareRewardVideoAd({ adId: adId });
      this.rewardedLoaded = true;
      console.log('[AdMob] rewarded preloaded', { adId, platform });
    } catch (error: any) {
      console.warn('[AdMob] preloadRewarded error', { 
        code: error?.code, 
        message: error?.message || error,
        adId,
        platform 
      });
      // NO TEST FALLBACK - Silently skip if ad fails
    }
  }

  async showRewarded(placement: string): Promise<{ completed: boolean }> {
    if (!AD_CONFIG.enabled) {
      console.log('[AdMob] showRewarded skipped: AD_CONFIG.enabled = false');
      return { completed: false };
    }
    
    // If not loaded, try to preload but don't wait too long
    if (!this.rewardedLoaded) {
      await this.preloadRewarded();
      if (!this.rewardedLoaded) {
        console.log('[AdMob] showRewarded skipped: not loaded');
        return { completed: false };
      }
    }

    const units = getAdUnits();
    const platform = platformKey();

    console.log('[AdMob] showRewarded request', { placement, adId: units.rewarded, platform });

    return new Promise((resolve) => {
      let rewarded = false;
      let rewardListener: any;
      let dismissListener: any;

      // Listen for reward event
      rewardListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        rewarded = true;
        console.log('[AdMob] rewarded ad completed', { placement, reward, adId: units.rewarded, platform });
      });

      // Listen for dismissed event (fires when user closes ad, whether they watched or skipped)
      dismissListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
        this.rewardedLoaded = false;
        this.preloadRewarded(); // Preload next one
        
        console.log('[AdMob] rewarded ad dismissed', { placement, completed: rewarded, adId: units.rewarded, platform });
        
        // Resolve with completed: true if user watched, false if skipped
        resolve({ completed: rewarded });
        
        // Clean up listeners
        if (rewardListener) rewardListener.remove();
        if (dismissListener) dismissListener.remove();
      });

      // Show the ad
      AdMob.showRewardVideoAd().catch((error: any) => {
        console.warn('[AdMob] showRewarded error', { 
          code: error?.code, 
          message: error?.message || error,
          placement,
          adId: units.rewarded,
          platform 
        });
        this.rewardedLoaded = false;
        this.preloadRewarded();
        resolve({ completed: false });
        // Clean up listeners
        if (rewardListener) rewardListener.remove();
        if (dismissListener) dismissListener.remove();
      });
    });
  }

  // Helper to check if AdMob is available (native environment)
  isAvailable(): boolean {
    return this.initialized;
  }

  // Get frequency stats for debugging
  getFrequencyStats() {
    return frequencyManager.getInterstitialStats();
  }
}

let adMobServiceInstance: AdMobService | null = null;

export const getAdMobService = (): AdMobService => {
  if (!adMobServiceInstance) {
    adMobServiceInstance = new AdMobService();
  }
  return adMobServiceInstance;
};

// Note: AdMob will be initialized lazily when first hook is used
// This prevents interference with React initialization

