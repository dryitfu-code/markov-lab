"use client";

import { useMemo } from "react";
import { useMarkov } from "@/lib/markov/store";
import { distributionAfter, totalVariation } from "@/lib/markov/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Sigma, Timer, Flame } from "lucide-react";
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
  "#45e0a0",
  "#ffb224",
  "#f472b6",
  "#4cc9f0",
  "#a78bfa",
  "#7ee081",
  "#ff9e64",
  "#64e0d8",
  "#e0708a",
  "#b8e064",
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
    <Card className="h-full gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="micro">Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5 px-0">
        {/* big readouts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="well p-3">
            <div className="micro flex items-center gap-1.5">
              <Sigma className="h-3 w-3" /> Entropy rate
            </div>
            <div className="num mt-1.5 text-2xl leading-none text-[#45e0a0] [text-shadow:0_0_20px_rgba(69,224,160,0.4)]">
              {stats.entropyRate.toFixed(3)}
            </div>
            <div className="micro mt-1 text-[9px] text-[#526a60]">bits / step</div>
          </div>
          <div className="well p-3">
            <div className="micro flex items-center gap-1.5">
              <Timer className="h-3 w-3" /> Mix time
            </div>
            <div className="num mt-1.5 text-2xl leading-none text-[#4cc9f0] [text-shadow:0_0_20px_rgba(76,201,240,0.35)]">
              {mixingSteps === null ? "∞" : mixingSteps}
            </div>
            <div className="micro mt-1 text-[9px] text-[#526a60]">ε &lt; 0.05</div>
          </div>
        </div>

        {/* property flags */}
        <div className="flex flex-wrap gap-1.5">
          {[
            {
              ok: stats.isIrreducible,
              label: stats.isIrreducible ? "irreducible" : "reducible",
            },
            { ok: stats.isAperiodic, label: stats.isAperiodic ? "aperiodic" : "periodic" },
            {
              ok: !!stats.stationary,
              label: stats.stationary ? "ergodic → converges" : "no stationary π",
            },
          ].map((f, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${
                f.ok
                  ? "border-[#45e0a0]/30 bg-[rgba(69,224,160,0.07)] text-[#45e0a0]"
                  : "border-[#ffb224]/30 bg-[rgba(255,178,36,0.07)] text-[#ffb224]"
              }`}
            >
              <span aria-hidden="true">{f.ok ? "✓" : "!"}</span> {f.label}
            </span>
          ))}
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* π vs empirical */}
        <div>
          <div className="micro mb-2.5">
            π theory vs observed · <span className="num text-[#9db5aa]">{totalSteps}</span> steps
          </div>
          <div className="space-y-2">
            {states.map((s, i) => {
              const pi = stats.stationary?.[i] ?? 0;
              const emp = empirical[i] ?? 0;
              const maxPi = Math.max(...(stats.stationary ?? [1]), 0.001);
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate font-mono text-[11px] text-[#9db5aa]">{s}</span>
                    <span className="num shrink-0 pl-2 text-[10px] text-[#526a60]">
                      π {pi.toFixed(3)} · <span className="text-[#e7f2ec]">{(emp * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-sm border border-white/[0.05] bg-[#0b110f]">
                    {/* theory ghost */}
                    <div
                      className="absolute inset-y-0 left-0"
                      style={{
                        width: `${(pi / maxPi) * 100}%`,
                        background: `${LINE_COLORS[i % 10]}26`,
                        borderRight: `1px solid ${LINE_COLORS[i % 10]}55`,
                      }}
                    />
                    {/* observed solid */}
                    <div
                      className="absolute inset-y-[3px] left-0 rounded-[2px] transition-[width] duration-200"
                      style={{
                        width: `${Math.min((emp / maxPi) * 100, 100)}%`,
                        background: LINE_COLORS[i % 10],
                        boxShadow: `0 0 8px ${LINE_COLORS[i % 10]}66`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="micro mt-2.5 text-[9px] leading-relaxed normal-case tracking-normal text-[#526a60]">
            Solid = observed frequency · ghost = theoretical limit. They converge as steps → ∞.
          </p>
        </div>

        {stats.absorbingStates.length > 0 && (
          <>
            <Separator className="bg-white/[0.06]" />
            <div className="flex items-start gap-2 rounded-lg border border-[#ffb224]/25 bg-[rgba(255,178,36,0.06)] p-2.5 font-mono text-[11px] leading-relaxed text-[#ffb224]/90">
              <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Absorbing: {stats.absorbingStates.map((i) => states[i]).join(", ")} — the walker is
                trapped forever.
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
    <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="micro flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-[#45e0a0]" /> Convergence to equilibrium
          </span>
          <span className="font-mono text-[10px] normal-case tracking-normal text-[#526a60]">
            distribution after k steps from “{states[startState]}”
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] px-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -22 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="2 6" />
            <XAxis
              dataKey="step"
              tick={{ fill: "#526a60", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              stroke="rgba(255,255,255,0.12)"
              label={{
                value: "steps",
                fill: "#526a60",
                fontSize: 10,
                position: "insideBottomRight",
                offset: -2,
              }}
            />
            <YAxis
              tick={{ fill: "#526a60", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              stroke="rgba(255,255,255,0.12)"
              domain={[0, 1]}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.14)", strokeDasharray: "2 4" }}
              contentStyle={{
                background: "#0b110f",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 11,
                fontFamily: "var(--font-geist-mono)",
                color: "#cfe5db",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#9db5aa" }}
              itemStyle={{ color: "#cfe5db" }}
              labelFormatter={(l) => `after ${l} steps`}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-geist-mono)", color: "#9db5aa" }}
            />
            {states.map((s, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={`s${i}`}
                name={s.length > 8 ? s.slice(0, 7) + "…" : s}
                stroke={LINE_COLORS[i % 10]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
            {stats.stationary && (
              <Line
                type="monotone"
                dataKey="tvd"
                name="dist. to π"
                stroke="#ff6b6b"
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
