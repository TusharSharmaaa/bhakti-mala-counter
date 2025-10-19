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
    const loadAudio = async () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      try {
        // Load custom Radha sound
        const response = await fetch('/icons/Radha_Name_Audio_ExtraSmooth_Fast (mp3cut.net).mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;
      } catch (error) {
        console.error('Failed to load custom sound, using fallback:', error);
        
        // Fallback: Generate synthetic beep if custom sound fails to load
        const ctx = audioContextRef.current;
        const sampleRate = ctx.sampleRate;
        const duration = 0.08;
        const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
          data[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * Math.exp(-3 * i / buffer.length);
        }
        
        audioBufferRef.current = buffer;
      }
    };

    loadAudio();
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
      {/* Single Filled Circle with White Progress Border */}
      <div className="relative">
        {/* White Progress Ring - Outer Border */}
        <svg className="absolute inset-0 w-80 h-80 transform -rotate-90" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>
          <circle
            cx="160"
            cy="160"
            r="152"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
          />
          <circle
            cx="160"
            cy="160"
            r="152"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 152}`}
            strokeDashoffset={`${2 * Math.PI * 152 * (1 - progress)}`}
            className="transition-all duration-300"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' }}
          />
        </svg>

        {/* Main Filled Counter Button - Single Interactive Circle */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          aria-label={`Count ${currentMalaCount} of 108. Press to increment.`}
          className={`counter-btn relative w-80 h-80 min-h-[280px] rounded-full gradient-divine shadow-divine
            flex flex-col items-center justify-center gap-2
            transition-all duration-150 overflow-hidden select-none
            ${isPressed ? 'scale-95 shadow-2xl' : 'scale-100 hover:scale-[1.02] active:scale-95'}
            ${isResetting ? 'opacity-50' : ''}`}
          style={{
            boxShadow: isPressed 
              ? '0 10px 40px -10px rgba(var(--primary), 0.6), inset 0 2px 8px rgba(0,0,0,0.3)' 
              : '0 20px 60px -15px rgba(var(--primary), 0.5), 0 0 40px rgba(var(--primary-glow), 0.3)'
          }}
        >
          {/* Ripple Effect on Tap */}
          {isPressed && (
            <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
            </div>
          )}
          
          {/* Counter Content */}
          <span className="text-white/90 text-sm font-semibold tracking-widest uppercase pointer-events-none animate-pulse">
            ॐ राधा राधा ॐ
          </span>
          <span className="text-white text-8xl font-bold tracking-tight pointer-events-none drop-shadow-lg">
            {currentMalaCount}
          </span>
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="text-white/80 text-sm tracking-wider font-medium">
              {Math.floor(count / 108)} Mala{Math.floor(count / 108) !== 1 ? 's' : ''}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          </div>
          
          {isResetting && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-white text-xs font-medium bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                Hold to reset...
              </span>
            </div>
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
