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
  const currentMalaCount = count % 108;
  const progress = currentMalaCount / 108;

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    const nextCount = count + 1;
    const nextMalaCount = nextCount % 108;
    
    // Milestone haptic feedback (9, 21, 108)
    if (navigator.vibrate) {
      if (nextMalaCount === 0) {
        // Mala complete - strong vibration
        navigator.vibrate([100, 50, 100, 50, 100]);
      } else if (nextMalaCount === 9 || nextMalaCount === 21) {
        // Milestones - double vibration
        navigator.vibrate([50, 30, 50]);
      } else {
        // Regular tap
        navigator.vibrate(50);
      }
    }
    
    // Play "Radha" sound if enabled
    if (soundEnabled) {
      const settings = localStorage.getItem('radha-jap-settings');
      let soundOption = 'radha';
      
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.soundOptions) {
          if (parsed.soundOptions.om) soundOption = 'om';
          else if (parsed.soundOptions.bell) soundOption = 'bell';
          else if (parsed.soundOptions.silent) soundOption = 'silent';
        }
      }
      
      if (soundOption !== 'silent') {
        const text = soundOption === 'om' ? 'Om' : 'Radha';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = soundOption === 'om' ? 0.8 : 1.2;
        utterance.pitch = soundOption === 'om' ? 0.9 : 1.1;
        utterance.volume = 0.5;
        window.speechSynthesis.speak(utterance);
      }
    }
    
    onCount();
    
    // Check if mala is complete
    if (nextMalaCount === 0) {
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

        {/* Counter Button with Wave Effect */}
        <button
          onClick={handleClick}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-64 h-64 rounded-full gradient-divine shadow-divine glow-radha
            flex flex-col items-center justify-center gap-2
            transition-all duration-150 active:scale-95 overflow-hidden relative
            ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}`}
        >
          {/* Wave Effect */}
          {isPressed && (
            <div className="absolute inset-0 rounded-full">
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            </div>
          )}
          <span className="text-white/80 text-sm font-medium tracking-wider uppercase">
            राधा राधा
          </span>
          <span className="text-white text-7xl font-bold tracking-tight">
            {currentMalaCount}
          </span>
          <span className="text-white/80 text-xs tracking-widest">
            {Math.floor(count / 108)} Mala{Math.floor(count / 108) !== 1 ? 's' : ''}
          </span>
        </button>
      </div>

      {/* Current Count Display */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {108 - currentMalaCount} more to complete this mala
        </p>
      </div>
    </div>
  );
};

export default CounterButton;
