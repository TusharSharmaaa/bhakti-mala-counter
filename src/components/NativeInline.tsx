import React, { useCallback, useEffect, useState } from 'react';
import { ADS_TEST_MODE } from '@/config/ads';

// Capacitor-compatible compact native ad placeholder for inline insertion.
// Swap with real native ad view if plugin support is added.
export default function NativeInline() {
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Simulate async load: show skeleton briefly, then reveal card
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, [reloadKey]);

  const onFailed = useCallback(() => {
    setLoaded(false);
    setTimeout(() => setReloadKey(k => k + 1), 1200);
  }, []);

  return (
    <div className="mx-[14px] my-[10px] min-h-[190px] relative">
      {!loaded && (
        <div className="h-[190px] rounded-xl border border-border/60 bg-background/60 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      <div
        key={reloadKey}
        className="rounded-xl border border-border/60 bg-background p-2.5 shadow-sm"
        style={!loaded ? { position: 'absolute', opacity: 0, inset: 0 } : undefined}
        // If this were a real native ad view, onError would call onFailed()
        onErrorCapture={onFailed as any}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-lg bg-muted" />
          <div className="flex-1">
            <div className="h-4 w-36 bg-muted rounded mb-0.5" />
            <div className="h-3 w-48 bg-muted/80 rounded" />
            <div className="h-3 w-24 bg-muted/70 rounded mt-1" />
            <div className="h-3 w-20 bg-muted/70 rounded mt-1" />
          </div>
        </div>
        <div className="h-36 rounded-lg bg-muted mt-2" />
        <div className="mt-2 inline-flex items-center px-3 py-1.5 rounded-md border text-xs">
          {ADS_TEST_MODE ? 'Ad (TEST MODE)' : 'Ad'}
        </div>
      </div>
    </div>
  );
}


