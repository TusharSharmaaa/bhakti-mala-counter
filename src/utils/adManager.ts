import { LIMITS } from './adConfig';
import { getAdMobService, PLACEMENTS } from '@/services/admob';

export type Origin = 'stats' | 'timer' | 'counter';

let lastInterstitialAt = 0; // epoch seconds
let lastFromTimerAt = 0; // epoch seconds
let interstitialsShownThisSession = 0;
let statsInterstitialsThisSession = 0;

function now(): number {
  return Math.floor(Date.now() / 1000);
}

export function canShowInterstitial(origin: Origin): boolean {
  const t = now();
  if (interstitialsShownThisSession >= LIMITS.interstitialPerSessionMax) return false;
  if (t - lastInterstitialAt < LIMITS.minGapSecondsBetweenInterstitials) return false;
  if (origin === 'stats' && statsInterstitialsThisSession >= LIMITS.statsMaxPerSession) return false;
  if (origin === 'timer' && (t - lastFromTimerAt) < LIMITS.timerGapMinutes * 60) return false;
  return true;
}

export async function showInterstitialIfReady(origin: Origin): Promise<boolean> {
  if (!canShowInterstitial(origin)) return false;

  try {
    const service = getAdMobService();
    await service.initialize();

    const placement =
      origin === 'stats'
        ? PLACEMENTS.INT_AFTER_3_MALAS // reuse an existing placement id
        : origin === 'timer'
        ? PLACEMENTS.INT_TIMER_POST_SESSION
        : PLACEMENTS.INT_CONTENT_EXIT;

    const shown = await service.showInterstitial(placement);
    if (shown) {
      recordShown(origin);
    }
    return shown;
  } catch {
    return false;
  }
}

function recordShown(origin: Origin) {
  const t = now();
  lastInterstitialAt = t;
  interstitialsShownThisSession += 1;
  if (origin === 'stats') statsInterstitialsThisSession += 1;
  if (origin === 'timer') lastFromTimerAt = t;
}

// OPTIONAL: soften caps when app backgrounds; here we reset the gap timers
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // do nothing heavy; keep it light
    }
  });
}


