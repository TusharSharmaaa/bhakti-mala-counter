import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tusharsharmaaa.radha',
  appName: 'Radha Jap Counter',
  webDir: 'dist',
  server: {
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
