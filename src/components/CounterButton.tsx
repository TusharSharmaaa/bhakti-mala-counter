import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface CounterButtonProps {
  count: number;
  onCount: () => void;
  onMalaComplete: () => void;
}

const CounterButton = ({ count, onCount, onMalaComplete }: CounterButtonProps) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const progress = (count % 108) / 108;

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Play sound if enabled
    if (soundEnabled) {
      const audio = new Audio();
      audio.volume = 0.3;
      // Using a bell sound frequency
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    onCount();
    
    // Check if mala is complete
    if ((count + 1) % 108 === 0) {
      onMalaComplete();
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Sound Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute -top-16 right-4"
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-muted-foreground" />
        ) : (
          <VolumeX className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {/* Progress Ring */}
      <div className="relative">
        <svg className="w-80 h-80 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 140}`}
            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress)}`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Counter Button */}
        <button
          onClick={handleClick}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-64 h-64 rounded-full gradient-divine shadow-divine glow-radha
            flex flex-col items-center justify-center gap-2
            transition-all duration-150 active:scale-95
            ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}`}
        >
          <span className="text-white/80 text-sm font-medium tracking-wider uppercase">
            राधा राधा
          </span>
          <span className="text-white text-7xl font-bold tracking-tight">
            {count % 108}
          </span>
          <span className="text-white/80 text-xs tracking-widest">
            {Math.floor(count / 108)} Mala{Math.floor(count / 108) !== 1 ? 's' : ''}
          </span>
        </button>
      </div>

      {/* Current Count Display */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {108 - (count % 108)} more to complete this mala
        </p>
      </div>
    </div>
  );
};

export default CounterButton;
