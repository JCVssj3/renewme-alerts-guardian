import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, Bell, Settings as SettingsIcon, Users, FileText } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { StorageService } from '@/services/storageService';
import { useTheme } from '@/providers/ThemeProvider';
import EntityManagement from './EntityManagement';
import CustomDocumentTypes from './CustomDocumentTypes';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  const reminderOptions = [
    { value: '1_week', label: '1 Week Before' },
    { value: '2_weeks', label: '2 Weeks Before' },
    { value: '1_month', label: '1 Month Before' },
    { value: '2_months', label: '2 Months Before' },
    { value: '3_months', label: '3 Months Before' },
    { value: '6_months', label: '6 Months Before' },
    { value: '9_months', label: '9 Months Before' },
    { value: '12_months', label: '12 Months Before' }
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

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setSettings({
      ...settings,
      theme: newTheme
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-12">
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Customize your RenewMe experience</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="card-shadow bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                <SettingsIcon className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="card-shadow bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-gray-700 dark:text-gray-300">Enable Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive renewal reminders</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications.enabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound" className="text-gray-700 dark:text-gray-300">Sound Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Play sound with notifications</p>
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
                  <Label htmlFor="vibration" className="text-gray-700 dark:text-gray-300">Vibration</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vibrate device for alerts</p>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.notifications.vibration}
                  onCheckedChange={handleVibrationToggle}
                  disabled={!settings.notifications.enabled}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Default Reminder Period</Label>
                <Select 
                  value={settings.notifications.defaultReminderPeriod} 
                  onValueChange={handleDefaultReminderChange}
                  disabled={!settings.notifications.enabled}
                >
                  <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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
        </TabsContent>

        <TabsContent value="entities">
          <EntityManagement />
        </TabsContent>

        <TabsContent value="types">
          <CustomDocumentTypes />
        </TabsContent>
      </Tabs>

      {/* App Information */}
      <Card className="card-shadow mt-6 bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">About RenewMe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Build</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">2024.06</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Never miss another renewal. RenewMe keeps your documents up to date with smart alerts, organized reminders, and secure storage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
