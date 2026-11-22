// Midnight at the Aurelia — every sound is synthesised in the browser with
// WebAudio: soft footsteps, a coin clink, a gem chime, the camera's warning
// beep, a rising alarm, the EMP zap and the getaway arpeggio. No audio files.
export function createAudio() {
  const audio = {
    context: null,
    muted: false,
    ensure() {
      if (!audio.context) {
        try {
          const Ctor = window.AudioContext || window.webkitAudioContext;
          audio.context = new Ctor();
        } catch {
          audio.context = null;
        }
      }
      if (audio.context && audio.context.state === 'suspended') audio.context.resume();
    },
    setMuted(muted) {
      audio.muted = muted;
    },
    tone(frequency, duration, type, gainValue, slideTo) {
      if (!audio.context || audio.muted) return;
      const now = audio.context.currentTime;
      const oscillator = audio.context.createOscillator();
      const gain = audio.context.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainValue || 0.08, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(audio.context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    },
    noise(duration, gainValue, lowpass) {
      if (!audio.context || audio.muted) return;
      const now = audio.context.currentTime;
      const length = Math.floor(audio.context.sampleRate * duration);
      const buffer = audio.context.createBuffer(1, length, audio.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = audio.context.createBufferSource();
      source.buffer = buffer;
      const filter = audio.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = lowpass || 1200;
      const gain = audio.context.createGain();
      gain.gain.setValueAtTime(gainValue || 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      source.connect(filter).connect(gain).connect(audio.context.destination);
      source.start(now);
    },
    playEvent(event) {
      if (!audio.context || audio.muted) return;
      switch (event) {
        case 'step':
          audio.tone(170, 0.05, 'triangle', 0.02);
          break;
        case 'step-loud':
          audio.noise(0.07, 0.05, 700);
          break;
        case 'pickup':
          audio.tone(880, 0.12, 'sine', 0.07);
          audio.tone(1318, 0.16, 'sine', 0.05);
          break;
        case 'loot':
          audio.tone(523, 0.14, 'sine', 0.08);
          audio.tone(659, 0.14, 'sine', 0.08);
          audio.tone(784, 0.2, 'sine', 0.08);
          audio.tone(1046, 0.3, 'sine', 0.08);
          break;
        case 'exit':
          audio.tone(392, 0.16, 'triangle', 0.08);
          audio.tone(523, 0.16, 'triangle', 0.08);
          audio.tone(659, 0.3, 'triangle', 0.08);
          break;
        case 'win':
          [523, 659, 784, 1046, 1318].forEach((freq, i) => {
            setTimeout(() => audio.tone(freq, 0.3, 'triangle', 0.08), i * 110);
          });
          break;
        case 'alert':
          audio.tone(220, 0.35, 'sawtooth', 0.06, 440);
          break;
        case 'beep':
          audio.tone(1250, 0.09, 'square', 0.035);
          break;
        case 'caught':
          audio.tone(330, 0.5, 'sawtooth', 0.08, 110);
          break;
        case 'lockdown':
          audio.tone(180, 0.7, 'square', 0.07, 90);
          audio.noise(0.5, 0.05, 400);
          break;
        case 'throw':
          audio.tone(1900, 0.08, 'sine', 0.06, 900);
          audio.noise(0.06, 0.04, 4000);
          break;
        case 'smoke':
          audio.noise(0.6, 0.08, 900);
          break;
        case 'emp':
          audio.tone(1400, 0.4, 'sawtooth', 0.06, 120);
          audio.noise(0.25, 0.05, 3000);
          break;
        default:
          break;
      }
    },
  };
  return audio;
}
