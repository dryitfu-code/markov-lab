"use client";

import { useMarkov } from "@/lib/markov/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, StepForward, RotateCcw, Zap } from "lucide-react";
import { useEffect } from "react";

/** Drives the simulation loop with requestAnimationFrame-accurate timing */
export function SimControl() {
  const { running, speed, play, pause, step, reset } = useMarkov();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      step(1);
    }, Math.max(1000 / speed, 60));
    return () => clearInterval(id);
  }, [running, speed, step]);

  return (
    <Card className="border-zinc-800 bg-zinc-950/60">
      <CardContent className="flex flex-wrap items-center gap-3 py-4">
        <div className="flex items-center gap-2">
          {running ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={pause}
              className="h-9 gap-1.5 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
            >
              <Pause className="h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={play}
              className="h-9 gap-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
            >
              <Play className="h-4 w-4" /> Run walk
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(1)}
            className="h-9 w-9 border-zinc-700 p-0 hover:border-violet-500/50"
            aria-label="Step once"
          >
            <StepForward className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(200)}
            className="h-9 gap-1 border-zinc-700 text-xs hover:border-violet-500/50"
          >
            <Zap className="h-3.5 w-3.5" /> ×200
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="h-9 w-9 border-zinc-700 p-0 hover:border-red-500/50 hover:text-red-400"
            aria-label="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex min-w-44 flex-1 items-center gap-3">
          <span className="text-[11px] text-zinc-500">speed</span>
          <Slider
            value={[speed]}
            min={0.5}
            max={12}
            step={0.5}
            onValueChange={(v) => useMarkov.getState().setSpeed(v[0])}
            className="flex-1"
          />
          <Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-400">
            {speed.toFixed(1)}/s
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
