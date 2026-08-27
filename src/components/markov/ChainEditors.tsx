"use client";

import { useMarkov } from "@/lib/markov/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Wand2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* muted editorial ramp — must match Analytics/MarkovGraph */
const STATE_COLORS = [
  "#D97757",
  "#7A9271",
  "#667A94",
  "#B08A50",
  "#9A7B8F",
  "#8F8F87",
  "#C99A6C",
  "#5F7E70",
  "#8B7CA8",
  "#A65B3F",
];

/** intensity → clay alpha: cell tint encodes probability, slate marks self-loops */
function heatStyle(v: number, isSelf: boolean) {
  const a = Math.min(Math.max(v, 0), 1);
  return {
    background: isSelf
      ? `rgba(102,122,148,${0.03 + a * 0.22})`
      : `rgba(217,119,87,${0.03 + a * 0.3})`,
    color: a >= 0.5 ? "#1F1E1D" : "#6B6B64",
    borderColor: a >= 0.55 ? "rgba(189,93,58,0.45)" : "#DDD9CC",
  } as React.CSSProperties;
}

export function TransitionMatrix() {
  const { states, matrix, setMatrixCell, normalize } = useMarkov();

  return (
    <Card className="gap-0 p-4">
      <CardHeader className="px-0 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <span className="eyebrow">Transition matrix</span>
            <span className="num rounded border border-hairline bg-white px-1.5 py-0.5 text-[10px] text-clay-dark">
              P
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 cursor-help text-ink-3 transition-colors hover:text-ink-2" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-64 border-hairline bg-white text-[12px] leading-relaxed text-ink-2">
                  <p>Row i, column j = probability of jumping from state i to state j. Each row should sum to 1.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={normalize}
            className="h-9 gap-1.5 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink"
          >
            <Wand2 className="h-3 w-3" /> Normalize rows
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <table className="w-full min-w-[420px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-20" />
              {states.map((s, j) => (
                <th key={j} className="micro pb-1 text-center text-ink-2">
                  {s.length > 8 ? s.slice(0, 7) + "…" : s}
                </th>
              ))}
              <th className="micro w-14 pb-1 text-center">Σ row</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowSum = row.reduce((a, b) => a + b, 0);
              const bad = Math.abs(rowSum - 1) > 0.02;
              return (
                <tr key={i}>
                  <td className="micro pr-2 text-right text-ink-2">
                    {states[i]?.length > 8 ? states[i].slice(0, 7) + "…" : states[i]}
                  </td>
                  {row.map((v, j) => {
                    const isSelf = i === j;
                    return (
                      <td key={j} className="p-0">
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          value={v}
                          onChange={(e) => setMatrixCell(i, j, Number(e.target.value))}
                          style={heatStyle(v, isSelf)}
                          className="h-9 rounded-md border bg-white text-center font-mono text-xs tabular-nums transition-colors duration-150 [appearance:textfield] focus:border-clay/70 focus:bg-white [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span
                      className={`num inline-flex rounded border px-1.5 py-0.5 text-[10px] ${
                        bad
                          ? "border-[#A3402A]/40 bg-[#A3402A]/[0.06] text-[#A3402A]"
                          : "border-[#7A9271]/40 bg-[#7A9271]/[0.08] text-[#5C7457]"
                      }`}
                    >
                      {rowSum.toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="micro mt-3 text-[10px] leading-relaxed">
          Clay tint encodes probability intensity · slate diagonal = self-loops · red Σ = row invalid
        </p>
      </CardContent>
    </Card>
  );
}

export function ChainEditor() {
  const { states, addState, removeState, renameState } = useMarkov();

  return (
    <Card className="gap-0 p-4">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="eyebrow">
            States <span className="num ml-1 text-ink-2">{states.length}</span>/10
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={states.length >= 10}
            onClick={() => addState(`State ${states.length + 1}`)}
            className="h-9 gap-1 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-0">
        {states.map((s, i) => (
          <div key={i} className="group flex items-center gap-2.5">
            <span
              className="h-4 w-1 shrink-0 rounded-full"
              style={{ background: STATE_COLORS[i % 10] }}
            />
            <span className="num w-5 shrink-0 text-[10px] text-ink-3">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Input
              value={s}
              onChange={(e) => renameState(i, e.target.value)}
              className="h-8 rounded-md border-hairline bg-white text-[13px] text-ink transition-colors duration-150 focus:border-clay/60"
            />
            <Button
              size="icon"
              variant="ghost"
              disabled={states.length <= 2}
              onClick={() => removeState(i)}
              className="shrink-0 rounded-md text-ink-3 opacity-0 transition-all duration-150 hover:bg-[#A3402A]/10 hover:text-[#A3402A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 group-hover:opacity-100 disabled:opacity-0"
              aria-label={`Remove ${s}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
