import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
      // Ensure context is running (mobile browsers can suspend it)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
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
    e.stopPropagation();
    
    // Play audio immediately on pointerdown for lowest latency
    playTapSound();
    
    setIsPressed(true);

    // Start reset timer for hold-to-reset (1.5s)
    resetTimerRef.current = setTimeout(() => {
      setIsResetting(true);
      if (navigator.vibrate) navigator.vibrate(200);
    }, 1500);
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    if (e) e.stopPropagation();
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

  // Listen for global tap sound requests
  useEffect(() => {
    const handler = () => {
      playTapSound();
    };
    window.addEventListener('play-tap-sound', handler as EventListener);
    return () => window.removeEventListener('play-tap-sound', handler as EventListener);
  }, [soundEnabled]);

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
      <div
        className="relative"
        style={{ width: 'clamp(220px, 60vw, 420px)', height: 'clamp(220px, 60vw, 420px)' }}
      >
        {/* Mute toggle - positioned just outside the circle */}
        <button
          onClick={(e) => { e.stopPropagation(); setSoundEnabled((v) => !v); }}
          aria-label={soundEnabled ? 'Mute tap sound' : 'Unmute tap sound'}
          className="absolute -top-3 -right-3 z-10 h-10 w-10 rounded-full bg-background/70 backdrop-blur border border-border shadow-soft flex items-center justify-center hover:bg-background transition-colors"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        {/* White Progress Ring - Outer Border */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="47.5%"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.875%"
          />
          {progress > 0 && (
            <circle
              cx="50%"
              cy="50%"
              r="47.5%"
              fill="none"
              stroke="white"
              strokeWidth="1.875%"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 47.5}`}
              strokeDashoffset={`${2 * Math.PI * 47.5 * (1 - progress)}`}
              className="transition-all duration-300"
            />
          )}
        </svg>

        {/* Main Filled Counter Button - Single Interactive Circle */}
        <button
          id="counter-button"
          onPointerDown={handlePointerDown}
          onPointerUp={(e) => handlePointerUp(e)}
          onPointerLeave={(e) => handlePointerUp(e)}
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          aria-label={`Count ${currentMalaCount} of 108. Press to increment.`}
          className={`counter-btn relative 
            rounded-full gradient-divine shadow-divine
            flex flex-col items-center justify-center gap-1 sm:gap-2
            transition-all duration-150 overflow-hidden select-none
            ${isPressed ? 'scale-95 shadow-2xl' : 'scale-100 hover:scale-[1.02] active:scale-95'}
            ${isResetting ? 'opacity-50' : ''}`}
          style={{
            width: 'clamp(220px, 60vw, 420px)',
            height: 'clamp(220px, 60vw, 420px)',
            minHeight: '0',
            aspectRatio: '1 / 1',
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
          <span
            className="text-white/90 font-semibold tracking-widest uppercase pointer-events-none animate-pulse"
            style={{ fontSize: 'clamp(12px, 4vw, 20px)', textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}
          >
            ॐ राधा राधा ॐ
          </span>
          <span
            className="text-white font-bold tracking-tight pointer-events-none drop-shadow-lg"
            style={{ fontSize: 'clamp(52px, 15vw, 110px)' }}
          >
            {currentMalaCount}
          </span>
          <div className="flex items-center gap-1 sm:gap-2 pointer-events-none">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="text-white/80 tracking-wider font-medium" style={{ fontSize: 'clamp(11px, 3vw, 14px)' }}>
              {Math.floor(count / 108)} Mala{Math.floor(count / 108) !== 1 ? 's' : ''}
            </span>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/60 animate-pulse" />
          </div>
          
          {isResetting && (
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
              <span className="text-white text-xs font-medium bg-white/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
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
          className="px-4 sm:px-6 py-2 rounded-full bg-secondary text-secondary-foreground
            shadow-soft hover:bg-secondary/80 transition-smooth min-h-[40px] sm:min-h-[48px]
            text-sm sm:text-base
            animate-in fade-in slide-in-from-bottom-2 duration-200"
          aria-label="Undo last increment"
        >
          ← Undo
        </button>
      )}

      {/* Progress Info */}
      <div className="text-center font-bold space-y-1 px-4">
        <p className="text-base sm:text-lg font-extrabold text-muted-foreground">
          {remaining} more to complete this mala
        </p>
        <p className="text-base font-extrabold text-muted-foreground/70">
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
