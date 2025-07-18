// src/services/notificationService.ts
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Storage } from '@capacitor/storage';
import { toast } from '@/hooks/use-toast';
import { App } from '@capacitor/app';
import { history } from '@/utils/history';
import { Reminder, ReminderPeriod } from '@/types';

export class NotificationService {
  private static readonly REMINDERS_KEY = 'document_reminders';

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
      return false;
    }
  }

  static async checkPermissions(): Promise<boolean> {
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
  }

  // 2. Reminder Management (CRUD)
  static async getReminders(): Promise<Reminder[]> {
    const { value } = await Storage.get({ key: this.REMINDERS_KEY });
    return value ? JSON.parse(value) : [];
  }

  static async saveReminders(reminders: Reminder[]): Promise<void> {
    await Storage.set({
      key: this.REMINDERS_KEY,
      value: JSON.stringify(reminders),
    });
  }

  static async addReminder(docId: string, docName: string, expiryDate: string, reminderPeriod: ReminderPeriod): Promise<void> {
    const reminders = await this.getReminders();
    const newReminder: Reminder = {
      id: docId, // Use document ID as reminder ID
      docName,
      expiryDate,
      reminderPeriod,
      isEnabled: true,
    };
    const existingIndex = reminders.findIndex(r => r.id === docId);
    if (existingIndex > -1) {
      reminders[existingIndex] = newReminder;
    } else {
      reminders.push(newReminder);
    }
    await this.saveReminders(reminders);
    await this.scheduleNotification(newReminder);
  }

  static async removeReminder(docId: string): Promise<void> {
    let reminders = await this.getReminders();
    const reminderToRemove = reminders.find(r => r.id === docId);
    if (reminderToRemove) {
      await this.cancelNotification(reminderToRemove.id);
      reminders = reminders.filter(r => r.id !== docId);
      await this.saveReminders(reminders);
    }
  }

  static async updateReminder(updatedReminder: Reminder): Promise<void> {
    let reminders = await this.getReminders();
    const index = reminders.findIndex(r => r.id === updatedReminder.id);
    if (index > -1) {
      reminders[index] = updatedReminder;
      await this.saveReminders(reminders);
      // If reminders are disabled, cancel any pending notifications
      if (!updatedReminder.isEnabled) {
        await this.cancelNotification(updatedReminder.id);
      } else {
        await this.scheduleNotification(updatedReminder);
      }
    }
  }

  static async toggleReminder(docId: string, isEnabled: boolean): Promise<void> {
    const reminders = await this.getReminders();
    const reminder = reminders.find(r => r.id === docId);
    if (reminder) {
      reminder.isEnabled = isEnabled;
      await this.updateReminder(reminder);
    }
  }

  // 3. Scheduling
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

      await LocalNotifications.schedule({ notifications: [notification] });
    }
  }

  private static generateNotificationId(docId: string): number {
    // Basic hash function to generate a numeric ID from a string
    return Math.abs(docId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) % 2147483647;
  }

  static async cancelNotification(docId: string): Promise<void> {
    const notificationId = this.generateNotificationId(docId);
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.some(n => n.id === notificationId)) {
      await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
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

  // 4. App Lifecycle
  static async initialize() {
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

    const reminders = await this.getReminders();
    for (const reminder of reminders) {
      await this.scheduleNotification(reminder);
    }
  }
}
