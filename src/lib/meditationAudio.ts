/**
 * Professional Meditation Audio System
 * Generates continuous ambient sounds for meditation timer
 */

export type SoundType = 'om' | 'nature' | 'water' | 'flute' | 'bell' | 'none';

export class MeditationAudioEngine {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private audioEls: Record<string, HTMLAudioElement> = {};
  private urlCandidates: Record<SoundType, string[]> = {
    om: [
      '/audio/OM Chanting Sound.wav',
      '/audio/om.wav',
      '/audio/om.mp3'
    ],
    nature: ['/audio/birds chirping sound effect loud  copyright free sound effects.mp3', '/audio/birds.mp3'],
    water: [
      '/audio/River sound effect  Free Ambience  free sounds.mp3',
      '/audio/water.mp3',
      '/audio/stream.mp3',
      '/audio/waterfall.mp3'
    ],
    flute: [
      '/audio/flute-music-free-background-music-copyright-free-no-copyright-flute-sujan-lama_TDBmIE5Q.mp3'
    ],
    bell: [
      '/audio/temple bell sound effect  temple bell sound no copyright.mp3',
      '/audio/temple-bell.mp3',
      '/audio/ghanti.mp3',
      '/audio/bell.mp3'
    ],
    none: [],
  };

  constructor() {
    try {
      this.initAudioContext();
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  private initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }
      
      this.audioContext = new AudioContextClass();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Failed to initialize audio context:', error);
      this.audioContext = null;
      this.masterGain = null;
    }

    // Defer creation until play() to avoid autoplay restrictions
  }

  private ensureAudioEl(type: SoundType): HTMLAudioElement | null {
    if (this.audioEls[type]) return this.audioEls[type];
    const candidates = this.urlCandidates[type];
    if (!candidates || !candidates.length) return null;
    const el = new Audio();
    el.loop = true;
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    // pick first candidate that the browser claims it can play
    const pick = candidates.find((u) => {
      const ext = u.split('.').pop() || '';
      const mime = ext === 'mp3' ? 'audio/mpeg' : ext === 'wav' ? 'audio/wav' : 'audio/*';
      return el.canPlayType(mime) !== '';
    }) || candidates[0];
    el.src = pick;
    this.audioEls[type] = el;
    return el;
  }

  /**
   * Start playing background sound
   */
  play(soundType: SoundType) {
    try {
      if (this.isPlaying) {
        this.stop();
      }

      if (soundType === 'none') {
        return;
      }

      // Ensure AudioContext is running for synthesized sounds
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      this.isPlaying = true;

      // Try file-based playback first
      const el = this.ensureAudioEl(soundType);
      if (el) {
        el.currentTime = 0;
        el.volume = this.masterGain ? this.masterGain.gain.value : 0.5;
        let fellBack = false;
        const fallbackToSynth = () => {
          if (fellBack) return;
          fellBack = true;
          // use synthesized generator for this type
          switch (soundType) {
            case 'om': this.playOmChanting(); break;
            case 'nature': this.playNatureSound(); break;
            case 'water': this.playWaterSound(); break;
            case 'flute': this.playFluteSound(); break;
            case 'bell': this.playBellSound(); break;
          }
        };
        const errorHandler = () => fallbackToSynth();
        el.addEventListener('error', errorHandler, { once: true });
        el.play().then(() => {
          // verify playback actually progresses; otherwise fallback
          setTimeout(() => {
            if (!fellBack && el.currentTime === 0) {
              fallbackToSynth();
            }
          }, 800);
        }).catch(() => fallbackToSynth());
        return;
      }

      switch (soundType) {
        case 'om':
          this.playOmChanting();
          break;
        case 'nature':
          this.playNatureSound();
          break;
        case 'water':
          this.playWaterSound();
          break;
        case 'flute':
          this.playFluteSound();
          break;
        case 'bell':
          this.playBellSound();
          break;
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
      this.isPlaying = false;
    }
  }

  /**
   * Stop all sounds
   */
  stop() {
    this.isPlaying = false;
    // Stop any HTMLAudioElement playing
    Object.values(this.audioEls).forEach((el) => {
      try { el.pause(); el.currentTime = 0; } catch {}
    });
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });

    // Disconnect all gain nodes
    this.gainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    });

    this.oscillators = [];
    this.gainNodes = [];
  }

  /**
   * OM Chanting - Deep meditative drone
   */
  private playOmChanting() {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // Fundamental frequency (Om base)
    const fundamental = 110; // Hz (A2)

    // Create multiple harmonics for rich Om sound
    const harmonics = [1, 2, 3, 4, 5, 6, 8];
    
    harmonics.forEach((harmonic, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = fundamental * harmonic;
      
      // Fade in
      gain.gain.setValueAtTime(0, currentTime);
      gain.gain.linearRampToValueAtTime(0.25 / (harmonic * 0.8), currentTime + 1.5);
      
      // Add slight vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.5 + (index * 0.1); // Slight variation
      lfoGain.gain.value = 2;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(currentTime);
      lfo.start(currentTime);
      
      this.oscillators.push(osc, lfo);
      this.gainNodes.push(gain, lfoGain);
    });
  }

  /**
   * Nature Sound - Birds chirping
   */
  private playNatureSound() {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    
    // Create ambient nature background
    const createBirdChirp = (delay: number) => {
      if (!this.isPlaying) return;
      
      setTimeout(() => {
        if (!this.isPlaying || !ctx || !this.masterGain) return;
        
        const currentTime = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Random bird frequency
        const freq = 1000 + Math.random() * 2000;
        osc.frequency.setValueAtTime(freq, currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, currentTime + 0.2);
        
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(currentTime);
        osc.stop(currentTime + 0.3);
        
        // Schedule next chirp
        if (this.isPlaying) {
          createBirdChirp(500 + Math.random() * 2000);
        }
      }, delay);
    };

    // Start multiple bird chirps
    createBirdChirp(0);
    createBirdChirp(500);
    createBirdChirp(1000);
  }

  /**
   * Water Sound - Flowing stream
   */
  private playWaterSound() {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    // White noise for water sound
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filter for water-like sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.linearRampToValueAtTime(0.3, currentTime + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(currentTime);

    this.oscillators.push(noise as any);
    this.gainNodes.push(gain);
  }

  /**
   * Flute Sound - Meditative flute melody
   */
  private playFluteSound() {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    
    // Pentatonic scale (spiritual sound)
    const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
    
    const playNote = (delay: number) => {
      if (!this.isPlaying) return;
      
      setTimeout(() => {
        if (!this.isPlaying || !ctx || !this.masterGain) return;
        
        const currentTime = ctx.currentTime;
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Flute-like envelope
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(0.2, currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.16, currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 1.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(currentTime);
        osc.stop(currentTime + 1.2);
        
        // Schedule next note
        if (this.isPlaying) {
          playNote(1000 + Math.random() * 2000);
        }
      }, delay);
    };

    playNote(0);
  }

  /**
   * Bell Sound - Temple bells
   */
  private playBellSound() {
    if (!this.audioContext || !this.masterGain) return;

    const ctx = this.audioContext;
    
    const playBell = (delay: number) => {
      if (!this.isPlaying) return;
      
      setTimeout(() => {
        if (!this.isPlaying || !ctx || !this.masterGain) return;
        
        const currentTime = ctx.currentTime;
        
        // Bell harmonics
        const frequencies = [523, 1046, 1568, 2093];
        
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.frequency.value = freq;
          
          const volume = 0.2 / (index + 1);
          gain.gain.setValueAtTime(volume, currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, currentTime + 3);
          
          osc.connect(gain);
          gain.connect(this.masterGain);
          
          osc.start(currentTime);
          osc.stop(currentTime + 3);
        });
        
        // Schedule next bell
        if (this.isPlaying) {
          playBell(8000 + Math.random() * 4000);
        }
      }, delay);
    };

    playBell(0);
  }

  /**
   * Set master volume
   */
  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
    Object.values(this.audioEls).forEach((el) => { el.volume = Math.max(0, Math.min(1, volume)); });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
