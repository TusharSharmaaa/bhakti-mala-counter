import { useState, useEffect } from "react";
import CounterButton from "@/components/CounterButton";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { getItem, setItem } from "@/lib/storage";
import { useWakeLock } from "@/hooks/useWakeLock";

interface JapData {
  count: number;
  todayCount: number;
  streak: number;
  lastDate: string;
}

const Home = () => {
  const [count, setCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Keep screen awake during japa
  useWakeLock(true);

  // Load data from IndexedDB/localStorage
  useEffect(() => {
    getItem<JapData>('radha-jap-data').then(data => {
      if (data) {
        setCount(data.count || 0);
        setStreak(data.streak || 0);
        setLastDate(data.lastDate || "");
        
        // Check if it's a new day
        const today = new Date().toDateString();
        if (data.lastDate === today) {
          setTodayCount(data.todayCount || 0);
        } else {
          // New day - check streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (data.lastDate === yesterday.toDateString()) {
            // Streak continues
          } else if (data.lastDate) {
            // Streak broken
            setStreak(0);
          }
          setTodayCount(0);
        }
      }
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, []);

  // Save data to persistent storage
  useEffect(() => {
    if (!isLoaded) return;
    
    const today = new Date().toDateString();
    setItem<JapData>('radha-jap-data', {
      count,
      todayCount,
      streak,
      lastDate: today
    });
  }, [count, todayCount, streak, isLoaded]);

  const handleCount = () => {
    const today = new Date().toDateString();
    const newCount = count + 1;
    const newTodayCount = todayCount + 1;
    
    setCount(newCount);
    setTodayCount(newTodayCount);
    
    // Update streak if this is first Jap of the day
    if (todayCount === 0 && lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString() || !lastDate) {
        setStreak(streak + 1);
      } else {
        setStreak(1);
      }
      setLastDate(today);
    }
  };

  const handleMalaComplete = () => {
    // Check for daily target achievement
    const settings = localStorage.getItem('radha-jap-settings');
    let dailyTarget = 108;
    if (settings) {
      const parsed = JSON.parse(settings);
      dailyTarget = parsed.dailyTarget || 108;
    }
    
    const malas = Math.floor(count / 108) + 1;
    
    toast.success("🎉 Mala Complete!", {
      description: `Radhe Radhe! ${malas} mala${malas > 1 ? 's' : ''} completed with devotion.`,
      duration: 3000,
    });
    
    // Check if daily target reached
    if (todayCount + 108 >= dailyTarget) {
      setTimeout(() => {
        toast.success("🏆 Daily Target Achieved!", {
          description: "Congratulations! You've reached your daily goal.",
          duration: 4000,
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your counter? Your stats will be preserved.")) {
      setCount(0);
      setTodayCount(0);
      toast.info("Counter reset successfully");
    }
  };

  return (
    <div className="min-h-screen gradient-peaceful relative overflow-hidden pb-20">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-divine flex items-center justify-center shadow-divine">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">राधा नाम जप</h1>
                <p className="text-xs text-muted-foreground">Radha Naam Jap Counter</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className="text-2xl font-bold text-primary">{todayCount}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Malas</p>
            <p className="text-2xl font-bold">{Math.floor(count / 108)}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Streak</p>
            <p className="text-2xl font-bold text-accent">{streak}</p>
          </div>
        </div>

        {/* Counter Section */}
        <div className="flex justify-center py-8">
          <CounterButton 
            count={count} 
            onCount={handleCount}
            onMalaComplete={handleMalaComplete}
          />
        </div>

        {/* Footer Quote */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground italic">
            "राधे राधे - The sweetest name in all the universes"
          </p>
          <p className="text-xs text-muted-foreground">
            Inspired by the teachings of Shri Premanand Maharaj Ji
          </p>
        </div>
      </main>

      <Navigation />
    </div>
  );
};

export default Home;
