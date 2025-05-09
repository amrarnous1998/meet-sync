'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // These are placeholders for settings that would be loaded from the database
  const [notificationSettings, setNotificationSettings] = useState({
    emailReminders: true,
    reminderTime: 1, // hours before meeting
    meetingConfirmations: true,
    meetingCancellations: true,
  });

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    
    try {
      // This is where we would implement the Google OAuth flow
      // For now, we'll just simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsGoogleConnected(true);
    } catch (error) {
      console.error('Error connecting to Google:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setIsConnecting(true);
    
    try {
      // This is where we would implement disconnecting from Google
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsGoogleConnected(false);
    } catch (error) {
      console.error('Error disconnecting from Google:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: any) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value,
    });
    
    // This is where we would save the settings to the database
    console.log('Updated notification settings:', {
      ...notificationSettings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations
        </p>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Meet Integration</CardTitle>
              <CardDescription>
                Connect with Google to automatically generate Google Meet links for your meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.917 16.083c-2.258 0-4.083-1.825-4.083-4.083s1.825-4.083 4.083-4.083c1.103 0 2.024.402 2.735 1.067l-1.107 1.068c-.304-.292-.834-.63-1.628-.63-1.394 0-2.531 1.155-2.531 2.579 0 1.424 1.138 2.579 2.531 2.579 1.616 0 2.224-1.162 2.316-1.762h-2.316v-1.4h3.855c.036.204.064.408.064.677.001 2.332-1.563 3.988-3.919 3.988zm9.917-3.5h-1.75v1.75h-1.167v-1.75h-1.75v-1.166h1.75v-1.75h1.167v1.75h1.75v1.166z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Google Meet</h3>
                    <p className="text-sm text-muted-foreground">
                      {isGoogleConnected 
                        ? 'Connected. Google Meet links will be generated for new meetings.' 
                        : 'Not connected. Connect your Google account to enable Meet links.'}
                    </p>
                  </div>
                </div>
                {isGoogleConnected ? (
                  <Button 
                    variant="outline" 
                    onClick={handleDisconnectGoogle}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleConnectGoogle}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>Note: This is a placeholder for the Google Meet integration, which will be fully implemented in a future update.</p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Other Integrations</CardTitle>
              <CardDescription>
                Connect with other services (coming soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Calendar Sync</h3>
                    <p className="text-sm text-muted-foreground">
                      Coming soon: Sync with Google Calendar, Outlook, and more
                    </p>
                  </div>
                </div>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-reminders" className="flex flex-col space-y-1">
                  <span>Meeting Reminders</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive email reminders before your scheduled meetings
                  </span>
                </Label>
                <Switch
                  id="email-reminders"
                  checked={notificationSettings.emailReminders}
                  onCheckedChange={(checked) => updateNotificationSetting('emailReminders', checked)}
                />
              </div>
              
              {notificationSettings.emailReminders && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="reminder-time">Remind me</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="reminder-time"
                      type="number"
                      min="1"
                      max="48"
                      value={notificationSettings.reminderTime}
                      onChange={(e) => updateNotificationSetting('reminderTime', parseInt(e.target.value, 10))}
                      className="w-20"
                    />
                    <span>hours before the meeting</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="meeting-confirmations" className="flex flex-col space-y-1">
                  <span>Meeting Confirmations</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive notifications when someone books a meeting with you
                  </span>
                </Label>
                <Switch
                  id="meeting-confirmations"
                  checked={notificationSettings.meetingConfirmations}
                  onCheckedChange={(checked) => updateNotificationSetting('meetingConfirmations', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="meeting-cancellations" className="flex flex-col space-y-1">
                  <span>Cancellation Notifications</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Receive notifications when a meeting is cancelled
                  </span>
                </Label>
                <Switch
                  id="meeting-cancellations"
                  checked={notificationSettings.meetingCancellations}
                  onCheckedChange={(checked) => updateNotificationSetting('meetingCancellations', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Note: Notification settings are saved automatically
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input 
                  id="fullname" 
                  value={user?.user_metadata?.full_name || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Input 
                  id="timezone" 
                  value="UTC (Automatic)"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Time zone is automatically detected based on your browser settings
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Update Account Information
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
