import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, InterstitialAdPluginEvents, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';

// Production Ad Unit IDs
export const AD_UNITS = {
  banner: 'ca-app-pub-2816806517862101/8728062518',
  interstitial: 'ca-app-pub-2816806517862101/2144781799',
  rewarded: 'ca-app-pub-2816806517862101/1671699576',
  native: 'ca-app-pub-2816806517862101/3747855119',
};

// Google test Ad Unit IDs (fallback for emulator/no-fill scenarios)
const TEST_AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
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
        // requestTrackingAuthorization will be handled automatically
        testingDevices: [], // Add device IDs for testing
        initializeForTesting: false, // Set to true during development
      });

      this.initialized = true;
      console.log('AdMob initialized successfully');

      // Preload ads in background
      this.preloadInterstitial();
      
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  // Banner Ads
  async showBanner(position: 'top' | 'bottom' = 'bottom') {
    if (!AD_CONFIG.enabled || this.bannerVisible) return;

    try {
      const options: BannerAdOptions = {
        adId: AD_UNITS.banner,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: position === 'bottom' ? BannerAdPosition.BOTTOM_CENTER : BannerAdPosition.TOP_CENTER,
        margin: 0,
      };

      await AdMob.showBanner(options);
      this.bannerVisible = true;
      console.log('Banner ad shown (production)');
    } catch (error) {
      console.warn('Prod banner failed, retrying with TEST unit:', error);
      try {
        await AdMob.showBanner({
          adId: TEST_AD_UNITS.banner,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: position === 'bottom' ? BannerAdPosition.BOTTOM_CENTER : BannerAdPosition.TOP_CENTER,
          margin: 0,
        });
        this.bannerVisible = true;
        console.log('Banner ad shown (TEST)');
      } catch (e) {
        console.error('Failed to show banner (both prod and test):', e);
      }
    }
  }

  async hideBanner() {
    if (!this.bannerVisible) return;

    try {
      await AdMob.hideBanner();
      this.bannerVisible = false;
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  }

  async removeBanner() {
    if (!this.bannerVisible) return;

    try {
      await AdMob.removeBanner();
      this.bannerVisible = false;
      console.log('Banner ad removed');
    } catch (error) {
      console.error('Failed to remove banner:', error);
    }
  }

  // Interstitial Ads
  async preloadInterstitial() {
    if (this.interstitialLoaded) return;

    try {
      await AdMob.prepareInterstitial({ adId: AD_UNITS.interstitial });
      this.interstitialLoaded = true;
      console.log('Interstitial preloaded (production)');
    } catch (error) {
      console.warn('Prod interstitial preload failed, retrying with TEST unit:', error);
      try {
        await AdMob.prepareInterstitial({ adId: TEST_AD_UNITS.interstitial });
        this.interstitialLoaded = true;
        console.log('Interstitial preloaded (TEST)');
      } catch (e) {
        console.error('Failed to preload interstitial (both prod and test):', e);
        // Retry with backoff
        setTimeout(() => this.preloadInterstitial(), 30000);
      }
    }
  }

  async showInterstitial(placement: string): Promise<boolean> {
    // Check if we're within first 15 seconds of app launch
    const timeSinceLaunch = Date.now() - this.appLaunchTime;
    if (timeSinceLaunch < 15000) {
      console.log('Skipping interstitial: within first 15 seconds of app launch');
      return false;
    }

    if (!AD_CONFIG.enabled) return false;

    if (!this.interstitialLoaded) {
      await this.preloadInterstitial();
      if (!this.interstitialLoaded) return false;
    }

    if (!frequencyManager.canShowInterstitial()) {
      console.log('Interstitial frequency cap reached, skipping');
      return false;
    }

    try {
      await AdMob.showInterstitial();
      frequencyManager.recordInterstitialShown(placement);
      this.interstitialLoaded = false;
      // Preload next one after cooldown
      setTimeout(() => this.preloadInterstitial(), AD_CONFIG.interstitial.cooldown_minutes * 60 * 1000);
      console.log(`Interstitial shown: ${placement}`);
      return true;
    } catch (error) {
      console.warn('Show interstitial failed, retrying once with TEST preload:', error);
      this.interstitialLoaded = false;
      try {
        // Force test preload then show
        await AdMob.prepareInterstitial({ adId: TEST_AD_UNITS.interstitial });
        await AdMob.showInterstitial();
        frequencyManager.recordInterstitialShown(placement);
        setTimeout(() => this.preloadInterstitial(), AD_CONFIG.interstitial.cooldown_minutes * 60 * 1000);
        console.log(`Interstitial shown after TEST retry: ${placement}`);
        return true;
      } catch (e) {
        console.error('Failed to show interstitial after TEST retry:', e);
        this.preloadInterstitial();
        return false;
      }
    }
  }

  // Rewarded Ads
  async preloadRewarded() {
    if (this.rewardedLoaded) return;

    try {
      await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded });
      this.rewardedLoaded = true;
      console.log('Rewarded ad preloaded (production)');
    } catch (error) {
      console.warn('Prod rewarded preload failed, retrying with TEST unit:', error);
      try {
        await AdMob.prepareRewardVideoAd({ adId: TEST_AD_UNITS.rewarded });
        this.rewardedLoaded = true;
        console.log('Rewarded ad preloaded (TEST)');
      } catch (e) {
        console.error('Failed to preload rewarded ad (both prod and test):', e);
      }
    }
  }

  async showRewarded(placement: string): Promise<{ watched: boolean; reward?: AdMobRewardItem }> {
    if (!AD_CONFIG.enabled) return { watched: false };
    if (!this.rewardedLoaded) await this.preloadRewarded();
    if (!this.rewardedLoaded) return { watched: false };

    return new Promise((resolve) => {
      let rewarded = false;
      let rewardListener: any;
      let dismissListener: any;

      // Listen for reward event
      rewardListener = AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        rewarded = true;
        console.log(`Rewarded ad completed: ${placement}`, reward);
      });

      // Listen for dismissed event
      dismissListener = AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
        this.rewardedLoaded = false;
        this.preloadRewarded(); // Preload next one
        
        if (rewarded) {
          resolve({ watched: true, reward: { type: 'reward', amount: 1 } });
        } else {
          resolve({ watched: false });
        }
        
        // Clean up listeners
        if (rewardListener) rewardListener.remove();
        if (dismissListener) dismissListener.remove();
      });

      // Show the ad
      AdMob.showRewardVideoAd().catch(async (error) => {
        console.warn('Failed to show rewarded (prod), retrying TEST:', error);
        this.rewardedLoaded = false;
        try {
          await AdMob.prepareRewardVideoAd({ adId: TEST_AD_UNITS.rewarded });
          await AdMob.showRewardVideoAd();
        } catch (e) {
          console.error('Failed to show rewarded after TEST retry:', e);
          resolve({ watched: false });
          if (rewardListener) rewardListener.remove();
          if (dismissListener) dismissListener.remove();
        }
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
