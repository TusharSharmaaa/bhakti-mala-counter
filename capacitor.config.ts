import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tusharsharmaaa.radha',
  appName: 'Radha Jap Counter',
  webDir: 'dist',
  server: {
    url: 'https://dad075f2-422b-44d7-8913-0ce42c2d47ef.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    AdMob: {
      // Test mode will be controlled via our ad service
      // Production IDs will be set when you provide them
    }
  }
};

export default config;
