// src/services/pushNotificationService.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase }         from '@/integrations/supabase/client';
import { toast }            from '@/hooks/use-toast';

export class PushNotificationService {
  private static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
    }
    return user;
  }

  static async initializePushNotifications(): Promise<boolean> {
    try {
      const { receive } = await PushNotifications.requestPermissions();
      if (receive !== 'granted') {
        console.warn('Push notification permissions denied');
        return false;
      }
      await PushNotifications.register();
      console.log('Push notifications registered successfully');
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  static async saveFCMToken(token: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const { error } = await supabase
        .from('user_tokens')
        .upsert(
          {
            id:           `${user.id}_fcm`,
            user_id:      user.id,
            token,
            device_type:  'android',
            is_active:    true,
            updated_at:   new Date().toISOString(),
          },
          { onConflict: ['id'] }             // ensure we only conflict on our synthetic PK
        );

      if (error) {
        console.error('Error saving FCM token:', error);
        return false;
      }

      console.log('FCM token saved successfully');
      return true;
    } catch (err) {
      console.error('Error in saveFCMToken:', err);
      return false;
    }
  }

  static async setupPushListeners(): Promise<void> {
    // 1) Registration successful
    PushNotifications.addListener('registration', async ({ value: token }) => {
      console.log('Push registration success, token:', token);
      await this.saveFCMToken(token);
    });

    // 2) Registration error
    PushNotifications.addListener('registrationError', ({ error }) => {
      console.error('Push registration error:', error);
      toast({
        title:       'Push Registration Failed',
        description: 'Could not register for push notifications.',
        variant:     'destructive',
      });
    });

    // 3) Received while app in foreground
    PushNotifications.addListener('pushNotificationReceived', ({ title, body }) => {
      console.log('Push notification received:', { title, body });
      toast({
        title:       title    || 'Document Reminder',
        description: body     || 'You have a document renewal reminder.',
      });
    });

    // 4) User tapped the notification
    PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
      console.log('Push action performed:', notification);
      const docId = notification.data?.documentId;
      if (docId) {
        // TODO: navigate to document detail screen
        console.log('Navigate to document:', docId);
      }
    });
  }

  static async refreshToken(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      // deactivate old tokens
      await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // re-register to get and save a new token
      await PushNotifications.register();
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }

  static async clearUserTokens(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      await supabase
        .from('user_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id);

      console.log('All tokens for user marked inactive');
    } catch (error) {
      console.error('Error clearing user tokens:', error);
    }
  }
}