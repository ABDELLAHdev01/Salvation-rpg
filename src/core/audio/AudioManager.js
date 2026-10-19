/**
 * Salvation Web Audio API Sound Engine
 * Procedural low-latency sound synthesizer.
 * Requires zero external audio files. Respects user mute/volume settings.
 */

const AUDIO_STORAGE_KEY = 'salvation_audio_settings';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.settings = this.loadSettings();
    this.isInitialized = false;

    // Auto-listen to global UI SFX dispatch
    if (typeof window !== 'undefined') {
      window.addEventListener('ui:sfx', (event) => {
        const type = event?.detail?.type || 'tap';
        this.play(type);
      });
    }
  }

  loadSettings() {
    try {
      const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to default
    }
    return {
      muted: false,
      masterVolume: 0.6,
      sfxVolume: 0.8,
    };
  }

  saveSettings() {
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.settings.muted = !this.settings.muted;
    this.saveSettings();
    return this.settings.muted;
  }

  isMuted() {
    return this.settings.muted;
  }

  setVolume(master = 0.6, sfx = 0.8) {
    this.settings.masterVolume = Math.max(0, Math.min(1, master));
    this.settings.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.saveSettings();
  }

  play(soundType = 'tap') {
    if (this.settings.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const baseGain = this.settings.masterVolume * this.settings.sfxVolume * 0.15;
    const now = ctx.currentTime;

    switch (soundType) {
      case 'tap':
      case 'click':
        this.synthTap(ctx, now, baseGain);
        break;
      case 'mine_strike':
      case 'strike':
        this.synthMineStrike(ctx, now, baseGain);
        break;
      case 'node_shatter':
      case 'shatter':
        this.synthNodeShatter(ctx, now, baseGain);
        break;
      case 'harvest':
        this.synthHarvest(ctx, now, baseGain);
        break;
      case 'craft_complete':
      case 'craft':
        this.synthCraft(ctx, now, baseGain);
        break;
      case 'level_up':
      case 'levelup':
        this.synthLevelUp(ctx, now, baseGain);
        break;
      case 'coin':
      case 'gold':
        this.synthCoin(ctx, now, baseGain);
        break;
      case 'error':
        this.synthError(ctx, now, baseGain);
        break;
      default:
        this.synthTap(ctx, now, baseGain);
    }
  }

  // Soft wooden / parchment UI click
  synthTap(ctx, now, baseGain) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(baseGain * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Metallic pickaxe striking ore
  synthMineStrike(ctx, now, baseGain) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1160, now);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.06);

    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.09);
    osc2.stop(now + 0.09);
  }

  // Crystal deposit fracturing and exploding into nuggets
  synthNodeShatter(ctx, now, baseGain) {
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = idx * 0.03;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 0.2);

      gain.gain.setValueAtTime(baseGain * 1.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.25);
    });
  }

  // Earthy chime for crop harvest
  synthHarvest(ctx, now, baseGain) {
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(baseGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  // Anvil ping resonance
  synthCraft(ctx, now, baseGain) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.3);

    gain.gain.setValueAtTime(baseGain * 1.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Triumphant ascending arpeggio
  synthLevelUp(ctx, now, baseGain) {
    const chord = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(baseGain * 1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // Coin bag jingle
  synthCoin(ctx, now, baseGain) {
    [1200, 1600].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(baseGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  // Low dull error pulse
  synthError(ctx, now, baseGain) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.15);

    gain.gain.setValueAtTime(baseGain * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const audioManager = new SoundEngine();
export default audioManager;
