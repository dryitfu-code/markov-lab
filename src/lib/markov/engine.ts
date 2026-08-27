/**
 * Markov Chain Engine — core math library
 * Powers: stationary distribution, entropy rate, simulation,
 * convergence analysis (total variation distance), expected return times.
 */

export type Matrix = number[][];

export interface ChainStats {
  stationary: number[] | null; // limiting distribution (null if not ergodic)
  entropyRate: number; // bits per step
  isIrreducible: boolean;
  isAperiodic: boolean;
  absorbingStates: number[]; // indices of absorbing states
  expectedReturn: (number | null)[]; // mean recurrence time per state
}

/** Validate + normalize rows so each sums to exactly 1 */
export function normalizeMatrix(m: Matrix): Matrix {
  return m.map((row) => {
    const s = row.reduce((a, b) => a + Math.max(0, b), 0);
    if (s <= 0) return row.map(() => 1 / row.length);
    return row.map((v) => Math.max(0, v) / s);
  });
}

export function isStochastic(m: Matrix): boolean {
  return (
    m.length > 0 &&
    m.every(
      (row) =>
        row.length === m.length &&
        row.every((v) => v >= 0 && v <= 1) &&
        Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 1e-6
    )
  );
}

/** Matrix power via repeated squaring */
export function matrixPower(m: Matrix, k: number): Matrix {
  const n = m.length;
  const identity: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  if (k === 0) return identity;
  let result = identity;
  let base = m.map((r) => [...r]);
  let exp = k;
  while (exp > 0) {
    if (exp & 1) result = matMul(result, base);
    base = matMul(base, base);
    exp >>= 1;
  }
  return result;
}

function matMul(a: Matrix, b: Matrix): Matrix {
  const n = a.length;
  const out: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let k = 0; k < n; k++) {
      if (a[i][k] === 0) continue;
      for (let j = 0; j < n; j++) out[i][j] += a[i][k] * b[k][j];
    }
  return out;
}

/** Distribution after k steps: e_start * P^k */
export function distributionAfter(m: Matrix, start: number[], k: number): number[] {
  const p = matrixPower(m, k);
  const n = m.length;
  const out = Array(n).fill(0);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) out[j] += start[i] * p[i][j];
  return out;
}

/**
 * Stationary distribution via power iteration.
 * Returns null when the chain fails to converge (periodic / reducible).
 */
export function stationaryDistribution(m: Matrix, maxIter = 5000, tol = 1e-12): number[] | null {
  const n = m.length;
  let dist = Array(n).fill(1 / n);
  for (let it = 0; it < maxIter; it++) {
    const next = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const w = dist[i];
      if (w === 0) continue;
      for (let j = 0; j < n; j++) next[j] += w * m[i][j];
    }
    const tvd = totalVariation(next, dist);
    dist = next;
    if (tvd < tol) return dist;
  }
  return null;
}

/** Total variation distance |mu - nu|_TV */
export function totalVariation(a: number[], b: number[]): number {
  return 0.5 * a.reduce((acc, v, i) => acc + Math.abs(v - b[i]), 0);
}

/** Shannon entropy rate in bits/step */
export function entropyRate(m: Matrix, stationary: number[] | null): number {
  if (!stationary) return 0;
  let h = 0;
  for (let i = 0; i < m.length; i++) {
    for (let j = 0; j < m.length; j++) {
      const p = m[i][j];
      if (p > 0) h -= stationary[i] * p * Math.log2(p);
    }
  }
  return h;
}

/** BFS from state i over positive-probability edges */
function reachable(m: Matrix, from: number): Set<number> {
  const seen = new Set([from]);
  const queue = [from];
  while (queue.length) {
    const s = queue.shift()!;
    for (let j = 0; j < m.length; j++) {
      if (m[s][j] > 1e-12 && !seen.has(j)) {
        seen.add(j);
        queue.push(j);
      }
    }
  }
  return seen;
}

export function isIrreducible(m: Matrix): boolean {
  const r = reachable(m, 0);
  return r.size === m.length;
}

/** Aperiodicity via gcd of cycle lengths through state 0 (irreducible chains) */
export function isAperiodic(m: Matrix): boolean {
  const n = m.length;
  const lens: number[] = [];
  const visited = new Map<number, number>(); // node -> min length seen
  const queue: Array<[number, number]> = [[0, 0]];
  visited.set(0, 0);
  let guard = 0;
  while (queue.length && guard++ < 5000) {
    const [node, len] = queue.shift()!;
    if (len > 2 * n + 4) continue;
    for (let j = 0; j < n; j++) {
      if (m[node][j] > 1e-12) {
        if (j === 0 && len + 1 > 0) lens.push(len + 1);
        const prev = visited.get(j);
        if (prev === undefined || len + 1 < prev + n) {
          visited.set(j, len + 1);
          queue.push([j, len + 1]);
        }
      }
    }
  }
  if (!lens.length) return true;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  return lens.reduce((a, b) => gcd(a, b)) === 1;
}

export function absorbingStates(m: Matrix): number[] {
  const out: number[] = [];
  for (let i = 0; i < m.length; i++) {
    if (m[i][i] > 1 - 1e-9) out.push(i);
  }
  return out;
}

/** Mean recurrence time mu_i = 1 / pi_i (ergodic chains only) */
export function expectedReturnTimes(stationary: number[] | null): (number | null)[] {
  if (!stationary) return [];
  return stationary.map((p) => (p > 1e-9 ? 1 / p : null));
}

/** Full analysis bundle */
export function analyze(m: Matrix): ChainStats {
  const stationary = stationaryDistribution(m);
  return {
    stationary,
    entropyRate: entropyRate(m, stationary),
    isIrreducible: isIrreducible(m),
    isAperiodic: isAperiodic(m),
    absorbingStates: absorbingStates(m),
    expectedReturnTimes: expectedReturnTimes(stationary),
  };
}

/** One simulation step: pick next state from row `current` */
export function stepChain(m: Matrix, current: number): number {
  const row = m[current];
  let r = Math.random();
  for (let j = 0; j < row.length; j++) {
    r -= row[j];
    if (r <= 0) return j;
  }
  return row.length - 1;
}

/* ------------------------------------------------------------------ */
/*  Text Markov chain — order-k word model                             */
/* ------------------------------------------------------------------ */

export interface TextModel {
  order: number;
  vocab: string[];
  transitions: Map<string, Array<{ next: string; p: number }>>;
  starts: string[];
}

export function trainTextModel(corpus: string, order: number): TextModel {
  const words = corpus
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  const starts: string[] = [];
  const counts = new Map<string, Map<string, number>>();

  for (let i = 0; i + order < words.length; i++) {
    const ctx = words.slice(i, i + order).join(" ");
    const next = words[i + order];
    if (i === 0 || /[.!?]$/.test(words[i + order - 1] ?? "")) {
      starts.push(ctx);
    }
    if (!counts.has(ctx)) counts.set(ctx, new Map());
    const inner = counts.get(ctx)!;
    inner.set(next, (inner.get(next) ?? 0) + 1);
  }

  const transitions = new Map<string, Array<{ next: string; p: number }>>();
  for (const [ctx, inner] of counts) {
    const total = [...inner.values()].reduce((a, b) => a + b, 0);
    transitions.set(
      ctx,
      [...inner.entries()]
        .map(([next, c]) => ({ next, p: c / total }))
        .sort((a, b) => b.p - a.p)
    );
  }
  return { order, vocab: [...new Set(words)], transitions, starts };
}

export function generateText(model: TextModel, maxWords = 60, temperature = 1): string {
  const pool = model.starts.length ? model.starts : [...model.transitions.keys()];
  if (!pool.length) return "";
  let ctx = pool[Math.floor(Math.random() * pool.length)];
  const outWords = ctx.split(" ");
  for (let i = 0; i < maxWords; i++) {
    const options = model.transitions.get(ctx);
    if (!options?.length) break;
    let pick: string | null = null;
    if (temperature !== 1) {
      const scaled = options.map((o) => ({ next: o.next, p: Math.pow(o.p, 1 / temperature) }));
      const tot = scaled.reduce((a, b) => a + b.p, 0);
      let r = Math.random() * tot;
      for (const o of scaled) {
        r -= o.p;
        if (r <= 0) {
          pick = o.next;
          break;
        }
      }
      pick = pick ?? scaled[scaled.length - 1].next;
    } else {
      let r = Math.random();
      for (const o of options) {
        r -= o.p;
        if (r <= 0) {
          pick = o.next;
          break;
        }
      }
      pick = pick ?? options[options.length - 1].next;
    }
    outWords.push(pick);
    ctx = outWords.slice(-model.order).join(" ");
    if (/[.!?]$/.test(pick) && outWords.length > 25) break;
  }
  let text = outWords.join(" ");
  if (!/[.!?]$/.test(text)) text += "...";
  return text;
}
