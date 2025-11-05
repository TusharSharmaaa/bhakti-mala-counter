import React from 'react';
import { ADS_TEST_MODE } from '@/config/ads';

/**
 * Placeholder Native Ad Card (Capacitor)
 * - Capacitor AdMob plugin does not expose Native Ad views like RN's NativeAdView.
 * - This component reserves space and provides a styled placeholder so it can be
 *   safely inserted into lists without layout shift. Replace with real native ad
 *   rendering if/when plugin support is added.
 */
export default function NativeCard() {
  return (
    <div className="mx-3 my-2 rounded-xl border border-border/60 bg-background/60 p-3 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-md bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-40 bg-muted rounded mb-1" />
          <div className="h-3 w-56 bg-muted/80 rounded" />
        </div>
      </div>
      <div className="h-40 rounded-lg bg-muted" />
      <div className="mt-3 inline-flex items-center px-3 py-2 rounded-md border text-sm">
        {ADS_TEST_MODE ? 'Ad (TEST MODE)' : 'Ad'}
      </div>
    </div>
  );
}


