import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export class PushNotificationService {
  private static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async initializePushNotifications() {
    try {
      // Request permission to use push notifications
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        console.log('Push notifications registered successfully');
      } else {
        console.log('Push notification permissions denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  static async saveFCMToken(token: string) {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      // Save or update the FCM token in Supabase
      const { error } = await supabase
        .from('user_tokens')
        .upsert({
          id: `${user.id}_fcm`,
          user_id: user.id,
          token: token,
          device_type: 'android', // You might want to detect this
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving FCM token:', error);
        return false;
      }

      console.log('FCM token saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveFCMToken:', error);
      return false;
    }
  }

  static async setupPushListeners() {
    // Called when registration is successful
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ', token.value);
      await this.saveFCMToken(token.value);
    });

    // Called when registration encounters an error
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error: ', error.error);
      toast({
        title: "Push Notification Error",
        description: "Failed to register for push notifications",
        variant: "destructive",
      });
    });

    // Called when the device receives a push notification
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      // Show a toast for foreground notifications
      toast({
        title: notification.title || "Document Reminder",
        description: notification.body || "You have a document renewal reminder",
      });
    });

    // Called when a user taps on a push notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ', notification);
      
      // You can navigate to specific document or show document details here
      const data = notification.notification.data;
      if (data?.documentId) {
        console.log('User tapped notification for document:', data.documentId);
      }
    });
  }

  static async refreshToken() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      // Mark current token as inactive
      await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Re-register to get a new token
      await PushNotifications.register();
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }

  static async clearUserTokens() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id);

      console.log('User tokens cleared');
    } catch (error) {
      console.error('Error clearing user tokens:', error);
    }
  }
}