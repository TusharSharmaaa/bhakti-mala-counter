import { useState, useEffect } from "react";
import CounterButton from "@/components/CounterButton";
import StatsCard from "@/components/StatsCard";
import QuoteCard from "@/components/QuoteCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Sparkles, BookOpen, Heart } from "lucide-react";
import { toast } from "sonner";
import { maharajQuotes, gitaShlokas, hinduStories } from "@/data/spiritualContent";
import radhaBackground from "@/assets/radha-background.jpg";

const Index = () => {
  const [count, setCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState<string>("");

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('radha-japa-data');
    if (saved) {
      const data = JSON.parse(saved);
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
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('radha-japa-data', JSON.stringify({
      count,
      todayCount,
      streak,
      lastDate: today
    }));
  }, [count, todayCount, streak]);

  const handleCount = () => {
    const today = new Date().toDateString();
    const newCount = count + 1;
    const newTodayCount = todayCount + 1;
    
    setCount(newCount);
    setTodayCount(newTodayCount);
    
    // Update streak if this is first japa of the day
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
    toast.success("🎉 Mala Complete!", {
      description: "Radhe Radhe! One more mala completed with devotion.",
      duration: 3000,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your counter? Your stats will be preserved.")) {
      setCount(0);
      setTodayCount(0);
      toast.info("Counter reset successfully");
    }
  };

  const randomQuote = maharajQuotes[Math.floor(Math.random() * maharajQuotes.length)];
  const randomGita = gitaShlokas[Math.floor(Math.random() * gitaShlokas.length)];
  const randomStory = hinduStories[Math.floor(Math.random() * hinduStories.length)];

  return (
    <div className="min-h-screen gradient-peaceful relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${radhaBackground})` }}
      />
      
      <div className="relative z-10">
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
                  <p className="text-xs text-muted-foreground">Radha Naam Japa Counter</p>
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
          {/* Stats Section */}
          <StatsCard totalCount={count} streak={streak} todayCount={todayCount} />

          {/* Counter Section */}
          <div className="flex justify-center py-8">
            <CounterButton 
              count={count} 
              onCount={handleCount}
              onMalaComplete={handleMalaComplete}
            />
          </div>

          {/* Spiritual Content Section */}
          <Tabs defaultValue="quotes" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="quotes">
                <Heart className="h-4 w-4 mr-2" />
                Quotes
              </TabsTrigger>
              <TabsTrigger value="gita">
                <BookOpen className="h-4 w-4 mr-2" />
                Gita
              </TabsTrigger>
              <TabsTrigger value="stories">
                <Sparkles className="h-4 w-4 mr-2" />
                Stories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="space-y-4 mt-6">
              <QuoteCard 
                quote={randomQuote.quote}
                author={randomQuote.author}
                category="maharaj"
              />
            </TabsContent>

            <TabsContent value="gita" className="space-y-4 mt-6">
              <Card className="shadow-soft border-border/50">
                <CardHeader>
                  <CardTitle className="text-primary">{randomGita.chapter}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-lg font-medium text-center leading-relaxed">
                      {randomGita.verse}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-2">Translation:</p>
                    <p className="text-foreground leading-relaxed">
                      {randomGita.translation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stories" className="space-y-4 mt-6">
              <Card className="shadow-soft border-border/50">
                <CardHeader>
                  <CardTitle className="text-primary">{randomStory.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {randomStory.story}
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Moral:</p>
                    <p className="text-sm text-foreground italic">
                      {randomStory.moral}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Quote */}
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground italic">
              "राधे राधे - The sweetest name in all the universes"
            </p>
            <p className="text-xs text-muted-foreground">
              Inspired by the teachings of Shri Premanand Maharaj Ji
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
