import type { Matrix } from "./engine";

export interface PresetChain {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  states: string[];
  matrix: Matrix;
}

export const PRESET_CHAINS: PresetChain[] = [
  {
    id: "weather",
    name: "Weather Machine",
    emoji: "🌦️",
    category: "classic",
    description:
      "The textbook classic. Sunny days tend to stick around, rain brings clouds, and clouds sometimes clear up.",
    states: ["Sunny", "Cloudy", "Rainy"],
    matrix: [
      [0.7, 0.2, 0.1],
      [0.3, 0.4, 0.3],
      [0.2, 0.5, 0.3],
    ],
  },
  {
    id: "gambler",
    name: "Gambler's Ruin",
    emoji: "🎲",
    category: "classic",
    description:
      "A gambler bets $1 per round with even odds, starting at $2. Ruin ($0) and victory ($5) are absorbing — every game ends one way or another.",
    states: ["Broke 💀", "$1", "$2", "$3", "$4", "Jackpot 🏆"],
    matrix: [
      [1, 0, 0, 0, 0, 0],
      [0.5, 0, 0.5, 0, 0, 0],
      [0, 0.5, 0, 0.5, 0, 0],
      [0, 0, 0.5, 0, 0.5, 0],
      [0, 0, 0, 0.5, 0, 0.5],
      [0, 0, 0, 0, 0, 1],
    ],
  },
  {
    id: "pagerank",
    name: "Mini PageRank",
    emoji: "🌐",
    category: "graph",
    description:
      "A random surfer hopping across 7 linked web pages. This is the exact core idea behind Google's original ranking algorithm.",
    states: ["Home", "Blog", "Shop", "Forum", "Docs", "About", "Links"],
    matrix: [
      [0.05, 0.35, 0.2, 0.1, 0.2, 0.05, 0.05],
      [0.3, 0.05, 0.1, 0.3, 0.1, 0.1, 0.05],
      [0.2, 0.2, 0.05, 0.05, 0.1, 0.3, 0.1],
      [0.1, 0.25, 0.1, 0.05, 0.3, 0.1, 0.1],
      [0.35, 0.1, 0.15, 0.25, 0.05, 0.05, 0.05],
      [0.4, 0.2, 0.1, 0.1, 0.1, 0.05, 0.05],
      [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.1],
    ],
  },
  {
    id: "dna",
    name: "DNA Mutator",
    emoji: "🧬",
    category: "science",
    description:
      "CpG-style nucleotide mutation model from computational biology — how DNA sequences drift over generations.",
    states: ["A", "C", "G", "T"],
    matrix: [
      [0.3, 0.2, 0.3, 0.2],
      [0.15, 0.35, 0.3, 0.2],
      [0.2, 0.3, 0.35, 0.15],
      [0.25, 0.2, 0.2, 0.35],
    ],
  },
  {
    id: "elevator",
    name: "Elevator Dispatch",
    emoji: "🛗",
    category: "engineering",
    description:
      "A lift serving 5 floors in a busy building. Ground floor traffic dominates — queues in the morning rush.",
    states: ["Lobby", "Floor 2", "Floor 3", "Floor 4", "Penthouse"],
    matrix: [
      [0.1, 0.35, 0.25, 0.2, 0.1],
      [0.5, 0.1, 0.2, 0.15, 0.05],
      [0.45, 0.2, 0.1, 0.15, 0.1],
      [0.4, 0.15, 0.2, 0.1, 0.15],
      [0.3, 0.1, 0.15, 0.25, 0.2],
    ],
  },
  {
    id: "melody",
    name: "Melody Walker",
    emoji: "🎵",
    category: "fun",
    description:
      "A tune-generating walk over musical notes. Biased jumps toward consonant steps — it actually sounds musical.",
    states: ["do", "re", "mi", "fa", "sol", "la", "ti"],
    matrix: [
      [0.1, 0.4, 0.25, 0.1, 0.1, 0.05, 0.0],
      [0.3, 0.1, 0.35, 0.15, 0.05, 0.05, 0.0],
      [0.2, 0.3, 0.1, 0.3, 0.1, 0.0, 0.0],
      [0.1, 0.15, 0.3, 0.1, 0.3, 0.05, 0.0],
      [0.05, 0.05, 0.1, 0.35, 0.1, 0.3, 0.05],
      [0.05, 0.0, 0.05, 0.05, 0.35, 0.1, 0.4],
      [0.0, 0.0, 0.0, 0.05, 0.1, 0.45, 0.4],
    ],
  },
  {
    id: "mood",
    name: "Coder's Mood",
    emoji: "😤",
    category: "fun",
    description:
      "The daily emotional cycle of a software engineer. 'In Flow' is sticky, 'Debugging' is a deep pit, and 'Meeting' leads everywhere.",
    states: ["Chill 😌", "In Flow 🤩", "Debugging 🐛", "Meeting 😐", "Refactoring 🌀"],
    matrix: [
      [0.3, 0.4, 0.1, 0.15, 0.05],
      [0.1, 0.6, 0.2, 0.05, 0.05],
      [0.05, 0.3, 0.5, 0.05, 0.1],
      [0.15, 0.15, 0.2, 0.35, 0.15],
      [0.1, 0.25, 0.25, 0.05, 0.35],
    ],
  },
  {
    id: "queue",
    name: "M/M/1-ish Queue",
    emoji: "🏪",
    category: "engineering",
    description:
      "A single-server queue with 5 slots: arrivals vs. service race each step. The heart of traffic and capacity engineering.",
    states: ["empty", "1 job", "2 jobs", "3 jobs", "4 jobs", "full ⚠️"],
    matrix: [
      [0.4, 0.6, 0, 0, 0, 0],
      [0.3, 0.3, 0.4, 0, 0, 0],
      [0, 0.3, 0.3, 0.4, 0, 0],
      [0, 0, 0.3, 0.3, 0.4, 0],
      [0, 0, 0, 0.3, 0.3, 0.4],
      [0, 0, 0, 0, 0.55, 0.45],
    ],
  },
];

export const DEFAULT_CORPUS = `The markov chain walks through the state space without memory of where it has been.
Each step depends only on the present state, not on the path that led there.
A random walk on a graph visits popular nodes more often than lonely ones.
The stationary distribution tells us where the walk spends its time in the long run.
Entropy measures how unpredictable the next step of the chain really is.
Randomness is not noise. Randomness is a structure we can study with patience.
The gambler bets again and again until the money runs out or the jackpot arrives.
Google ranked the web by letting a random surfer click links forever.
Music is a walk over notes, and probability is the invisible composer.
Weather tomorrow depends on weather today, said the forecaster with a shrug.
Every board game is a markov chain if you squint hard enough at the dice.
The future is independent of the past, given the present. That is the markov property.
Chains that never forget cannot converge. Chains that always forget always do.
Time mixes everything. Given enough steps, every starting point fades into equilibrium.
The laboratory glows green at night while the particles flow along probability edges.`;
