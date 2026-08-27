"use client";

/**
 * Web Audio engine — makes Markov chains audible.
 * Each state maps to a musical note; the random walk becomes a melody.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** C-major solfège — for the Melody Walker preset */
const SOLFEGE: Record<string, number> = {
  do: 261.63,
  re: 293.66,
  mi: 329.63,
  fa: 349.23,
  sol: 392.0,
  la: 440.0,
  ti: 493.88,
};

/** Major pentatonic ladder for generic chains (10 slots = max states) */
const PENTATONIC = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
];

export function noteForState(label: string, index: number): number {
  const key = label.trim().toLowerCase().split(/\s+/)[0];
  if (key in SOLFEGE) return SOLFEGE[key];
  return PENTATONIC[index % PENTATONIC.length];
}

/** Play a soft triangle-wave tone with quick attack + exponential decay */
export function playTone(freq: number, duration = 0.3, volume = 0.15) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const t0 = c.currentTime;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}
