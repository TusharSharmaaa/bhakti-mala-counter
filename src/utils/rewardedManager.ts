import { getAdMobService, PLACEMENTS } from '@/services/admob';

let lastShownAt = 0; // epoch seconds
let shownThisSession = 0;
const MIN_GAP_SEC = 60;
const SESSION_MAX = 2;

function now(): number { return Math.floor(Date.now() / 1000); }

export function createRewardedLoader() {
  let loaded = false;
  let disposed = false;

  const service = getAdMobService();

  const load = async () => {
    if (disposed) return;
    try {
      await service.initialize();
      await service.preloadRewarded();
      loaded = true;
    } catch {
      loaded = false;
    }
  };

  // initial load
  void load();

  return {
    dispose() {
      disposed = true;
    },
    isLoaded: () => loaded,
    load,
    async tryShowWithTimeout(ms = 2500): Promise<boolean> {
      const t = now();
      if (shownThisSession >= SESSION_MAX) return false;
      if (t - lastShownAt < MIN_GAP_SEC) return false;

      if (!loaded) {
        await new Promise((res) => setTimeout(res, ms));
      }
      if (!loaded) return false;

      try {
        const result = await service.showRewarded(PLACEMENTS.REW_SHARE_STATS_CARD);
        // Whether rewarded or not, treat as a shown event for spacing/cap
        lastShownAt = now();
        shownThisSession += 1;
        loaded = false; // trigger next preload
        void load();
        return result.completed;
      } catch {
        // On failure, mark not loaded and attempt a background reload
        loaded = false;
        void load();
        return false;
      }
    },
  };
}


