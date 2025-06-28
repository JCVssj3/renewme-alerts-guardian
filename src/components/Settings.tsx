
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowUp, Bell, Settings as SettingsIcon } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { StorageService } from '@/services/storageService';
import { getReminderPeriodLabel } from '@/utils/dateUtils';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  const reminderOptions = [
    { value: '1_week', label: '1 Week Before' },
    { value: '2_weeks', label: '2 Weeks Before' },
    { value: '1_month', label: '1 Month Before' },
    { value: '2_months', label: '2 Months Before' },
    { value: '3_months', label: '3 Months Before' }
  ];

  const handleNotificationToggle = (enabled: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled
      }
    });
  };

  const handleSoundToggle = (sound: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        sound
      }
    });
  };

  const handleVibrationToggle = (vibration: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        vibration
      }
    });
  };

  const handleDefaultReminderChange = (period: ReminderPeriod) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        defaultReminderPeriod: period
      }
    });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSettings({
      ...settings,
      theme
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="mobile-tap"
          >
            <ArrowUp className="h-5 w-5 rotate-[-90deg]" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600">Customize your RenewMe experience</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Notifications Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-gray-600">Receive renewal reminders</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications.enabled}
                onCheckedChange={handleNotificationToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound">Sound Alerts</Label>
                <p className="text-sm text-gray-600">Play sound with notifications</p>
              </div>
              <Switch
                id="sound"
                checked={settings.notifications.sound}
                onCheckedChange={handleSoundToggle}
                disabled={!settings.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vibration">Vibration</Label>
                <p className="text-sm text-gray-600">Vibrate device for alerts</p>
              </div>
              <Switch
                id="vibration"
                checked={settings.notifications.vibration}
                onCheckedChange={handleVibrationToggle}
                disabled={!settings.notifications.enabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Reminder Period</Label>
              <Select 
                value={settings.notifications.defaultReminderPeriod} 
                onValueChange={handleDefaultReminderChange}
                disabled={!settings.notifications.enabled}
              >
                <SelectTrigger className="mobile-tap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="mobile-tap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>About RenewMe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build</span>
              <span className="font-semibold">2024.06</span>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Never miss another renewal. RenewMe keeps your documents up to date with smart alerts, organized reminders, and secure storage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
