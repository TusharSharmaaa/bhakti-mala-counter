import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Target, Moon, Sun, Volume2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(108);
  const [soundOptions, setSoundOptions] = useState({
    radha: true,
    om: false,
    bell: false,
    silent: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('radha-jap-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setDarkMode(settings.darkMode || false);
      setNotifications(settings.notifications || false);
      setDailyTarget(settings.dailyTarget || 108);
      setSoundOptions(settings.soundOptions || soundOptions);
      
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      darkMode,
      notifications,
      dailyTarget,
      soundOptions
    };
    localStorage.setItem('radha-jap-settings', JSON.stringify(settings));
    toast.success("Settings saved successfully!");
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

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-divine flex items-center justify-center shadow-divine">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your experience</p>
            </div>
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
                <Label htmlFor="sound-radha">Radha (Voice)</Label>
                <Switch
                  id="sound-radha"
                  checked={soundOptions.radha}
                  onCheckedChange={(checked) => setSoundOptions({...soundOptions, radha: checked, om: false, bell: false, silent: false})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-om">OM Chanting</Label>
                <Switch
                  id="sound-om"
                  checked={soundOptions.om}
                  onCheckedChange={(checked) => setSoundOptions({...soundOptions, om: checked, radha: false, bell: false, silent: false})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-bell">Temple Bell</Label>
                <Switch
                  id="sound-bell"
                  checked={soundOptions.bell}
                  onCheckedChange={(checked) => setSoundOptions({...soundOptions, bell: checked, radha: false, om: false, silent: false})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-silent">Silent</Label>
                <Switch
                  id="sound-silent"
                  checked={soundOptions.silent}
                  onCheckedChange={(checked) => setSoundOptions({...soundOptions, silent: checked, radha: false, om: false, bell: false})}
                />
              </div>
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