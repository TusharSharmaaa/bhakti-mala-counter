import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Target, Moon, Sun, Volume2, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(108);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundOption, setSoundOption] = useState('radha');

  useEffect(() => {
    if (profile) {
      setDarkMode(profile.dark_mode);
      setNotifications(profile.notifications_enabled);
      setDailyTarget(profile.daily_target);
      setSoundEnabled(profile.sound_enabled);
      setSoundOption(profile.sound_option);
      
      if (profile.dark_mode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, [profile]);

  const saveSettings = async () => {
    await updateProfile({
      dark_mode: darkMode,
      notifications_enabled: notifications,
      daily_target: dailyTarget,
      sound_enabled: soundEnabled,
      sound_option: soundOption,
    });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        toast.success("Notifications enabled!");
      } else {
        toast.error("Please enable notifications in your browser settings");
      }
    } else {
      setNotifications(checked);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-peaceful flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-divine flex items-center justify-center shadow-divine">
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Settings</h1>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Appearance */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily Target */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Set your daily Jap target</Label>
              <Input
                id="target"
                type="number"
                min="108"
                step="108"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || 108)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Recommended multiples of 108 (1 mala = 108 Jap)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-xs text-muted-foreground">Get reminded to maintain your streak</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound Options */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Sound Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled">Enable Sound</Label>
                <Switch
                  id="sound-enabled"
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
              {soundEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-radha">Radha (Voice)</Label>
                    <Switch
                      id="sound-radha"
                      checked={soundOption === 'radha'}
                      onCheckedChange={(checked) => checked && setSoundOption('radha')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-om">OM Chanting</Label>
                    <Switch
                      id="sound-om"
                      checked={soundOption === 'om'}
                      onCheckedChange={(checked) => checked && setSoundOption('om')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-bell">Temple Bell</Label>
                    <Switch
                      id="sound-bell"
                      checked={soundOption === 'bell'}
                      onCheckedChange={(checked) => checked && setSoundOption('bell')}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={saveSettings} className="w-full">
          Save Settings
        </Button>
      </main>

      <Navigation />
    </div>
  );
};

export default Settings;