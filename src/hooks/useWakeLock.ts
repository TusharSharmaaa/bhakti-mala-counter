import { useEffect, useRef } from 'react';

/**
 * Keeps screen awake during meditation/japa sessions
 * Prevents device from sleeping while counter is active
 */
export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    const acquire = async () => {
      try {
        if (document.visibilityState === 'visible' && enabled) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Wake lock request failed - usually due to battery saver mode
        console.warn('Wake lock request failed:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled && !wakeLockRef.current) {
        acquire();
      }
    };

    if (enabled) {
      acquire();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [enabled]);

  return wakeLockRef.current !== null;
}
