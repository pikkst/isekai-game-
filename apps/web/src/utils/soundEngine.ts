// Web Audio API Sound Synthesizer for Isekai RPG

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      this.isAmbientPlaying = false;
    }
    return this.soundEnabled;
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playSwordSlash() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playMagicSpell() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public playCheatActivation() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

    freqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.3);
    });
  }

  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [220, 207.65, 196, 185]; // Descending chromatic
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0.2, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.2);
    });
  }

  public startAmbientAtmosphere(mood: 'fantasy' | 'battle' | 'mystic' | 'dark' | 'triumph' | 'tranquil' = 'fantasy') {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.isAmbientPlaying && this.ambientGain) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.05, now);

      let chord = [261.63, 329.63, 392.0]; // C Major
      if (mood === 'dark' || mood === 'battle') {
        chord = [146.83, 174.61, 220.0]; // D Minor low
      } else if (mood === 'mystic') {
        chord = [293.66, 349.23, 440.0, 523.25]; // Dm7
      } else if (mood === 'triumph') {
        chord = [349.23, 440.0, 523.25, 698.46]; // F Major
      }

      chord.forEach((freq) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Gentle lfo modulation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.2, now);
        lfoGain.gain.setValueAtTime(2, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        lfo.start(now);
        osc.connect(this.ambientGain);
        osc.start(now);
      });

      this.ambientGain.connect(this.ctx.destination);
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Audio ambient initialization deferred', e);
    }
  }
}

export const soundEngine = new SoundEngine();
