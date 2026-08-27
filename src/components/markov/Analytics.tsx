"use client";

import { useMemo } from "react";
import { useMarkov } from "@/lib/markov/store";
import { distributionAfter, totalVariation } from "@/lib/markov/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

/* muted editorial ramp — clay-anchored, warm, print-like */
const LINE_COLORS = [
  "#D97757", // clay
  "#7A9271", // sage
  "#667A94", // slate
  "#B08A50", // ochre
  "#9A7B8F", // mauve
  "#8F8F87", // warm gray
  "#C99A6C", // sand
  "#5F7E70", // pine
  "#8B7CA8", // iris
  "#A65B3F", // rust
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
    <Card className="h-full gap-0 p-4">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="eyebrow">Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3.5 px-0">
        {/* big readouts */}
        <div className="grid grid-cols-2 gap-2">
          <div className="well p-3">
            <div className="micro flex items-center gap-1.5">
              <Sigma className="h-3 w-3" /> Entropy rate
            </div>
            <div className="num mt-1.5 text-2xl font-medium leading-none text-clay-dark">
              {stats.entropyRate.toFixed(3)}
            </div>
            <div className="micro mt-1 text-[10px]">bits / step</div>
          </div>
          <div className="well p-3">
            <div className="micro flex items-center gap-1.5">
              <Timer className="h-3 w-3" /> Mix time
            </div>
            <div className="num mt-1.5 text-2xl font-medium leading-none text-[#667A94]">
              {mixingSteps === null ? "∞" : mixingSteps}
            </div>
            <div className="micro mt-1 text-[10px]">ε &lt; 0.05</div>
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
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium ${
                f.ok
                  ? "border-[#7A9271]/35 bg-[#7A9271]/[0.08] text-[#5C7457]"
                  : "border-[#D97757]/35 bg-[#D97757]/[0.07] text-[#A65B3F]"
              }`}
            >
              <span aria-hidden="true">{f.ok ? "✓" : "!"}</span> {f.label}
            </span>
          ))}
        </div>

        <Separator />

        {/* π vs empirical */}
        <div>
          <div className="micro mb-2.5">
            π theory vs observed · <span className="num text-ink-2">{totalSteps}</span> steps
          </div>
          <div className="space-y-2">
            {states.map((s, i) => {
              const pi = stats.stationary?.[i] ?? 0;
              const emp = empirical[i] ?? 0;
              const maxPi = Math.max(...(stats.stationary ?? [1]), 0.001);
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-[12px] text-ink-2">{s}</span>
                    <span className="num shrink-0 pl-2 text-[10px] text-ink-3">
                      π {pi.toFixed(3)} · <span className="text-ink">{(emp * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-sm border border-hairline bg-white">
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
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="micro mt-2.5 text-[10px] leading-relaxed">
            Solid = observed frequency · ghost = theoretical limit. They converge as steps → ∞.
          </p>
        </div>

        {stats.absorbingStates.length > 0 && (
          <>
            <Separator />
            <div className="flex items-start gap-2 rounded-md border border-clay/30 bg-clay/[0.05] p-2.5 text-[12px] leading-relaxed text-[#A65B3F]">
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
    <Card className="gap-0 p-4">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="eyebrow flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-clay" /> Convergence to equilibrium
          </span>
          <span className="text-[11px] text-ink-3">
            distribution after k steps from “{states[startState]}”
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[240px] px-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -22 }}>
            <CartesianGrid stroke="#E3DFD3" strokeDasharray="2 6" />
            <XAxis
              dataKey="step"
              tick={{ fill: "#8F8F87", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              stroke="#C9C4B4"
              label={{
                value: "steps",
                fill: "#8F8F87",
                fontSize: 10,
                position: "insideBottomRight",
                offset: -2,
              }}
            />
            <YAxis
              tick={{ fill: "#8F8F87", fontSize: 10, fontFamily: "var(--font-geist-mono)" }}
              stroke="#C9C4B4"
              domain={[0, 1]}
            />
            <Tooltip
              cursor={{ stroke: "#C9C4B4", strokeDasharray: "2 4" }}
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #DDD9CC",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "var(--font-geist-mono)",
                color: "#1F1E1D",
                boxShadow: "0 4px 16px rgba(25,25,25,0.08)",
              }}
              labelStyle={{ color: "#6B6B64" }}
              itemStyle={{ color: "#3D3D3A" }}
              labelFormatter={(l) => `after ${l} steps`}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-geist-mono)", color: "#6B6B64" }}
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
                stroke="#BD5D3A"
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
