import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ADS_ENABLED } from "./config/ads";

// Initialize AdMob on app startup (only in native environment)
(async () => {
  if (!ADS_ENABLED) return;
  
  try {
    const { getAdMobService } = await import('./services/admob');
    const service = getAdMobService();
    await service.initialize();
    console.log('AdMob initialized on app startup');
  } catch (error) {
    // AdMob not available (web preview), silently ignore
    console.log('AdMob not available in this environment');
  }
})();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.log('SW registration failed:', err));
  });
}

// Consent handling (non-blocking, EEA-safe)
(async () => {
  try {
    const { AdMob, ConsentStatus } = await import('@capacitor-community/admob');
    // Try to request consent info update
    try {
      await AdMob.requestConsentInfoUpdate();
      // Check consent status before showing form
      const status = await AdMob.getConsentStatus?.();
      if (status && status.status === ConsentStatus.REQUIRED) {
        await AdMob.showConsentForm();
      }
    } catch (e: any) {
      // Consent API not available or not required, continue anyway
      console.log('[AdMob] Consent not required/available', e?.message || e);
    }
  } catch (e: any) {
    // AdMob not available (web preview), ignore
    console.log('[AdMob] Consent handling skipped (web preview)', e?.message || e);
  }
})();

// Initialize AdMob once at app start (non-blocking)
(async () => {
  try {
    const { getAdMobService } = await import('@/services/admob');
    const service = getAdMobService();
    await service.initialize();
  } catch (e) {
    // Likely web preview; ignore
  }
})();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
