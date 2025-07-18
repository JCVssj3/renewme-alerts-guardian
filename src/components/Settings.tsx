import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { NotificationService } from '@/services/notificationService';
import ScreenContainer from './ScreenContainer';
import { Storage } from '@capacitor/storage';

const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    defaultReminderPeriod: '1_week'
  }
};

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { value } = await Storage.get({ key: SETTINGS_KEY });
    if (value) {
      setSettings(JSON.parse(value));
    }
    setLoading(false);
  };

  const saveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await Storage.set({ key: SETTINGS_KEY, value: JSON.stringify(newSettings) });
    if (!newSettings.notifications.enabled) {
      NotificationService.cancelAllNotifications();
    } else {
      NotificationService.rescheduleAllReminders();
    }
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean | ReminderPeriod) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  if (loading) {
    return (
      <ScreenContainer>
        <div className="flex items-center mb-6 py-0 my-[35px]">
          <Button variant="outline" size="icon" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary">Customize your RenewMe experience</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent"></div>
          <div className="text-lg text-text-secondary">Loading settings...</div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="flex items-center mb-6 py-0 my-[35px]">
        <Button variant="outline" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">Customize your RenewMe experience</p>
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="card-shadow bg-card-bg border-primary-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className.flex.items-center.justify-between>
            <Label htmlFor="notifications-enabled" className="text-text-primary">
              Enable Notifications
            </Label>
            <Switch id="notifications-enabled" checked={settings.notifications.enabled} onCheckedChange={checked => handleNotificationChange('enabled', checked)} />
          </div>

          {settings.notifications.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-sound" className="text-text-primary">
                  Sound
                </Label>
                <Switch id="notifications-sound" checked={settings.notifications.sound} onCheckedChange={checked => handleNotificationChange('sound', checked)} />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-vibration" className="text-text-primary">
                  Vibration
                </Label>
                <Switch id="notifications-vibration" checked={settings.notifications.vibration} onCheckedChange={checked => handleNotificationChange('vibration', checked)} />
              </div>

              <div>
                <Label className="text-text-primary">Default Reminder Period</Label>
                <Select value={settings.notifications.defaultReminderPeriod} onValueChange={(value: ReminderPeriod) => handleNotificationChange('defaultReminderPeriod', value)}>
                  <SelectTrigger className="mt-2 bg-card-bg border-primary-accent/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1_week">1 Week</SelectItem>
                    <SelectItem value="2_weeks">2 Weeks</SelectItem>
                    <SelectItem value="1_month">1 Month</SelectItem>
                    <SelectItem value="2_months">2 Months</SelectItem>
                    <SelectItem value="3_months">3 Months</SelectItem>
                    <SelectItem value="6_months">6 Months</SelectItem>
                    <SelectItem value="9_months">9 Months</SelectItem>
                    <SelectItem value="12_months">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ScreenContainer>
  );
};

export default Settings;
