"use client";

import { useMarkov } from "@/lib/markov/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Wand2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TransitionMatrix() {
  const { states, matrix, setMatrixCell, normalize } = useMarkov();

  return (
    <Card className="border-zinc-800 bg-zinc-950/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Transition Matrix P
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-zinc-500" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-64">
                  <p>Row i, column j = probability of jumping from state i to state j. Each row should sum to 1.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={normalize}
            className="h-7 gap-1 border-zinc-700 text-xs hover:border-emerald-500/50 hover:text-emerald-400"
          >
            <Wand2 className="h-3 w-3" /> Normalize rows
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="w-20" />
              {states.map((s, j) => (
                <th key={j} className="pb-1 text-center text-[11px] font-medium text-zinc-400">
                  {s.length > 8 ? s.slice(0, 7) + "…" : s}
                </th>
              ))}
              <th className="w-14 pb-1 text-center text-[10px] font-medium text-zinc-500">Σ row</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => {
              const rowSum = row.reduce((a, b) => a + b, 0);
              const bad = Math.abs(rowSum - 1) > 0.02;
              return (
                <tr key={i}>
                  <td className="pr-2 text-right text-[11px] font-semibold text-zinc-300">
                    {states[i]?.length > 8 ? states[i].slice(0, 7) + "…" : states[i]}
                  </td>
                  {row.map((v, j) => {
                    const isSelf = i === j;
                    const hot = v >= 0.5;
                    return (
                      <td key={j} className="p-0">
                        <Input
                          type="number"
                          min={0}
                          max={1}
                          step={0.05}
                          value={v}
                          onChange={(e) => setMatrixCell(i, j, Number(e.target.value))}
                          className={`h-9 border text-center font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${
                            isSelf
                              ? "border-zinc-700 bg-zinc-900/60 text-zinc-300"
                              : hot
                                ? "border-emerald-600/50 bg-emerald-950/40 text-emerald-300"
                                : "border-zinc-800 bg-zinc-900/30 text-zinc-400"
                          } focus:border-violet-500/60`}
                        />
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] ${
                        bad
                          ? "border-amber-600/50 bg-amber-950/40 text-amber-300"
                          : "border-emerald-700/40 bg-emerald-950/30 text-emerald-400"
                      }`}
                    >
                      {rowSum.toFixed(2)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function ChainEditor() {
  const { states, addState, removeState, renameState } = useMarkov();

  return (
    <Card className="border-zinc-800 bg-zinc-950/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          States ({states.length}/10)
          <Button
            size="sm"
            variant="outline"
            disabled={states.length >= 10}
            onClick={() => addState(`State ${states.length + 1}`)}
            className="h-7 gap-1 border-zinc-700 text-xs hover:border-emerald-500/50 hover:text-emerald-400"
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {states.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-1.5 self-stretch rounded-full" style={{ background: `hsl(${(i * 41) % 360} 70% 55%)` }} />
            <Input
              value={s}
              onChange={(e) => renameState(i, e.target.value)}
              className="h-8 border-zinc-800 bg-zinc-900/40 text-xs"
            />
            <Button
              size="icon"
              variant="ghost"
              disabled={states.length <= 2}
              onClick={() => removeState(i)}
              className="h-8 w-8 shrink-0 text-zinc-500 hover:text-red-400"
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
