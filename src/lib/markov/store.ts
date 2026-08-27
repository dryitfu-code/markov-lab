"use client";

import { create } from "zustand";
import type { Matrix, ChainStats } from "./engine";
import { analyze, normalizeMatrix, stepChain } from "./engine";
import { PRESET_CHAINS } from "./presets";

export interface MarkovState {
  // Chain definition
  name: string;
  emoji: string;
  description: string;
  states: string[];
  matrix: Matrix;
  chainId: string | null; // db id if saved

  // Derived
  stats: ChainStats;

  // Simulation
  running: boolean;
  speed: number; // steps per second
  startState: number; // where the walk began
  current: number; // current state index
  visits: number[]; // visit counts
  totalSteps: number;
  empirical: number[]; // empirical distribution

  // Actions: chain
  loadPreset: (id: string) => void;
  setMatrixCell: (i: number, j: number, v: number) => void;
  normalize: () => void;
  addState: (name: string) => void;
  removeState: (idx: number) => void;
  renameState: (idx: number, name: string) => void;
  loadFromDb: (c: { id: string; name: string; description: string; category: string; states: string[]; matrix: Matrix }) => void;
  setMeta: (name: string, description: string) => void;

  // Actions: simulation
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: (n?: number) => void;
  setSpeed: (s: number) => void;
  jumpTo: (idx: number) => void;
  recompute: () => void;
}

function freshSim(states: string[], startIdx = 0) {
  return {
    startState: startIdx,
    current: startIdx,
    visits: states.map((_, i) => (i === startIdx ? 1 : 0)),
    totalSteps: 0,
    empirical: states.map((_, i) => (i === startIdx ? 1 : 0)),
  };
}

const initial = PRESET_CHAINS[0];

export const useMarkov = create<MarkovState>((set, get) => ({
  name: initial.name,
  emoji: initial.emoji,
  description: initial.description,
  states: [...initial.states],
  matrix: initial.matrix.map((r) => [...r]),
  chainId: null,
  stats: analyze(initial.matrix),

  running: false,
  speed: 2,
  ...freshSim(initial.states),

  loadPreset: (id) => {
    const p = PRESET_CHAINS.find((c) => c.id === id);
    if (!p) return;
    set({
      name: p.name,
      emoji: p.emoji,
      description: p.description,
      states: [...p.states],
      matrix: p.matrix.map((r) => [...r]),
      chainId: null,
      stats: analyze(p.matrix),
      running: false,
      ...freshSim(p.states),
    });
  },

  setMatrixCell: (i, j, v) => {
    const { matrix } = get();
    const next = matrix.map((r, ri) => r.map((c, ci) => (ri === i && ci === j ? v : c)));
    set({ matrix: next, stats: analyze(next) });
  },

  normalize: () => {
    const { matrix } = get();
    const next = normalizeMatrix(matrix);
    set({ matrix: next, stats: analyze(next) });
  },

  addState: (name) => {
    const { states, matrix } = get();
    if (states.length >= 10) return;
    const n = states.length + 1;
    const nextMatrix: Matrix = matrix.map((r) => [...r, 1 / n]);
    nextMatrix.push(Array(n).fill(1 / n));
    const nextStates = [...states, name];
    set({
      states: nextStates,
      matrix: normalizeMatrix(nextMatrix),
      running: false,
    });
    get().recompute();
    get().reset();
  },

  removeState: (idx) => {
    const { states, matrix } = get();
    if (states.length <= 2) return;
    const nextStates = states.filter((_, i) => i !== idx);
    const nextMatrix = matrix
      .filter((_, i) => i !== idx)
      .map((r) => r.filter((_, j) => j !== idx));
    set({ states: nextStates, matrix: normalizeMatrix(nextMatrix), running: false });
    get().recompute();
    get().reset();
  },

  renameState: (idx, name) => {
    const { states } = get();
    set({ states: states.map((s, i) => (i === idx ? name : s)) });
  },

  loadFromDb: (c) => {
    set({
      name: c.name,
      emoji: "💾",
      description: c.description,
      states: [...c.states],
      matrix: c.matrix.map((r) => [...r]),
      chainId: c.id,
      running: false,
    });
    get().recompute();
    get().reset();
  },

  setMeta: (name, description) => set({ name, description }),

  play: () => set({ running: true }),
  pause: () => set({ running: false }),

  reset: () => {
    const { states } = get();
    set({ running: false, ...freshSim(states) });
  },

  step: (n = 1) => {
    const { matrix, current, visits, totalSteps, empirical } = get();
    let cur = current;
    const v = [...visits];
    const emp = [...empirical];
    for (let k = 0; k < n; k++) {
      cur = stepChain(matrix, cur);
      v[cur]++;
    }
    const t = totalSteps + n;
    // empirical distribution update: visit counts / total
    for (let i = 0; i < emp.length; i++) emp[i] = v[i] / (t + 1);
    set({ current: cur, visits: v, totalSteps: t, empirical: emp });
  },

  setSpeed: (s) => set({ speed: s }),

  jumpTo: (idx) => {
    const { states, running } = get();
    set({ ...freshSim(states, idx), running });
  },

  recompute: () => {
    const { matrix } = get();
    set({ stats: analyze(matrix) });
  },
}));
