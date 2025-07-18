// src/services/notificationService.ts
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { toast } from '@/hooks/use-toast';
import { history } from '@/utils/history';
import { Reminder, ReminderPeriod } from '@/types';
import { reminderStorage } from './reminderStorage';

export class NotificationService {
  // 1. Permissions
  static async requestPermissions(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      if (display === 'denied') {
        toast({
          title: 'Permissions Denied',
          description: 'Enable notifications in settings to receive reminders.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: 'Error',
        description: 'Could not request notification permissions.',
        variant: 'destructive',
      });
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      return display === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  // 2. Scheduling
  static async scheduleNotification(reminder: Reminder): Promise<void> {
    if (!reminder.isEnabled) return;

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) return;
    }

    // Cancel any existing notifications for this reminder to avoid duplicates
    await this.cancelNotification(reminder.id);

    const scheduleDate = this.getReminderDate(reminder.expiryDate, reminder.reminderPeriod);

    if (scheduleDate > new Date()) {
      const notification: LocalNotificationSchema = {
        id: this.generateNotificationId(reminder.id),
        title: `Reminder: ${reminder.docName}`,
        body: `Your document is expiring soon.`,
        schedule: { at: scheduleDate, allowWhileIdle: true },
        extra: { docId: reminder.id },
        sound: 'beep.aiff',
      };

      try {
        await LocalNotifications.schedule({ notifications: [notification] });
      } catch (error) {
        console.error('Error scheduling notification:', error);
        toast({
          title: 'Error',
          description: 'Could not schedule the reminder notification.',
          variant: 'destructive',
        });
      }
    }
  }

  private static generateNotificationId(docId: string): number {
    // Basic hash function to generate a numeric ID from a string
    return Math.abs(docId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 2147483647;
  }

  static async cancelNotification(docId: string): Promise<void> {
    try {
      const notificationId = this.generateNotificationId(docId);
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.some(n => n.id === notificationId)) {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  static getReminderDate(expiryDate: string, reminderPeriod: ReminderPeriod): Date {
    const date = new Date(expiryDate);
    switch (reminderPeriod) {
      case '1day': date.setDate(date.getDate() - 1); break;
      case '1week': date.setDate(date.getDate() - 7); break;
      case '2weeks': date.setDate(date.getDate() - 14); break;
      case '1month': date.setMonth(date.getMonth() - 1); break;
    }
    return date;
  }

  // 3. App Lifecycle
  static initialize() {
    this.rescheduleAllReminders();

    // When the app is brought to the foreground, re-check and re-schedule reminders
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.rescheduleAllReminders();
      }
    });

    // Handle notification clicks
    LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
      const docId = notification.extra?.docId;
      if (docId) {
        // Navigate to the document detail screen
        history.push(`/document/${docId}`);
      }
    });
  }

  static async rescheduleAllReminders(): Promise<void> {
    const hasPermission = await this.checkPermissions();
    if (!hasPermission) return;

    try {
      const reminders = await reminderStorage.getReminders();
      for (const reminder of reminders) {
        if (reminder.isEnabled) {
          await this.scheduleNotification(reminder);
        }
      }
    } catch (error) {
      console.error('Error rescheduling reminders:', error);
    }
  }
}
