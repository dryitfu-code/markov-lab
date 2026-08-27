"use client";

import { useMemo } from "react";
import { useMarkov } from "@/lib/markov/store";
import { distributionAfter, totalVariation } from "@/lib/markov/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, BarChart3, Sigma, Timer, Flame } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LINE_COLORS = [
  "#34d399",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#22d3ee",
  "#fb923c",
  "#a3e635",
  "#e879f9",
  "#f87171",
  "#4ade80",
];

export function StatsPanel() {
  const { states, stats, empirical, totalSteps, matrix } = useMarkov();

  const mixingSteps = useMemo(() => {
    if (!stats.stationary) return null;
    const start = states.map((_, i) => (i === 0 ? 1 : 0));
    for (let k = 0; k <= 200; k++) {
      const d = distributionAfter(matrix, start, k);
      if (totalVariation(d, stats.stationary) < 0.05) return k;
    }
    return null;
  }, [matrix, stats.stationary, states]);

  return (
    <Card className="h-full border-zinc-800 bg-zinc-950/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Sigma className="h-3 w-3" /> Entropy rate
            </div>
            <div className="font-mono text-lg text-emerald-400">
              {stats.entropyRate.toFixed(3)}
              <span className="text-[10px] text-zinc-500"> bits/step</span>
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500">
              <Timer className="h-3 w-3" /> Mix time (ε=0.05)
            </div>
            <div className="font-mono text-lg text-violet-400">
              {mixingSteps === null ? "∞" : `${mixingSteps} steps`}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className={
              stats.isIrreducible
                ? "border-emerald-700/50 bg-emerald-950/40 text-emerald-400"
                : "border-amber-700/50 bg-amber-950/40 text-amber-300"
            }
          >
            {stats.isIrreducible ? "irreducible ✓" : "reducible"}
          </Badge>
          <Badge
            variant="outline"
            className={
              stats.isAperiodic
                ? "border-emerald-700/50 bg-emerald-950/40 text-emerald-400"
                : "border-amber-700/50 bg-amber-950/40 text-amber-300"
            }
          >
            {stats.isAperiodic ? "aperiodic ✓" : "periodic"}
          </Badge>
          {stats.stationary ? (
            <Badge variant="outline" className="border-emerald-700/50 bg-emerald-950/40 text-emerald-400">
              ergodic — converges
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-800/50 bg-red-950/40 text-red-400">
              no stationary π
            </Badge>
          )}
        </div>

        <Separator className="bg-zinc-800" />

        <div>
          <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <BarChart3 className="h-3 w-3" /> Stationary vs empirical ({totalSteps} steps)
          </div>
          <div className="space-y-1.5">
            {states.map((s, i) => {
              const pi = stats.stationary?.[i] ?? 0;
              const emp = empirical[i] ?? 0;
              const maxPi = Math.max(...(stats.stationary ?? [1]), 0.001);
              return (
                <div key={i} className="group">
                  <div className="mb-0.5 flex items-center justify-between text-[10px]">
                    <span className="truncate text-zinc-400">{s}</span>
                    <span className="font-mono text-zinc-500">
                      π {pi.toFixed(3)} · x̄ {(emp * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded bg-zinc-900">
                    <div
                      className="absolute inset-y-0 left-0 rounded opacity-30"
                      style={{ width: `${(pi / maxPi) * 100}%`, background: LINE_COLORS[i % 10] }}
                    />
                    <div
                      className="absolute inset-y-[3px] left-0 rounded-sm"
                      style={{
                        width: `${(emp / maxPi) * 100}%`,
                        background: LINE_COLORS[i % 10],
                        maxWidth: "100%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
            Solid bar = observed frequency so far · faded = theoretical limit. They converge as steps → ∞.
          </p>
        </div>

        {stats.absorbingStates.length > 0 && (
          <>
            <Separator className="bg-zinc-800" />
            <div className="flex items-start gap-1.5 text-[11px] text-amber-300/80">
              <Flame className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Absorbing states: {stats.absorbingStates.map((i) => states[i]).join(", ")} — the walker gets trapped forever.
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ConvergenceChart() {
  const { states, matrix, stats, startState } = useMarkov();

  const data = useMemo(() => {
    const start = states.map((_, i) => (i === startState ? 1 : 0));
    const rows: Array<Record<string, number>> = [];
    const horizons = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30];
    for (const k of horizons) {
      const d = distributionAfter(matrix, start, k);
      const row: Record<string, number> = { step: k };
      states.forEach((_, i) => {
        row[`s${i}`] = +(d[i] ?? 0).toFixed(4);
      });
      if (stats.stationary) {
        row.tvd = +totalVariation(d, stats.stationary).toFixed(4);
      }
      rows.push(row);
    }
    return rows;
  }, [matrix, states, startState, stats.stationary]);

  return (
    <Card className="border-zinc-800 bg-zinc-950/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-emerald-400" />
          Convergence to equilibrium
          <span className="text-[10px] font-normal text-zinc-500">
            distribution after k steps from “{states[startState]}”
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -22 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="step"
              tick={{ fill: "#71717a", fontSize: 10 }}
              stroke="#3f3f46"
              label={{ value: "steps", fill: "#52525b", fontSize: 10, position: "insideBottomRight", offset: -2 }}
            />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="#3f3f46" domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                background: "#09090b",
                border: "1px solid #27272a",
                borderRadius: 8,
                fontSize: 11,
              }}
              labelFormatter={(l) => `after ${l} steps`}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {states.map((s, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`s${i}`}
                name={s.length > 8 ? s.slice(0, 7) + "…" : s}
                stroke={LINE_COLORS[i % 10]}
                strokeWidth={2}
                dot={false}
              />
            ))}
            {stats.stationary && (
              <Line
                type="monotone"
                dataKey="tvd"
                name="dist. to π"
                stroke="#fc7f7f"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
