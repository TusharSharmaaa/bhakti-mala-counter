export const TEST_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  NATIVE: 'ca-app-pub-3940256099942544/2247696110',
};

// Global frequency caps (per app session)
export const LIMITS = {
  interstitialPerSessionMax: 4,
  minGapSecondsBetweenInterstitials: 60, // global spacing
  timerGapMinutes: 10, // extra spacing for Timer-origin interstitial
  statsMaxPerSession: 3, // from Stats screen
};


