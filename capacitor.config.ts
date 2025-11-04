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
      appId: {
        android: 'ca-app-pub-2816806517862101~3158480561'
      }
    }
  }
};

export default config;
