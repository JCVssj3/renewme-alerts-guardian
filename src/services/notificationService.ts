
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
      
      // Set the specific time for the reminder
      const [hours, minutes] = (document.reminderTime || '09:00').split(':');
      reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Don't schedule if the reminder date has already passed
      if (reminderDate < new Date()) {
        console.log('Reminder date has passed for document:', document.name);
        return;
      }

      // Schedule the main reminder notification using AlarmManager equivalent
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🚨 Document Expiring Soon!',
            body: `Your ${document.name} expires in ${daysLeft} days. Don't forget to renew it!`,
            id: parseInt(document.id.replace(/\D/g, '').slice(0, 8) || '1'),
            schedule: { 
              at: reminderDate,
              allowWhileIdle: true, // Ensures notification works when device is idle
              repeats: false 
            },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              documentId: document.id,
              documentName: document.name,
              expiryDate: document.expiryDate.toISOString(),
              reminderTime: document.reminderTime,
              type: 'reminder'
            }
          }
        ]
      });

      // Schedule follow-up notification 1 day after reminder at the same time
      const followUpDate = new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000);
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '📋 Document Status Check',
            body: `Have you handled the renewal for ${document.name}? Tap to mark as handled.`,
            id: parseInt(document.id.replace(/\D/g, '').slice(0, 8) || '1') + 10000,
            schedule: { 
              at: followUpDate,
              allowWhileIdle: true, // Ensures notification works when device is idle
              repeats: false 
            },
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: {
              documentId: document.id,
              documentName: document.name,
              reminderTime: document.reminderTime,
              type: 'followup'
            }
          }
        ]
      });

      // Schedule final warning if expiry is close at user's preferred time
      if (daysLeft <= 7 && daysLeft > 0) {
        const finalWarningDate = new Date(document.expiryDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before expiry
        finalWarningDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: '🔴 FINAL WARNING!',
              body: `${document.name} expires tomorrow! Take action now!`,
              id: parseInt(document.id.replace(/\D/g, '').slice(0, 8) || '1') + 20000,
              schedule: { 
                at: finalWarningDate,
                allowWhileIdle: true, // Ensures notification works when device is idle
                repeats: false 
              },
              sound: 'beep.wav',
              attachments: undefined,
              actionTypeId: '',
              extra: {
                documentId: document.id,
                documentName: document.name,
                reminderTime: document.reminderTime,
                type: 'final_warning'
              }
            }
          ]
        });
      }
      
      console.log(`Notifications scheduled for ${document.name}:`);
      console.log(`- Reminder: ${reminderDate} at ${document.reminderTime || '09:00'}`);
      console.log(`- Follow-up: ${followUpDate}`);
      console.log('- AlarmManager will ensure notifications work even when app is closed');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async cancelDocumentReminder(documentId: string) {
    try {
      const baseNotificationId = parseInt(documentId.replace(/\D/g, '').slice(0, 8) || '1');
      
      // Cancel all notification types for this document
      await LocalNotifications.cancel({
        notifications: [
          { id: baseNotificationId }, // Main reminder
          { id: baseNotificationId + 10000 }, // Follow-up
          { id: baseNotificationId + 20000 } // Final warning
        ]
      });
      
      console.log(`Cancelled all notifications for document ID: ${documentId}`);
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static async scheduleUrgentAlert(document: Document) {
    const daysLeft = calculateDaysUntilExpiry(document.expiryDate);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🚨🚨 URGENT: Document Expiring! 🚨🚨',
          body: `${document.name} expires ${daysLeft <= 0 ? 'today' : `in ${daysLeft} days`}! Take immediate action!`,
          id: parseInt(document.id.replace(/\D/g, '').slice(-8) || '2'),
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          sound: 'beep.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            documentId: document.id,
            urgent: true,
            type: 'urgent'
          }
        }
      ]
    });
  }

  // Schedule immediate notification for testing
  static async testNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🔔 Test Notification',
          body: 'This is a test notification to verify the system is working properly.',
          id: 999999,
          schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
          sound: 'beep.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: {
            test: true,
            type: 'test'
          }
        }
      ]
    });
    console.log('Test notification scheduled for 2 seconds from now');
  }

  // Handle notification responses (when user taps notification)
  static async handleNotificationAction(notification: any) {
    const { extra } = notification;
    
    if (extra?.type === 'followup' || extra?.type === 'reminder') {
      // Show user a prompt to mark document as handled
      console.log(`User tapped notification for document: ${extra.documentName}`);
      // You could trigger a UI update here to show the document in focus
    }
  }

  // Initialize notification listeners
  static async initializeNotificationListeners() {
    try {
      await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        this.handleNotificationAction(notification);
      });
      
      await LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Notification received:', notification);
      });
      
      console.log('Notification listeners initialized');
    } catch (error) {
      console.error('Error initializing notification listeners:', error);
    }
  }
}
