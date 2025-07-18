import { LocalNotifications } from '@capacitor/local-notifications';
import { Document } from '@/types';
import { calculateReminderDate } from '@/utils/dateUtils';

export class NotificationService {
  static async requestPermissions() {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }

  static async scheduleDocumentReminder(document: Document) {
    if (!document.expiryDate) return;

    const reminderDate = calculateReminderDate(document.expiryDate, document.reminderPeriod);
    
    // Ensure reminder is in the future
    if (reminderDate.getTime() < new Date().getTime()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Document Renewal Reminder',
          body: `${document.name} is expiring soon!`,
          id: document.id.hashCode(),
          schedule: { at: reminderDate },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: { documentId: document.id },
        },
      ],
    });
  }

  static async cancelDocumentReminder(documentId: string) {
    await LocalNotifications.cancel({
      notifications: [{ id: documentId.hashCode() }],
    });
  }

  static async scheduleUrgentAlert(document: Document) {
    await LocalNotifications.schedule({
        notifications: [
            {
                title: 'Urgent Alert',
                body: `${document.name} requires your immediate attention!`,
                id: document.id.hashCode() + 1, // Use a different ID for urgent alert
                schedule: { at: new Date(Date.now() + 1000) }, // Now
                sound: 'default',
                attachments: undefined,
                actionTypeId: '',
                extra: { documentId: document.id },
            },
        ],
    });
}


  static async initializeNotificationListeners() {
    // No-op for local notifications
  }
}

// Simple hash function for string to int
declare global {
    interface String {
        hashCode(): number;
    }
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
