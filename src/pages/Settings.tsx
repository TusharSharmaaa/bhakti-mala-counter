import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Moon, Sun, Volume2, Info, Star, Smartphone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useBannerAd, useAdMobDebug } from "@/hooks/useAdMob";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [showAdDebug, setShowAdDebug] = useState(false);
  // language setting removed per latest spec; keeping placeholder state if needed later
  
  // AdMob integration
  useBannerAd(true, 'bottom');
  const { stats, refreshStats, testBanner, testInterstitial, testRewarded } = useAdMobDebug();

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    const savedNoti = localStorage.getItem('app_notifications');
    const savedSound = localStorage.getItem('app_sound_feedback');
    if (savedTheme) setDarkMode(savedTheme === 'dark');
    if (savedNoti) setNotifications(JSON.parse(savedNoti));
    if (savedSound) setSoundFeedback(JSON.parse(savedSound));
    if ((savedTheme || '') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const saveSettings = async () => {
    localStorage.setItem('app_theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
    localStorage.setItem('app_sound_feedback', JSON.stringify(soundFeedback));
    // language preference removed
    try { document.querySelector('meta[name="theme-color"]')?.setAttribute('content', darkMode ? '#0d0d0d' : '#ffffff'); } catch {}
    toast.success("Settings saved!", { position: "bottom-center", closeButton: true });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      try { document.querySelector('meta[name=\"theme-color\"]')?.setAttribute('content', '#0d0d0d'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try { document.querySelector('meta[name=\"theme-color\"]')?.setAttribute('content', '#ffffff'); } catch {}
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

      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Theme temporarily hidden per spec update */}

        {/* Notifications */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-xs text-muted-foreground">Get reminded to maintain your streak</p>
              </div>
              <div 
                className={cn(
                  "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer",
                  notifications ? "bg-primary justify-end" : "bg-muted justify-start"
                )}
                onClick={() => handleNotificationToggle(!notifications)}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sound (feedback only) */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-primary" />
              </div>
              Sound
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-feedback">Play sound feedback on actions</Label>
              <div 
                className={cn(
                  "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer",
                  soundFeedback ? "bg-primary justify-end" : "bg-muted justify-start"
                )}
                onClick={() => setSoundFeedback(!soundFeedback)}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-primary" />
              </div>
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" onClick={() => navigate('/privacy-policy')}>Privacy Policy</Button>
              <Button variant="outline" onClick={() => navigate('/terms')}>Terms & Conditions</Button>
              <div className="p-4 rounded-lg border border-border/60 bg-background/50 text-center">
                <div className="mb-2 font-medium">Rate on Play Store — Radha Jap Counter</div>
                <p className="text-sm text-muted-foreground mb-3">“आपका एक आशीर्वाद — हमारी साधना को आगे बढ़ाता है।”</p>
                <Button variant="outline" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.tusharsharmaaa.radha','_blank')}>Rate on Play Store</Button>
              </div>
              <Button onClick={() => {
                if ((navigator as any).share) {
                  (navigator as any).share({ text: 'हर जप तुम्हें भीतर की शांति के और पास लाता है।', url: 'https://play.google.com/store/apps/details?id=com.tusharsharmaaa.radha', title: 'Radha Jap Counter' }).catch(() => {});
                } else {
                  window.open('https://wa.me/?text='+encodeURIComponent('हर जप तुम्हें भीतर की शांति के और पास लाता है।\nhttps://play.google.com/store/apps/details?id=com.tusharsharmaaa.radha'),'_blank');
                }
              }}>Share App</Button>
              <p className="text-xs text-muted-foreground text-center mt-2">Radha Jap Counter v1.0.0</p>
              <p className="text-xs text-muted-foreground text-center">“हर जप तुम्हें भीतर की शांति के और पास लाता है।”</p>
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