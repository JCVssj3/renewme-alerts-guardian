
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
      iconColor: "#488AFF",
      sound: "beep.wav"
    }
  }
};

export default config;
