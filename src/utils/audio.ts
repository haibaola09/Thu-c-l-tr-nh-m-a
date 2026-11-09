/**
 * Audio Controller for the Rain Ember Cigarette Dodge Game.
 * Features:
 * - Background Soundtrack: "Thăng Long trong Tim Tôi (Remix)"
 *   File path: /assets/aistudio/Th_ng_Long_trong_Tim_T_i__Remix__1_7f6c06d6.m4a
 * - Soft procedural rain ambient sound generator (pink noise).
 * - Interactive sound effects (flame whoosh, water extinguish hiss, score ticks, victory fanfare).
 * - Designed by Ngô Mạnh Hải.
 */

const BG_MUSIC_SRC = '/assets/aistudio/Th_ng_Long_trong_Tim_T_i__Remix__1_7f6c06d6.m4a';

export class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;

  // Background audio element for the remix track
  private bgAudio: HTMLAudioElement | null = null;
  private bgAudioLoaded: boolean = false;

  // Rain ambient nodes
  private rainNoiseNode: AudioNode | null = null;
  private rainGainNode: GainNode | null = null;

  constructor() {
    const savedMute = localStorage.getItem('rain_ember_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
    const savedMusic = localStorage.getItem('rain_ember_music_enabled');
    if (savedMusic !== null) {
      this.isMusicEnabled = savedMusic === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initBgAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.bgAudio) {
      const audio = new Audio(BG_MUSIC_SRC);
      audio.loop = true;
      audio.volume = 0.6;
      audio.preload = 'auto';

      audio.addEventListener('canplaythrough', () => {
        this.bgAudioLoaded = true;
      });

      this.bgAudio = audio;
    }
    return this.bgAudio;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('rain_ember_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopRainAmbient();
      this.stopBackgroundMusic();
    } else {
      this.startRainAmbient();
      if (this.isMusicEnabled) {
        this.startBackgroundMusic();
      }
    }
    return this.isMuted;
  }

  public toggleRomanticMusic(): boolean {
    return this.toggleBackgroundMusic();
  }

  public toggleBackgroundMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    localStorage.setItem('rain_ember_music_enabled', String(this.isMusicEnabled));
    if (this.isMusicEnabled && !this.isMuted) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
    return this.isMusicEnabled;
  }

  // =========================================================================
  // BACKGROUND MUSIC PLAYBACK ("Thăng Long trong Tim Tôi (Remix)")
  // =========================================================================

  /**
   * Start playing the user's background music track
   */
  public startBackgroundMusic() {
    if (this.isMuted || !this.isMusicEnabled) return;
    this.initContext();
    const audio = this.initBgAudio();
    if (!audio) return;

    audio.volume = 0.6;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If autoplay is blocked by browser policy, queue playback on the first user interaction
        const resumeOnInteraction = () => {
          if (!this.isMuted && this.isMusicEnabled && this.bgAudio) {
            this.bgAudio.play().catch(() => {});
          }
          window.removeEventListener('pointerdown', resumeOnInteraction);
          window.removeEventListener('keydown', resumeOnInteraction);
        };
        window.addEventListener('pointerdown', resumeOnInteraction, { once: true });
        window.addEventListener('keydown', resumeOnInteraction, { once: true });
      });
    }
  }

  /**
   * Backward-compatible alias
   */
  public startRomanticMusic() {
    this.startBackgroundMusic();
  }

  /**
   * Stop/Pause background music
   */
  public stopBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  public stopRomanticMusic() {
    this.stopBackgroundMusic();
  }

  // =========================================================================
  // RAIN AMBIENT & SOUND EFFECTS (Web Audio API)
  // =========================================================================

  /**
   * Start soft procedural rain ambient sound
   */
  public startRainAmbient() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    if (this.rainNoiseNode) return; // already playing

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Pink noise algorithm for soothing gentle rain
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.025;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter: gentle bandpass
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      this.rainNoiseNode = whiteNoise;
      this.rainGainNode = gain;

      // Also ensure background remix music is playing
      if (this.isMusicEnabled) {
        this.startBackgroundMusic();
      }
    } catch {
      // Audio context might fail on initial blocked autoplay
    }
  }

  public stopRainAmbient() {
    if (this.rainGainNode && this.ctx) {
      try {
        this.rainGainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.rainNoiseNode) {
            (this.rainNoiseNode as AudioBufferSourceNode).stop();
            this.rainNoiseNode.disconnect();
            this.rainNoiseNode = null;
            this.rainGainNode = null;
          }
        }, 500);
      } catch {
        this.rainNoiseNode = null;
        this.rainGainNode = null;
      }
    }
  }

  /**
   * Sound when fire is collected: bright, uplifting whoosh and crackle
   */
  public playFireCollect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Upward warm flare
      osc1.frequency.setValueAtTime(280, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      osc2.frequency.setValueAtTime(420, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.36);
      osc2.stop(now + 0.36);
    } catch {
      // ignore
    }
  }

  /**
   * Sound when raindrop hits cigarette: sizzle and water extinguish hiss
   */
  public playExtinguish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Burst of sizzle noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      // Low pitch steam sizzle
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      noiseSource.start(now);
      subOsc.start(now);
      subOsc.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  /**
   * Sound when point milestone or score ticks
   */
  public playTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  /**
   * Sound for 100 points victory fanfare!
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.75);
      });
    } catch {
      // ignore
    }
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundController();
