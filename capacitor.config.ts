import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bitvera.salesapp',
  appName: 'Bitvera Sales',
  webDir: 'dist',
  plugins: {
    PrivacyScreen: {
      enable: true,
      imageName: "Splash"
    }
  }
};

export default config;
