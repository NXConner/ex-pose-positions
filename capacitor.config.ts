import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.positions.app',
  appName: 'Random Positions',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
