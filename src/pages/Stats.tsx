import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Target, Calendar, TrendingUp, Award } from "lucide-react";
import Navigation from "@/components/Navigation";

const Stats = () => {
  const [count, setCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('radha-jap-data');
    if (saved) {
      const data = JSON.parse(saved);
      setCount(data.count || 0);
      setStreak(data.streak || 0);
      
      const today = new Date().toDateString();
      if (data.lastDate === today) {
        setTodayCount(data.todayCount || 0);
      }
    }
    
    // Check for notifications
    checkDailyReminder();
  }, []);
  
  const checkDailyReminder = () => {
    const settings = localStorage.getItem('radha-jap-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.notifications && todayCount === 0 && 'Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        const lastNotif = localStorage.getItem('last-notification');
        const today = now.toDateString();
        
        if (lastNotif !== today && now.getHours() >= 18) {
          new Notification("🙏 Radha Naam Jap Reminder", {
            body: "Don't forget your daily Jap! Maintain your streak.",
            icon: "/favicon.ico"
          });
          localStorage.setItem('last-notification', today);
        }
      }
    }
  };

  const totalMalas = Math.floor(count / 108);
  const todayMalas = Math.floor(todayCount / 108);
  const progressToday = Math.min(((todayCount % 108) / 108) * 100, 100);

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Your Journey</h1>
          <p className="text-sm text-muted-foreground">Track your spiritual progress</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Today's Progress */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Mala</span>
                <span className="font-medium">{todayCount % 108} / 108</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-divine transition-all duration-300"
                  style={{ width: `${progressToday}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Jap Today</p>
                <p className="text-3xl font-bold text-primary">{todayCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Malas Completed</p>
                <p className="text-3xl font-bold">{todayMalas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="shadow-soft border-border/50 gradient-golden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Flame className="h-5 w-5" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-6xl font-bold text-white mb-2">{streak}</p>
              <p className="text-white/90">consecutive days</p>
            </div>
          </CardContent>
        </Card>

        {/* All Time Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Malas</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMalas}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {count.toLocaleString()} total Jap
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dedication</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {streak > 0 ? '🏆' : '💪'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {streak > 0 ? 'Keep going!' : 'Start today!'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Quote */}
        <Card className="shadow-soft border-border/50 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-muted-foreground italic">
              "Every Jap brings you closer to divine love. Keep chanting with devotion."
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
              — Shri Premanand Maharaj
            </p>
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default Stats;
