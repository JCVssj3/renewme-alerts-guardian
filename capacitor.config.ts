
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f560ce1801a48e19eb3d77cca39e97d',
  appName: 'RenewMe',
  webDir: 'dist',
  server: {
    url: 'https://7f560ce1-801a-48e1-9eb3-d77cca39e97d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3B82F6",
      sound: "beep.wav",
      requestPermissions: true,
      scheduleOn: "exact"
    },
    Camera: {
      ios: {
        requestPermissions: true
      },
      android: {
        requestPermissions: true
      }
    },
    App: {
      appendUserAgent: "RenewMe/1.0"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#3B82F6",
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: "#ffffff"
    }
  }
};

export default config;
