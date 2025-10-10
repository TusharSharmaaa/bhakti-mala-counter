import CounterButton from "@/components/CounterButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings as SettingsIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useCounter } from "@/hooks/useCounter";
import { useWakeLock } from "@/hooks/useWakeLock";
import Settings from "@/pages/Settings";

const Home = () => {
  const { counter, loading: counterLoading, increment, decrement, reset } = useCounter();
  const malas = Math.floor(counter.count / 108);

  // Keep screen awake during japa
  useWakeLock(true);

  const handleCount = () => {
    increment();
  };

  const handleMalaComplete = () => {
    toast.success("🎉 Mala Complete!", {
      description: `Radhe Radhe! ${malas + 1} mala${malas + 1 > 1 ? 's' : ''} completed with devotion.`,
      duration: 3000,
    });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your counter? Your stats will be preserved.")) {
      reset();
    }
  };

  const handleUndo = () => {
    decrement();
  };

  if (counterLoading) {
    return (
      <div className="min-h-screen gradient-peaceful flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full gradient-divine flex items-center justify-center shadow-divine animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your spiritual journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-peaceful relative overflow-hidden pb-20 safe-padding">
      {/* Compact Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-divine flex items-center justify-center shadow-divine">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Radha Naam Jap</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    aria-label="Open settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <Settings />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Today</p>
            <p className="text-2xl font-bold text-primary">{counter.today_count}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Malas</p>
            <p className="text-2xl font-bold">{malas}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-accent">{counter.count}</p>
          </div>
        </div>

        {/* Counter Section */}
        <div className="flex justify-center py-8">
          <CounterButton 
            count={counter.count} 
            onCount={handleCount}
            onMalaComplete={handleMalaComplete}
            onUndo={handleUndo}
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
