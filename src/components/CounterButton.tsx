import { useState, useEffect, useRef } from "react";
import { calculateProgress } from "@/lib/counter";

interface CounterButtonProps {
  count: number;
  onCount: () => void;
  onMalaComplete: () => void;
  onUndo?: () => void;
}

const CounterButton = ({ count, onCount, onMalaComplete, onUndo }: CounterButtonProps) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('radha-sound-enabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [showUndo, setShowUndo] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const { percentage, remaining, currentMalaCount } = calculateProgress(count, 108);
  const progress = currentMalaCount / 108;

  // Pre-load and decode audio for low latency
  useEffect(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    // Decode short beep buffer (we'll use oscillator for now as a fallback)
    const ctx = audioContextRef.current;
    const sampleRate = ctx.sampleRate;
    const duration = 0.08; // 80ms
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * Math.exp(-3 * i / buffer.length);
    }
    
    audioBufferRef.current = buffer;
  }, []);

  useEffect(() => {
    localStorage.setItem('radha-sound-enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const playTapSound = () => {
    if (!soundEnabled || !audioContextRef.current || !audioBufferRef.current) return;
    
    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0.3;
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    
    // Play audio immediately on pointerdown for lowest latency
    playTapSound();
    
    setIsPressed(true);

    // Start reset timer for hold-to-reset (1.5s)
    resetTimerRef.current = setTimeout(() => {
      setIsResetting(true);
      if (navigator.vibrate) navigator.vibrate(200);
    }, 1500);
  };

  const handlePointerUp = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    setIsPressed(false);
    setIsResetting(false);
  };

  const handleClick = () => {
    const nextCount = count + 1;
    const nextMalaCount = nextCount % 108;
    
    // Haptic feedback
    if (navigator.vibrate) {
      if (nextMalaCount === 0) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      } else if (nextMalaCount === 9 || nextMalaCount === 27 || nextMalaCount === 54 || nextMalaCount === 81) {
        navigator.vibrate([50, 30, 50]);
      } else {
        navigator.vibrate(30);
      }
    }
    
    onCount();
    
    // Show undo button for 3 seconds
    setShowUndo(true);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setShowUndo(false), 3000);
    
    // Check if mala is complete
    if (nextMalaCount === 0) {
      onMalaComplete();
    }
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
      setShowUndo(false);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleClick();
      } else if (e.code === 'ArrowLeft' && showUndo) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUndo, count]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Single Hero Circle - Progress Ring + Counter Button */}
      <div className="relative hero-ring-primary">
        <svg className="w-80 h-80 transform -rotate-90" aria-hidden="true">
          <circle
            cx="160"
            cy="160"
            r="140"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
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

        {/* Main Counter Button - tap anywhere to increment */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          aria-label={`Count ${currentMalaCount} of 108. Press to increment.`}
          className={`counter-btn absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            w-64 h-64 min-h-[224px] rounded-full gradient-divine shadow-divine glow-radha
            flex flex-col items-center justify-center gap-2
            transition-all duration-150 overflow-hidden relative select-none
            ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
            ${isResetting ? 'opacity-50' : ''}`}
        >
          {isPressed && (
            <div className="absolute inset-0 rounded-full pointer-events-none">
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            </div>
          )}
          <span className="text-white/80 text-sm font-medium tracking-wider uppercase pointer-events-none">
            राधा राधा
          </span>
          <span className="text-white text-7xl font-bold tracking-tight pointer-events-none">
            {currentMalaCount}
          </span>
          <span className="text-white/80 text-xs tracking-widest pointer-events-none">
            {Math.floor(count / 108)} Mala{Math.floor(count / 108) !== 1 ? 's' : ''}
          </span>
          {isResetting && (
            <span className="text-white text-xs mt-2 pointer-events-none">Hold to reset...</span>
          )}
        </button>
      </div>

      {/* Undo Button (shows for 3s after increment) */}
      {showUndo && onUndo && (
        <button
          onClick={handleUndo}
          className="px-6 py-2 rounded-full bg-secondary text-secondary-foreground
            shadow-soft hover:bg-secondary/80 transition-smooth min-h-[48px]
            animate-in fade-in slide-in-from-bottom-2 duration-200"
          aria-label="Undo last increment"
        >
          ← Undo
        </button>
      )}

      {/* Progress Info */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {remaining} more to complete this mala
        </p>
        <p className="text-xs text-muted-foreground/70">
          Progress: {percentage}%
        </p>
      </div>
      
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Count: {currentMalaCount} of 108. {remaining} remaining.
      </div>
    </div>
  );
};

export default CounterButton;
