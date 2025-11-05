import React from "react";
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
    // AdMob not available or failed - don't crash the app
    console.error('AdMob initialization failed:', error);
  }
})().catch((err) => {
  // Catch any unhandled errors to prevent app crashes
  console.error('Critical error during AdMob setup:', err);
});

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch(err => console.log('SW registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
