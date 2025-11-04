import CounterButton from "@/components/CounterButton";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useCounter } from "@/hooks/useCounter";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useBannerAd } from "@/hooks/useAdMob";

const Home = () => {
  const { counter, loading: counterLoading, increment, decrement, reset } = useCounter();
  const malas = Math.floor(counter.count / 108);

  // Keep screen awake during japa
  useWakeLock(true);
  
  // AdMob integration
  useBannerAd(true, 'bottom'); // Show banner at bottom
  

  const handleCount = () => {
    increment();
  };

  const handleMalaComplete = async () => {
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

  // Undo removed for a cleaner flow

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

  // Global tap handler: tap anywhere increments, except interactive elements
  const handleGlobalTap: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    // Ignore taps on buttons, links, inputs, and inside the counter button
    if (target.closest('button, a, input, textarea, [role="button"], [data-no-global-tap], #counter-button')) {
      return;
    }
    // Fire sound event for global taps
    window.dispatchEvent(new Event('play-tap-sound'));
    handleCount();
  };

  return (
    <div
      className="min-h-screen gradient-peaceful relative overflow-hidden page-bottom-spacing safe-padding"
      onClick={handleGlobalTap}
      style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.6)), url(/images/background-Image.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Compact Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-2 sm:py-3" data-no-global-tap>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full gradient-divine flex items-center justify-center shadow-divine">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-primary">Radha Naam Jap</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Quick Stats with Enhanced Interactivity */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group min-h-[96px]">
            <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <img src="/images/Gemini_Generated_Image_ofn47sofn47sofn4 (1).png" alt="Mala" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Today's Jap</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{counter.today_count}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 hover:border-accent/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group min-h-[96px]">
            <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <img src="/images/Gemini_Generated_Image_sxyq38sxyq38sxyq.png" alt="Mala" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Malas</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">{malas}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 hover:border-secondary/50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group min-h-[96px]">
            <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
               <img src="/images/Gemini_Generated_Image_8e5j1n8e5j1n8e5j.png" alt="Mala" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            </div>
            <p className="text-xs text-muted-foreground mb-1 whitespace-nowrap">Lifetime Mala's</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary">{Math.floor(counter.count / 108)}</p>
          </div>
        </div>

        {/* Counter Section */}
        <div className="flex justify-center py-4 sm:py-6 md:py-8">
          <CounterButton 
            count={counter.count} 
            onCount={handleCount}
            onMalaComplete={handleMalaComplete}
          />
        </div>

        {/* Footer Quote */}
        <div className="text-center mb-16 sm:mb-20 pt-2 px-4">
          <div className="inline-block px-5 py-3 rounded-xl border backdrop-blur" style={{
            backgroundColor: 'rgba(255,255,255,0.75)',
            borderColor: 'rgba(0,0,0,0.08)'
          }}>
            <p className="italic text-base sm:text-lg font-semibold" style={{ color: '#37306B' }}>
              "हर माला एक मौन प्रार्थना है।"
            </p>
          </div>
        </div>
      </main>


      <div className="pb-16" data-no-global-tap>
        <Navigation />
      </div>
    </div>
  );
};

export default Home;