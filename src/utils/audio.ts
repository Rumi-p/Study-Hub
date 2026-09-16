// Web Audio API Synthesizer for study timer sounds and ambient noise generator

let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let ambientGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play pleasant multi-tone study chime
export function playCompletionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

// Play a subtle short click when timer starts or pauses
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch (err) {
    // Audio contexts may be blocked before user gesture
  }
}

// Ambient Background Sound Generator
export type AmbientType = 'none' | 'whitenoise' | 'rain' | 'library';

export function startAmbientSound(type: AmbientType, volume: number = 0.2) {
  stopAmbientSound();
  if (type === 'none') return;

  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 2; // 2 seconds looped noise buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'whitenoise') {
        output[i] = white * 0.3;
      } else if (type === 'rain') {
        // Pink/brown filtered noise
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      } else if (type === 'library') {
        // Deep low frequency warm hum
        lastOut = (lastOut + 0.008 * white) / 1.01;
        output[i] = lastOut * 4.0;
      }
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = buffer;
    whiteNoiseSource.loop = true;

    // Filter node
    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
    } else if (type === 'library') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, ctx.currentTime);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoiseSource.start();
    ambientSource = whiteNoiseSource;
    ambientGainNode = gain;
  } catch (err) {
    console.warn('Ambient sound playback error:', err);
  }
}

export function setAmbientVolume(volume: number) {
  if (ambientGainNode && audioCtx) {
    ambientGainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioCtx.currentTime);
  }
}

export function stopAmbientSound() {
  if (ambientSource) {
    try {
      (ambientSource as AudioBufferSourceNode).stop();
      ambientSource.disconnect();
    } catch (e) {
      // Ignored
    }
    ambientSource = null;
  }
}
