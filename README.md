# ⛓️ Markov Lab

**An interactive Markov chain laboratory** — build, simulate and dissect stochastic processes in your browser.

> The future is independent of the past, given the present. — the Markov property

## ✨ Features

### 🧪 Laboratory
- **Custom force-directed graph engine** (canvas, zero graph libraries) — glowing state nodes sized by stationary probability, curved probability-weighted edges with arrowheads, live particle flows, self-loops
- **Live random-walk simulation** — a glowing orb hops between states in real time; drag nodes, click any state to teleport the walker
- **Real-time diagnostics** — stationary distribution (power iteration), entropy rate in bits/step, mixing time (ε=0.05), irreducibility / aperiodicity / absorbing-state detection
- **Convergence analytics** — exact `e₀·Pᵏ` evolution chart with total-variation distance to π, plus empirical frequencies overlaying theory as steps accumulate

### 🛠️ Build & Edit
- Editable transition matrix with live row-sum validation + one-click normalization
- Add / remove / rename states (2–10 states), everything recomputes live

### 📖 Text Playground
- Order-1 / order-2 word-level Markov text generator with temperature sampling
- Train on any corpus, generate gloriously weird new sentences

### 📚 Library
- 8 preset models: Weather Machine, Gambler's Ruin, Mini PageRank, DNA Mutator, Elevator Dispatch, Melody Walker, Coder's Mood, M/M/1 Queue
- Save your own chains to SQLite (Prisma) — full CRUD via `/api/chains`

## 🧮 The math

| Concept | Method |
|---|---|
| Stationary distribution π | Power iteration to 1e-12 tolerance |
| Distribution after k steps | `e₀·Pᵏ` via matrix exponentiation by squaring |
| Entropy rate | `H = −Σᵢⱼ πᵢPᵢⱼ log₂ Pᵢⱼ` |
| Mixing time | smallest k with `‖e₀Pᵏ − π‖_TV < 0.05` |
| Periodicity | GCD of return-path lengths (BFS) |
| Irreducibility | Graph reachability BFS |

## 🏗️ Tech stack

- **Next.js 16** (App Router) · **TypeScript** strict
- **Zustand** for chain/simulation state
- **Recharts** for convergence analytics
- **Prisma + SQLite** for chain persistence
- **Tailwind CSS 4** + shadcn/ui, dark lab theme
- Custom canvas physics engine (repulsion + springs + centering)

## 🚀 Run it

```bash
bun install
bun run db:push
bun run dev
```

---
Built as a gift for [@dryitfu-code](https://github.com/dryitfu-code) — whose `markov_chain_models` repo was *too* empty. 😄
