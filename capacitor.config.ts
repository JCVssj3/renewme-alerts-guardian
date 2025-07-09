
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.renewme.app',
  appName: 'RenewMe',
  webDir: 'dist',
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
