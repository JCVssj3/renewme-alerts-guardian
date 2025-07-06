
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell, LogOut, User } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { useAuth } from '@/hooks/useAuth';
import ScreenContainer from './ScreenContainer';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      defaultReminderPeriod: '2_weeks'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading settings...');
      const userSettings = await SupabaseStorageService.getSettings();
      console.log('Settings loaded:', userSettings);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      // Use default settings if loading fails
      console.log('Using default settings due to error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await SupabaseStorageService.saveSettings(settings);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      try {
        await signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
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
    setSettings(newSettings);
    setTimeout(() => saveSettings(), 100);
  };

  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary">Loading settings...</div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">Customize your RenewMe experience</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <Card className="card-shadow bg-card-bg border-primary-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">Signed in as</p>
                <p className="text-text-secondary text-sm">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 text-status-danger hover:text-status-danger border-status-danger/20 hover:bg-status-danger/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-shadow bg-card-bg border-primary-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="text-text-primary">
                Enable Notifications
              </Label>
              <Switch
                id="notifications-enabled"
                checked={settings.notifications.enabled}
                onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
              />
            </div>

            {settings.notifications.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-sound" className="text-text-primary">
                    Sound
                  </Label>
                  <Switch
                    id="notifications-sound"
                    checked={settings.notifications.sound}
                    onCheckedChange={(checked) => handleNotificationChange('sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-vibration" className="text-text-primary">
                    Vibration
                  </Label>
                  <Switch
                    id="notifications-vibration"
                    checked={settings.notifications.vibration}
                    onCheckedChange={(checked) => handleNotificationChange('vibration', checked)}
                  />
                </div>

                <div>
                  <Label className="text-text-primary">Default Reminder Period</Label>
                  <Select 
                    value={settings.notifications.defaultReminderPeriod} 
                    onValueChange={(value: ReminderPeriod) => handleNotificationChange('defaultReminderPeriod', value)}
                  >
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
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary-accent text-white px-4 py-2 rounded-lg shadow-lg">
          Saving settings...
        </div>
      )}
    </ScreenContainer>
  );
};

export default Settings;
