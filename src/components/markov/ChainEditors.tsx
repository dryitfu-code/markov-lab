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

/** intensity → phosphor alpha: cell background encodes probability */
function heatStyle(v: number, isSelf: boolean) {
  const a = Math.min(v, 1);
  return {
    background: isSelf
      ? `rgba(167,139,250,${0.06 + a * 0.2})`
      : `rgba(69,224,160,${0.03 + a * 0.3})`,
    color: v >= 0.55 ? "#e7f2ec" : v >= 0.2 ? "#cfe5db" : "#526a60",
    borderColor: v >= 0.55 ? "rgba(69,224,160,0.45)" : "rgba(255,255,255,0.07)",
    textShadow: v >= 0.55 ? "0 0 12px rgba(69,224,160,0.5)" : undefined,
  } as React.CSSProperties;
}

export function TransitionMatrix() {
  const { states, matrix, setMatrixCell, normalize } = useMarkov();

  return (
    <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="px-0 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="micro flex items-center gap-1.5">
            Transition matrix
            <span className="num rounded border border-white/[0.1] bg-[#0b110f] px-1.5 py-0.5 text-[10px] text-[#45e0a0]">
              P
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 cursor-help text-[#526a60] transition-colors hover:text-[#9db5aa]" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-64 border-white/10 bg-[#0b110f] font-mono text-[11px] normal-case tracking-normal text-[#9db5aa]">
                  <p>Row i, column j = probability of jumping from state i to state j. Each row should sum to 1.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={normalize}
            className="h-9 gap-1.5 rounded-md border-white/[0.09] bg-[#141b1a] px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#9db5aa] duration-200 hover:border-[#45e0a0]/50 hover:bg-[#16211f] hover:text-[#45e0a0]"
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
                <th key={j} className="micro pb-1 text-center normal-case tracking-[0.06em]">
                  {s.length > 8 ? s.slice(0, 7) + "…" : s}
                </th>
              ))}
              <th className="micro w-14 pb-1 text-center text-[9px]">Σ row</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowSum = row.reduce((a, b) => a + b, 0);
              const bad = Math.abs(rowSum - 1) > 0.02;
              return (
                <tr key={i}>
                  <td className="micro pr-2 text-right normal-case tracking-[0.06em] text-[#9db5aa]">
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
                          className="h-9 rounded-md border text-center font-mono text-xs tabular-nums transition-colors duration-200 [appearance:textfield] focus:border-[#45e0a0]/70 focus:bg-[#0b110f] [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <span
                      className={`num inline-flex rounded border px-1.5 py-0.5 text-[10px] ${
                        bad
                          ? "border-[#ffb224]/40 bg-[rgba(255,178,36,0.08)] text-[#ffb224]"
                          : "border-[#45e0a0]/30 bg-[rgba(69,224,160,0.06)] text-[#45e0a0]"
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
        <p className="micro mt-3 text-[9px] normal-case tracking-normal text-[#526a60]">
          Cell glow encodes probability intensity · violet diagonal = self-loops · amber Σ = row
          invalid
        </p>
      </CardContent>
    </Card>
  );
}

const STATE_DOTS = [
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

export function ChainEditor() {
  const { states, addState, removeState, renameState } = useMarkov();

  return (
    <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="micro flex items-center justify-between">
          <span>
            States <span className="num text-[#9db5aa]">{states.length}</span>/10
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={states.length >= 10}
            onClick={() => addState(`State ${states.length + 1}`)}
            className="h-9 gap-1 rounded-md border-white/[0.09] bg-[#141b1a] px-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#9db5aa] duration-200 hover:border-[#45e0a0]/50 hover:bg-[#16211f] hover:text-[#45e0a0] disabled:opacity-40"
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
              style={{ background: STATE_DOTS[i % 10], boxShadow: `0 0 6px ${STATE_DOTS[i % 10]}88` }}
            />
            <span className="num w-5 shrink-0 text-[10px] text-[#526a60]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Input
              value={s}
              onChange={(e) => renameState(i, e.target.value)}
              className="h-8 rounded-md border-white/[0.07] bg-[#0b110f] font-mono text-xs text-[#cfe5db] transition-colors duration-200 focus:border-[#45e0a0]/60"
            />
            <Button
              size="icon"
              variant="ghost"
              disabled={states.length <= 2}
              onClick={() => removeState(i)}
              className="shrink-0 rounded-md text-[#526a60] opacity-0 transition-all duration-200 hover:bg-[rgba(255,107,107,0.08)] hover:text-[#ff6b6b] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/60 group-hover:opacity-100 disabled:opacity-0"
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
