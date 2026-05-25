class AudioManager {
  private ctx: AudioContext | null = null;

  private getContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  footstep() {
    this.playTone(100, 0.1, 'square');
  }

  collectItem() {
    this.playTone(800, 0.2, 'sine');
  }

  terminalSuccess() {
    this.playTone(600, 0.3, 'triangle');
    setTimeout(() => this.playTone(900, 0.3, 'triangle'), 150);
  }

  enemyAlert() {
    this.playTone(200, 0.5, 'sawtooth');
  }
}

export const audioManager = new AudioManager();