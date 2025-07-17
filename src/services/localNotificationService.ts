import { LocalNotifications, ScheduleOptions, GetPendingResult } from '@capacitor/local-notifications';

export class LocalNotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }

  static async scheduleNotification(options: ScheduleOptions): Promise<void> {
    await LocalNotifications.schedule(options);
  }

  static async cancelNotification(id: number): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  }

  static async getPendingNotifications(): Promise<GetPendingResult> {
    return LocalNotifications.getPending();
  }
}
