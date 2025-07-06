
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Bell, LogOut, User, RefreshCw, AlertCircle } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { useAuth } from '@/hooks/useAuth';
import ScreenContainer from './ScreenContainer';

interface SettingsProps {
  onBack: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    defaultReminderPeriod: '2_weeks'
  }
};

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading settings...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Settings loading timeout')), 5000)
      );

      const settingsPromise = SupabaseStorageService.getSettings();
      
      const userSettings = await Promise.race([settingsPromise, timeoutPromise]) as AppSettings;
      console.log('Settings loaded:', userSettings);
      
      // Ensure we have valid settings structure
      if (userSettings && typeof userSettings === 'object') {
        setSettings({
          theme: userSettings.theme || DEFAULT_SETTINGS.theme,
          notifications: {
            enabled: userSettings.notifications?.enabled ?? DEFAULT_SETTINGS.notifications.enabled,
            sound: userSettings.notifications?.sound ?? DEFAULT_SETTINGS.notifications.sound,
            vibration: userSettings.notifications?.vibration ?? DEFAULT_SETTINGS.notifications.vibration,
            defaultReminderPeriod: userSettings.notifications?.defaultReminderPeriod || DEFAULT_SETTINGS.notifications.defaultReminderPeriod
          }
        });
      } else {
        console.log('Invalid settings format, using defaults');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      setSettings(DEFAULT_SETTINGS);
      console.log('Using default settings due to error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadSettings();
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await SupabaseStorageService.saveSettings(settings);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
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

  // Loading state with timeout
  if (loading && retryCount === 0) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent mx-auto"></div>
          <div className="text-lg text-text-secondary">Loading settings...</div>
          <Button 
            variant="outline" 
            onClick={handleRetry}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </ScreenContainer>
    );
  }

  // Error state
  if (error && loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-status-danger mx-auto" />
          <div className="text-lg text-text-primary">Couldn't load settings</div>
          <div className="text-text-secondary">
            {error.includes('timeout') 
              ? 'Settings are taking too long to load. Please check your connection.' 
              : 'There was a problem loading your settings. Using default values for now.'}
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => { setError(null); setLoading(false); }}>
              Continue with Defaults
            </Button>
          </div>
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

      {/* Error notification */}
      {error && !loading && (
        <div className="fixed bottom-4 right-4 bg-status-danger text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Saving notification */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary-accent text-white px-4 py-2 rounded-lg shadow-lg">
          Saving settings...
        </div>
      )}
    </ScreenContainer>
  );
};

export default Settings;
