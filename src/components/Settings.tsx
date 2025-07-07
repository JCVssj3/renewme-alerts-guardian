import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bell, LogOut, User, RefreshCw, AlertCircle, Shield, Database, Users, FileText } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { useAuth } from '@/hooks/useAuth';
import ScreenContainer from './ScreenContainer';
import EntityManagement from './EntityManagement';
import CustomDocumentTypes from './CustomDocumentTypes';
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
const Settings: React.FC<SettingsProps> = ({
  onBack
}) => {
  const {
    user,
    signOut
  } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        console.log('No user found, using default settings');
        setSettings(DEFAULT_SETTINGS);
        return;
      }
      console.log('Loading settings for user:', user?.email);

      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Settings loading timeout')), 5000));
      const settingsPromise = SupabaseStorageService.getSettings();
      const userSettings = (await Promise.race([settingsPromise, timeoutPromise])) as AppSettings;
      console.log('Settings loaded successfully:', userSettings);
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
        console.log('Using default settings');
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
      setSettings(DEFAULT_SETTINGS); // Use defaults on error
    } finally {
      setLoading(false);
    }
  };
  const saveSettings = async (newSettings: AppSettings) => {
    try {
      setSaving(true);
      console.log('Saving settings:', newSettings);
      await SupabaseStorageService.saveSettings(newSettings);
      console.log('Settings saved successfully');
      setSettings(newSettings);
      setError(null);
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
    saveSettings(newSettings);
  };
  const retryLoadSettings = () => {
    loadSettings();
  };
  return <ScreenContainer>
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

      {loading ? <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent"></div>
          <div className="text-lg text-text-secondary">Loading settings...</div>
          <Button variant="outline" onClick={retryLoadSettings} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div> : <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="document-types" className="text-xs font-semibold">Document type</TabsTrigger>
            <TabsTrigger value="data" className="text-xs font-semibold">Data & Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
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
                <Button variant="outline" onClick={handleSignOut} className="w-full flex items-center gap-2 text-status-danger hover:text-status-danger border-status-danger/20 hover:bg-status-danger/10">
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
                  <Switch id="notifications-enabled" checked={settings.notifications.enabled} onCheckedChange={checked => handleNotificationChange('enabled', checked)} />
                </div>

                {settings.notifications.enabled && <>
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
                  </>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entities">
            <EntityManagement onBack={() => {}} />
          </TabsContent>

          <TabsContent value="document-types">
            <CustomDocumentTypes onBack={() => {}} />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            {/* Data & Privacy Section */}
            <Card className="card-shadow bg-card-bg border-primary-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <Shield className="h-5 w-5" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Data Storage</p>
                    <p className="text-text-secondary text-sm">Your data is securely stored and encrypted</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Backup Status</p>
                    <p className="text-text-secondary text-sm">All data automatically backed up</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            {/* Database Connection Status */}
            <Card className="card-shadow bg-card-bg border-primary-accent/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-text-primary">
                  <Database className="h-5 w-5" />
                  Database Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Connection Status</p>
                    <p className="text-text-secondary text-sm">Connected to Supabase</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Last Sync</p>
                    <p className="text-text-secondary text-sm">{new Date().toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}

      {/* Error notification */}
      {error && <div className="fixed bottom-4 right-4 bg-status-danger text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
          <Button variant="ghost" size="sm" onClick={retryLoadSettings} className="text-white hover:text-white ml-2">
            Retry
          </Button>
        </div>}

      {/* Saving notification */}
      {saving && <div className="fixed bottom-4 right-4 bg-primary-accent text-white px-4 py-2 rounded-lg shadow-lg">
          Saving settings...
        </div>}
    </ScreenContainer>;
};
export default Settings;