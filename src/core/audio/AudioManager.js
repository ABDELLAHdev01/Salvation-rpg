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
      bgmVolume: 0.35,
      bgmEnabled: true,
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
    if (this.settings.muted) {
      this.stopBGM();
      this.stopRainAmbience();
    } else if (this.settings.bgmEnabled && this.currentBGMZone) {
      this.playBGM(this.currentBGMZone);
    }
    this.saveSettings();
    return this.settings.muted;
  }

  toggleBGM() {
    this.settings.bgmEnabled = !this.settings.bgmEnabled;
    if (!this.settings.bgmEnabled) {
      this.stopBGM();
    } else if (this.currentBGMZone) {
      this.playBGM(this.currentBGMZone);
    }
    this.saveSettings();
    return this.settings.bgmEnabled;
  }

  isMuted() {
    return this.settings.muted;
  }

  setVolume(master = 0.6, sfx = 0.8, bgm = 0.35) {
    this.settings.masterVolume = Math.max(0, Math.min(1, master));
    this.settings.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.settings.bgmVolume = Math.max(0, Math.min(1, bgm));
    this.saveSettings();
  }

  // =========================================================================
  // 1. PROCEDURAL REGIONAL SOUNDTRACK & AMBIENT BGM ENGINE
  // =========================================================================
  playBGM(zone = 'homestead') {
    if (this.settings.muted || !this.settings.bgmEnabled) return;
    this.currentBGMZone = zone;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }

    // Immediately trigger first phrase, then recurring phrases
    this.triggerBGMPhrase(zone);
    this.bgmTimer = setInterval(() => {
      if (!this.settings.muted && this.settings.bgmEnabled) {
        this.triggerBGMPhrase(zone);
      }
    }, 4200);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  triggerBGMPhrase(zone) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bgmGain = this.settings.masterVolume * this.settings.bgmVolume * 0.08;

    switch (zone) {
      case 'homestead':
      case 'west_road':
        // Pastoral Meadow: Warm plucked harp & lute arpeggios in C Major / G Major
        this.synthPastoralPluck(ctx, now, bgmGain);
        break;
      case 'village':
        // Sunforge City Plaza: Lively tavern/bazaar flute and lute syncopation
        this.synthTavernMelody(ctx, now, bgmGain);
        break;
      case 'forest':
        // Whispering Woods: Ethereal wind chimes & harmonic sylvan pads
        this.synthForestChime(ctx, now, bgmGain);
        break;
      case 'mine':
        // Deepforge Caverns: Subterranean resonant drone & crystal gleam
        this.synthCavernEcho(ctx, now, bgmGain);
        break;
      default:
        this.synthPastoralPluck(ctx, now, bgmGain);
    }
  }

  // Pastoral Meadow Acoustic Pluck
  synthPastoralPluck(ctx, now, gainLevel) {
    const scale = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25]; // C4, E4, G4, A4, C5, E5
    const phrase = [
      scale[Math.floor(Math.random() * 3)],
      scale[Math.floor(Math.random() * 4) + 1],
      scale[Math.floor(Math.random() * 3) + 3],
      scale[Math.floor(Math.random() * 2) + 2],
    ];

    phrase.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.45;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.8, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  // Sunforge City Tavern / Bazaar Melodic Riff
  synthTavernMelody(ctx, now, gainLevel) {
    const dorian = [293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 587.33]; // D4 Dorian
    const steps = [0, 2, 4, 3, 2];

    steps.forEach((stepIdx, idx) => {
      const freq = dorian[stepIdx % dorian.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const t = now + idx * 0.32;

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.9, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  // Whispering Woods Mystical Harmonic Pad
  synthForestChime(ctx, now, gainLevel) {
    const root = 220.0; // A3
    const harmonics = [root, root * 1.5, root * 2.0, root * 2.5]; // Fifth, Octave, Major Third

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const t = now + idx * 0.25;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(gainLevel * 0.5, t + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      if (pan) {
        pan.pan.setValueAtTime(idx % 2 === 0 ? -0.4 : 0.4, t);
        osc.connect(pan);
        pan.connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 2.6);
    });
  }

  // Deep Cavern Subterranean Drone & Echo
  synthCavernEcho(ctx, now, gainLevel) {
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(65.41, now); // C2 Deep bass
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(gainLevel * 1.1, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 3.1);

    // Resonant crystal drop ping
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    const dropTime = now + 1.2;

    ping.type = 'sine';
    ping.frequency.setValueAtTime(1200, dropTime);
    ping.frequency.exponentialRampToValueAtTime(800, dropTime + 0.3);

    pingGain.gain.setValueAtTime(gainLevel * 0.7, dropTime);
    pingGain.gain.exponentialRampToValueAtTime(0.0001, dropTime + 0.4);

    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start(dropTime);
    ping.stop(dropTime + 0.45);
  }

  // =========================================================================
  // 2. WEATHER & ENVIRONMENTAL AMBIENCE
  // =========================================================================
  startRainAmbience() {
    if (this.rainSource || this.settings.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Create 2-second pink noise buffer for realistic rain hiss
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    const gain = ctx.createGain();
    const rainLevel = this.settings.masterVolume * this.settings.sfxVolume * 0.06;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(rainLevel, ctx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    this.rainSource = whiteNoise;
    this.rainGain = gain;
  }

  stopRainAmbience() {
    if (this.rainSource) {
      try {
        if (this.rainGain && this.ctx) {
          this.rainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
          setTimeout(() => {
            if (this.rainSource) {
              this.rainSource.stop();
              this.rainSource.disconnect();
              this.rainSource = null;
            }
          }, 1100);
        } else {
          this.rainSource.stop();
          this.rainSource = null;
        }
      } catch {
        this.rainSource = null;
      }
    }
  }

  // Thunder rumble
  playThunder() {
    if (this.settings.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainLevel = this.settings.masterVolume * this.settings.sfxVolume * 0.22;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.linearRampToValueAtTime(80, now + 1.5);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.8);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainLevel, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.3);
  }

  // =========================================================================
  // 3. MASTER SFX DISPATCHER
  // =========================================================================

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
      case 'splash':
        this.synthSplash(ctx, now, baseGain);
        break;
      case 'bite':
        this.synthBite(ctx, now, baseGain);
        break;
      case 'reel':
        this.synthReel(ctx, now, baseGain);
        break;
      case 'bark':
        this.synthBark(ctx, now, baseGain);
        break;
      case 'chirp':
        this.synthChirp(ctx, now, baseGain);
        break;
      case 'wisp':
        this.synthWisp(ctx, now, baseGain);
        break;
      case 'boss_roar':
        this.synthBossRoar(ctx, now, baseGain);
        break;
      case 'boss_telegraph':
        this.synthBossTelegraph(ctx, now, baseGain);
        break;
      case 'boss_slam':
        this.synthBossSlam(ctx, now, baseGain);
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

  _resolveParams(ctx, now, baseGain) {
    if (!ctx) {
      if (this.settings.muted) return null;
      ctx = this.getAudioContext();
      if (!ctx || typeof ctx.createOscillator !== 'function') return null;
      now = ctx.currentTime;
      baseGain = this.settings.masterVolume * this.settings.sfxVolume * 0.15;
    }
    return { ctx, now, baseGain };
  }

  // Water plunge & bubble splash
  synthSplash(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(120, now + 0.18);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

    gain.gain.setValueAtTime(baseGain * 1.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Fish tug alert exclamation
  synthBite(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    [880, 1174.66, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(baseGain * 1.2, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  // Rapid ratchet reel click
  synthReel(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

    gain.gain.setValueAtTime(baseGain * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Barkley Dog Bark
  synthBark(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(baseGain * 1.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Talon Falcon Screech / Chirp
  synthChirp(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.linearRampToValueAtTime(3100, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.14);

    gain.gain.setValueAtTime(baseGain * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Lumina Sylvan Wisp Harmonic Shimmer
  synthWisp(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const chord = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(baseGain * 0.8, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.42);
    });
  }

  // World Boss Menacing Roar
  synthBossRoar(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.linearRampToValueAtTime(150, now + 1.2);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 1.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(baseGain * 1.8, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 1.35);
    subOsc.stop(now + 1.35);
  }

  // Boss Attack Telegraph Warning Ping
  synthBossTelegraph(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.linearRampToValueAtTime(980, now + 0.15);

    gain.gain.setValueAtTime(baseGain * 1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Boss Ground Slam Explosive Impact
  synthBossSlam(ctx, now, baseGain) {
    const p = this._resolveParams(ctx, now, baseGain);
    if (!p) return;
    ctx = p.ctx; now = p.now; baseGain = p.baseGain;

    const osc = ctx.createOscillator();
    const noise = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.5);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(90, now);
    noise.frequency.exponentialRampToValueAtTime(25, now + 0.4);

    gain.gain.setValueAtTime(baseGain * 2.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(filter);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.6);
    noise.stop(now + 0.6);
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
