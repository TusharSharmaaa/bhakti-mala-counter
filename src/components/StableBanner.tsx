import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ADS_TEST_MODE } from '@/config/ads';
import { getAdMobService } from '@/services/admob';
import { useBannerInsets } from '@/utils/BannerInsets';

type Props = {
  position?: 'top' | 'bottom';
  topPad?: number;
  bottomPad?: number;
  /**
   * Increment this value to force a refresh (hide + show) of the banner.
   * Example: setRefreshKey(k => k + 1)
   */
  refreshKey?: number;
};

/**
 * StableBanner (Capacitor AdMob)
 * - Reserves height so UI never overlaps
 * - Uses Google test ad units automatically in dev via ADS_TEST_MODE
 * - Auto retries once on mount if show fails
 * - Accepts a refreshKey to manually trigger re-show
 */
export default function StableBanner({
  position = 'bottom',
  topPad = 8,
  bottomPad = 0,
  refreshKey,
}: Props) {
  const mountedRef = useRef(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const { setH } = useBannerInsets();

  // Reserve a steady height; adaptive banners are typically ~50-60px tall
  const reservedHeight = useMemo(() => measuredHeight ?? 60, [measuredHeight]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const service = getAdMobService();
        await service.initialize();
        await service.showBanner(position);
        if (!cancelled && !measuredHeight) {
          // We cannot read true height from web DOM for native view; use default once shown
          setMeasuredHeight(60);
          try { setH(60); } catch {}
        }
      } catch (e) {
        // One simple retry after short delay
        if (!cancelled && attempt < 1) {
          setTimeout(() => setAttempt(a => a + 1), 1500);
        }
      }
    })();

    return () => {
      cancelled = true;
      // Hide but don't remove to keep layout predictable on quick navigations
      try {
        const service = getAdMobService();
        service.hideBanner().catch(() => {});
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, attempt]);

  // Manual refresh support
  useEffect(() => {
    let cancelled = false;
    if (refreshKey === undefined) return;
    (async () => {
      try {
        const service = getAdMobService();
        await service.removeBanner();
        await service.showBanner(position);
        if (!cancelled && !measuredHeight) {
          setMeasuredHeight(60);
          try { setH(60); } catch {}
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, position]);

  // Dev hint: clearly show when running with test IDs
  const isTest = ADS_TEST_MODE;

  return (
    <div style={{ paddingTop: topPad }}>
      {isTest && (
        <div style={{ fontSize: 10, opacity: 0.6, padding: '2px 6px' }}>
          AdMob Banner (TEST MODE)
        </div>
      )}
      <div style={{ height: reservedHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Native banner is rendered by the Capacitor plugin. We just reserve space. */}
      </div>
      {bottomPad > 0 && <div style={{ height: bottomPad }} />}
    </div>
  );
}


