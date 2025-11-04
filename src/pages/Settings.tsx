import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Moon, Sun, Volume2, Info, Smartphone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useBannerAd, useAdMobDebug, useAdMobAvailable } from "@/hooks/useAdMob";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [showAdDebug, setShowAdDebug] = useState(false);
  
  // AdMob integration
  useBannerAd(true, 'bottom');
  const adAvailable = useAdMobAvailable();
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
    if (checked && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifications(true);
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notification permission denied");
      }
    } else {
      setNotifications(checked);
    }
  };

  return (
    <div className="min-h-screen gradient-peaceful">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <SettingsIcon className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Appearance */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {darkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
              </div>
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Dark Mode</Label>
              <button
                onClick={() => handleDarkModeToggle(!darkMode)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  darkMode ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
                aria-label="Toggle dark mode"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {darkMode && (
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>

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
              <Label className="text-base">Daily Reminders</Label>
              <button
                onClick={() => handleNotificationToggle(!notifications)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  notifications ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
                aria-label="Toggle notifications"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {notifications && (
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Audio */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-primary" />
              </div>
              Audio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Sound Feedback</Label>
              <button
                onClick={() => setSoundFeedback(!soundFeedback)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  soundFeedback ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
                aria-label="Toggle sound feedback"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  {soundFeedback && (
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Ad Debug Panel (Developer Mode) */}
        <Card className="shadow-soft border-border/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAdDebug(!showAdDebug)}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-primary" />
              </div>
              Ad Status (Tap to Toggle)
            </CardTitle>
          </CardHeader>
          {showAdDebug && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-background/50">
                  <span className="text-sm font-medium">AdMob Available:</span>
                  <span className={cn("text-sm font-bold", adAvailable ? "text-green-600" : "text-red-600")}>
                    {adAvailable ? "✓ YES (Native)" : "✗ NO (Web)"}
                  </span>
                </div>
                
                {stats && (
                  <>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm">Interstitials Today:</span>
                      <span className="text-sm font-bold">{stats.shown_today} / {stats.max_per_day}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm">Last Shown:</span>
                      <span className="text-sm">{stats.last_shown > 0 ? new Date(stats.last_shown).toLocaleTimeString() : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/50">
                      <span className="text-sm">Cooldown:</span>
                      <span className="text-sm">{Math.round(stats.cooldown_ms / 60000)} min</span>
                    </div>
                  </>
                )}
              </div>

              {adAvailable && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={async () => { await testBanner(); await refreshStats(); toast.success("Banner test fired"); }}>
                    Test Banner
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => { await testInterstitial(); await refreshStats(); toast.success("Interstitial test fired"); }}>
                    Test Int
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => { const ok = await testRewarded(); await refreshStats(); toast.success(ok ? "Rewarded watched!" : "Rewarded skipped"); }}>
                    Test Reward
                  </Button>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center pt-2">
                This panel helps debug ads on native builds. Web preview will always show "NO".
              </p>
            </CardContent>
          )}
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
                <p className="text-sm text-muted-foreground mb-3">"आपका एक आशीर्वाद — हमारी साधना को आगे बढ़ाता है।"</p>
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
              <p className="text-xs text-muted-foreground text-center">"हर जप तुम्हें भीतर की शांति के और पास लाता है।"</p>
            </div>
          </CardContent>
        </Card>


        {/* Save Button */}
        <div className="pt-2">
          <Button onClick={saveSettings} className="w-full" size="lg">
            Save Settings
          </Button>
        </div>
      </main>


      <Navigation />
    </div>
  );
};

export default Settings;
