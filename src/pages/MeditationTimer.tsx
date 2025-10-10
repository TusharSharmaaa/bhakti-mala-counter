import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const MeditationTimer = () => {
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState<'nature' | 'om' | 'water' | 'none'>('none');
  const intervalRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    toast.success("🧘 Meditation Complete!", {
      description: "Radhe Radhe! Your meditation session is complete.",
      duration: 5000,
    });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
    if (!isRunning && soundEnabled && backgroundSound !== 'none') {
      playBackgroundSound();
    } else {
      stopBackgroundSound();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    stopBackgroundSound();
  };

  const playBackgroundSound = () => {
    if (backgroundSound !== 'none') {
      const utterance = new SpeechSynthesisUtterance("Om");
      utterance.rate = 0.5;
      utterance.pitch = 0.8;
      utterance.volume = 0.3;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopBackgroundSound = () => {
    window.speechSynthesis.cancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="min-h-screen gradient-peaceful pb-20">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Meditation Timer</h1>
          <p className="text-sm text-muted-foreground">Focus on your spiritual practice</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Timer Display */}
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-80 h-80 transform -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="160"
                cy="160"
                r="140"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 140}`}
                strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-6xl font-bold text-primary">{formatTime(timeLeft)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {isRunning ? 'Meditating...' : 'Ready to begin'}
              </p>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        {!isRunning && timeLeft === duration * 60 && (
          <Card className="shadow-soft border-border/50">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4 text-center">Select Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20, 30, 45, 60, 90].map((min) => (
                  <Button
                    key={min}
                    variant={duration === min ? "default" : "outline"}
                    onClick={() => setDuration(min)}
                    className="w-full"
                  >
                    {min}m
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handlePlayPause}
            className="w-20 h-20 rounded-full"
          >
            {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="w-20 h-20 rounded-full"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>

        {/* Sound Options */}
        <Card className="shadow-soft border-border/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Background Sound</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>
            {soundEnabled && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={backgroundSound === 'om' ? 'default' : 'outline'}
                  onClick={() => setBackgroundSound('om')}
                  size="sm"
                >
                  OM Chanting
                </Button>
                <Button
                  variant={backgroundSound === 'nature' ? 'default' : 'outline'}
                  onClick={() => setBackgroundSound('nature')}
                  size="sm"
                >
                  Birds
                </Button>
                <Button
                  variant={backgroundSound === 'water' ? 'default' : 'outline'}
                  onClick={() => setBackgroundSound('water')}
                  size="sm"
                >
                  Water Stream
                </Button>
                <Button
                  variant={backgroundSound === 'none' ? 'default' : 'outline'}
                  onClick={() => setBackgroundSound('none')}
                  size="sm"
                >
                  Silent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default MeditationTimer;