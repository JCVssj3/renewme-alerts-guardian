
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Bell, Settings as SettingsIcon, Users, FileText, Calendar, Shield, Zap, Trophy, Target } from 'lucide-react';
import { AppSettings, ReminderPeriod } from '@/types';
import { StorageService } from '@/services/storageService';
import { EntityService } from '@/services/entityService';
import EntityManagement from './EntityManagement';
import CustomDocumentTypes from './CustomDocumentTypes';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [autoSort, setAutoSort] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);
  const [dataBackup, setDataBackup] = useState(false);
  const [quickActions, setQuickActions] = useState(true);

  // Stats for dashboard
  const documents = StorageService.getDocuments();
  const entities = EntityService.getEntities();
  const totalDocuments = documents.length;
  const expiringSoon = documents.filter(doc => {
    const daysLeft = Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  }).length;
  const completionRate = totalDocuments > 0 ? Math.round((documents.filter(doc => !doc.isHandled).length / totalDocuments) * 100) : 0;

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

  return (
    <div className="min-h-screen bg-primary-bg p-4 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="mobile-tap bg-card-bg border-primary-accent/20 hover:bg-button-hover hover:border-primary-accent"
          >
            <ArrowUp className="h-5 w-5 rotate-[-90deg] text-primary-accent" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary">Customize your RenewMe experience</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card-bg border border-primary-accent/10 shadow-sm">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary-accent data-[state=active]:text-white">General</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary-accent data-[state=active]:text-white">Notifications</TabsTrigger>
          <TabsTrigger value="entities" className="data-[state=active]:bg-primary-accent data-[state=active]:text-white">Entities</TabsTrigger>
          <TabsTrigger value="types" className="data-[state=active]:bg-primary-accent data-[state=active]:text-white">Types</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            {/* Dashboard Stats */}
            <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-text-primary">
                  <Trophy className="h-5 w-5 text-primary-accent" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary-bg rounded-lg">
                    <div className="text-2xl font-bold text-primary-accent">{totalDocuments}</div>
                    <div className="text-sm text-text-secondary">Documents</div>
                  </div>
                  <div className="text-center p-3 bg-status-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-status-warning">{expiringSoon}</div>
                    <div className="text-sm text-text-secondary">Expiring Soon</div>
                  </div>
                  <div className="text-center p-3 bg-primary-accent/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary-accent">{entities.length}</div>
                    <div className="text-sm text-text-secondary">Entities</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Organization Level</span>
                    <span className="text-text-primary font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Smart Features */}
            <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-text-primary">
                  <Zap className="h-5 w-5 text-primary-accent" />
                  <span>Smart Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Auto-Sort Documents</Label>
                    <p className="text-sm text-text-secondary">Automatically organize by expiry date</p>
                  </div>
                  <Switch
                    checked={autoSort}
                    onCheckedChange={setAutoSort}
                    className="data-[state=checked]:bg-primary-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Smart Reminders</Label>
                    <p className="text-sm text-text-secondary">AI-powered reminder timing</p>
                  </div>
                  <Switch
                    checked={smartReminders}
                    onCheckedChange={setSmartReminders}
                    className="data-[state=checked]:bg-primary-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Quick Actions</Label>
                    <p className="text-sm text-text-secondary">Show shortcuts in document cards</p>
                  </div>
                  <Switch
                    checked={quickActions}
                    onCheckedChange={setQuickActions}
                    className="data-[state=checked]:bg-primary-accent"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data & Security */}
            <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-text-primary">
                  <Shield className="h-5 w-5 text-primary-accent" />
                  <span>Data & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-primary font-medium">Auto Backup</Label>
                    <p className="text-sm text-text-secondary">Backup data to cloud storage</p>
                  </div>
                  <Switch
                    checked={dataBackup}
                    onCheckedChange={setDataBackup}
                    className="data-[state=checked]:bg-primary-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    className="btn-secondary w-full"
                    onClick={() => {
                      const data = {
                        documents: StorageService.getDocuments(),
                        entities: EntityService.getEntities(),
                        settings: StorageService.getSettings()
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'renewme-backup.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-text-primary">
                <Bell className="h-5 w-5 text-primary-accent" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-text-primary font-medium">Enable Notifications</Label>
                  <p className="text-sm text-text-secondary">Receive renewal reminders</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications.enabled}
                  onCheckedChange={handleNotificationToggle}
                  className="data-[state=checked]:bg-primary-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound" className="text-text-primary font-medium">Sound Alerts</Label>
                  <p className="text-sm text-text-secondary">Play sound with notifications</p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.notifications.sound}
                  onCheckedChange={handleSoundToggle}
                  disabled={!settings.notifications.enabled}
                  className="data-[state=checked]:bg-primary-accent"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="vibration" className="text-text-primary font-medium">Vibration</Label>
                  <p className="text-sm text-text-secondary">Vibrate device for alerts</p>
                </div>
                <Switch
                  id="vibration"
                  checked={settings.notifications.vibration}
                  onCheckedChange={handleVibrationToggle}
                  disabled={!settings.notifications.enabled}
                  className="data-[state=checked]:bg-primary-accent"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-text-primary font-medium">Default Reminder Period</Label>
                <Select 
                  value={settings.notifications.defaultReminderPeriod} 
                  onValueChange={handleDefaultReminderChange}
                  disabled={!settings.notifications.enabled}
                >
                  <SelectTrigger className="mobile-tap bg-card-bg border-primary-accent/20 focus:border-primary-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card-bg border-primary-accent/20">
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
      <Card className="card-shadow mt-6 bg-card-bg border-primary-accent/10 card-hover">
        <CardHeader>
          <CardTitle className="text-text-primary">About RenewMe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Version</span>
            <Badge variant="outline" className="bg-primary-accent/10 text-primary-accent border-primary-accent/20">1.0.0</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Build</span>
            <Badge variant="outline" className="bg-status-success/10 text-green-700 border-status-success/20">2024.12</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-4 leading-relaxed">
            Never miss another renewal. RenewMe keeps your documents up to date with smart alerts, organized reminders, and secure storage in a beautiful, warm interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
