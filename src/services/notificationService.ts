
import { LocalNotifications } from '@capacitor/local-notifications';
import { Document } from '@/types';
import { calculateDaysUntilExpiry, getReminderDate } from '@/utils/dateUtils';

export class NotificationService {
  static async requestPermissions() {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  }

  static async scheduleDocumentReminder(document: Document) {
    try {
      const reminderDate = getReminderDate(document.expiryDate, document.reminderPeriod);
      const daysLeft = calculateDaysUntilExpiry(document.expiryDate);
      
      // Don't schedule if the reminder date has already passed
      if (reminderDate < new Date()) {
        console.log('Reminder date has passed for document:', document.name);
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🚨 Document Expiring Soon!',
            body: `Your ${document.name} expires in ${daysLeft} days`,
            id: parseInt(document.id.replace(/\D/g, '').slice(0, 8) || '1'),
            schedule: { at: reminderDate },
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              documentId: document.id,
              documentName: document.name,
              expiryDate: document.expiryDate.toISOString()
            }
          }
        ]
      });
      
      console.log(`Notification scheduled for ${document.name} at ${reminderDate}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async cancelDocumentReminder(documentId: string) {
    try {
      const notificationId = parseInt(documentId.replace(/\D/g, '').slice(0, 8) || '1');
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log(`Cancelled notification for document ID: ${documentId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  static async scheduleUrgentAlert(document: Document) {
    const daysLeft = calculateDaysUntilExpiry(document.expiryDate);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🚨🚨 URGENT: Document Expiring! 🚨🚨',
          body: `${document.name} expires ${daysLeft <= 0 ? 'today' : `in ${daysLeft} days`}!`,
          id: parseInt(document.id.replace(/\D/g, '').slice(-8) || '2'),
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            documentId: document.id,
            urgent: true
          }
        }
      ]
    });
  }
}
