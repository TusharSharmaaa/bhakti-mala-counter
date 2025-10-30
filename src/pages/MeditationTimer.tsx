import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { MeditationAudioEngine, SoundType } from "@/lib/meditationAudio";

const MeditationTimer = () => {
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [backgroundSound, setBackgroundSound] = useState<SoundType>('om');
  const [volume, setVolume] = useState(30);
  const intervalRef = useRef<number>();
  const audioEngineRef = useRef<MeditationAudioEngine | null>(null);

  // Initialize audio engine
  useEffect(() => {
    try {
      audioEngineRef.current = new MeditationAudioEngine();
    } catch (error) {
      console.warn('Failed to initialize audio engine:', error);
      audioEngineRef.current = null;
    }
    
    return () => {
      if (audioEngineRef.current) {
        try {
          audioEngineRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying audio engine:', error);
        }
      }
    };
  }, []);

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

  // Update volume when changed
  useEffect(() => {
    try {
      if (audioEngineRef.current) {
        audioEngineRef.current.setVolume(volume / 100);
      }
    } catch (error) {
      console.warn('Failed to set volume:', error);
    }
  }, [volume]);

  const handleComplete = () => {
    setIsRunning(false);
    stopBackgroundSound();
    
    toast.success("🧘 Meditation Complete!", {
      description: "Radhe Radhe! Your meditation session is complete.",
      duration: 5000,
    });
    // Notification API
    try {
      if ("Notification" in window) {
        if (Notification.permission === 'granted') {
          new Notification('Meditation Complete', { body: 'Radhe Radhe! Your session is complete.' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') new Notification('Meditation Complete', { body: 'Radhe Radhe! Your session is complete.' });
          });
        }
      }
    } catch {}
    
    // Play completion sound
    playCompletionSound();
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  const playCompletionSound = () => {
    // Create a spiritual bell sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Bell-like tone
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 1.5);
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);
  };

  const handlePlayPause = () => {
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    if (newRunningState && soundEnabled && backgroundSound !== 'none') {
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
    try {
      if (audioEngineRef.current && backgroundSound !== 'none') {
        audioEngineRef.current.play(backgroundSound);
      }
    } catch (error) {
      console.warn('Failed to play background sound:', error);
    }
  };

  const stopBackgroundSound = () => {
    try {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    } catch (error) {
      console.warn('Failed to stop background sound:', error);
    }
  };

  const handleSoundTypeChange = (newSound: SoundType) => {
    setBackgroundSound(newSound);
    
    // If timer is running, switch sound immediately
    if (isRunning && soundEnabled) {
      stopBackgroundSound();
      if (newSound !== 'none') {
        setTimeout(() => {
          if (audioEngineRef.current) {
            audioEngineRef.current.play(newSound);
          }
        }, 100);
      }
    }
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
          <h1 className="text-2xl font-bold text-primary">Meditation</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Timer Display */}
        <div className="flex justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <svg viewBox="0 0 100 100" className="w-full h-full block -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#mt-gradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="mt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-5xl sm:text-6xl font-bold text-primary">{formatTime(timeLeft)}</p>
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
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {soundEnabled && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={backgroundSound === 'om' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('om')}
                    size="sm"
                  >
                    🕉️ OM Chanting
                  </Button>
                  <Button
                    variant={backgroundSound === 'nature' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('nature')}
                    size="sm"
                  >
                    🐦 Birds
                  </Button>
                  <Button
                    variant={backgroundSound === 'water' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('water')}
                    size="sm"
                  >
                    💧 Water
                  </Button>
                  <Button
                    variant={backgroundSound === 'flute' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('flute')}
                    size="sm"
                  >
                    🎵 Flute
                  </Button>
                  <Button
                    variant={backgroundSound === 'bell' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('bell')}
                    size="sm"
                  >
                    🔔 Bell
                  </Button>
                  <Button
                    variant={backgroundSound === 'none' ? 'default' : 'outline'}
                    onClick={() => handleSoundTypeChange('none')}
                    size="sm"
                  >
                    🔇 Silent
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="text-xs font-medium">{volume}%</p>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Sound Description */}
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground text-center">
                    {backgroundSound === 'om' && 'Deep meditative OM drone - calms the mind'}
                    {backgroundSound === 'nature' && 'Peaceful bird chirping - connects with nature'}
                    {backgroundSound === 'water' && 'Flowing stream - washing away thoughts'}
                    {backgroundSound === 'flute' && 'Spiritual flute melody - transcends the soul'}
                    {backgroundSound === 'bell' && 'Temple bells - brings divine presence'}
                    {backgroundSound === 'none' && 'Complete silence - for deep meditation'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default MeditationTimer;