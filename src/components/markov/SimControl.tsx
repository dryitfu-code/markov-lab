"use client";

import { useMarkov } from "@/lib/markov/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, StepForward, RotateCcw, Zap, Volume2, VolumeX } from "lucide-react";
import { useEffect } from "react";

/** Drives the simulation loop — transport-style control bar */
export function SimControl() {
  const { running, speed, soundOn, play, pause, step, reset, toggleSound } = useMarkov();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      step(1);
    }, Math.max(1000 / speed, 60));
    return () => clearInterval(id);
  }, [running, speed, step]);

  return (
    <Card className="gap-0 p-4">
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3 px-0">
        <span className="micro hidden sm:inline">Transport</span>

        <div className="flex items-center gap-1.5">
          {running ? (
            <Button
              size="sm"
              onClick={pause}
              className="h-9 gap-1.5 rounded-md px-4 text-[13px] font-medium"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={play}
              className="h-9 gap-1.5 rounded-md px-4 text-[13px] font-medium"
            >
              <Play className="h-3.5 w-3.5" /> Run walk
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(1)}
            className="h-9 w-9 rounded-md border-hairline-strong bg-transparent p-0 text-ink-2 hover:bg-accent hover:text-ink"
            aria-label="Step once"
            title="Step once"
          >
            <StepForward className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(200)}
            className="h-9 gap-1 rounded-md border-hairline-strong bg-transparent px-3 text-[13px] text-ink-2 hover:bg-accent hover:text-ink"
            title="Fast-forward 200 steps"
          >
            <Zap className="h-3.5 w-3.5" /> ×200
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="h-9 w-9 rounded-md border-hairline-strong bg-transparent p-0 text-ink-2 hover:border-destructive/40 hover:bg-accent hover:text-destructive"
            aria-label="Reset simulation"
            title="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-hairline" aria-hidden="true" />

        <Button
          size="sm"
          variant="outline"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className={`h-9 w-9 rounded-md border bg-transparent p-0 transition-colors duration-180 ${
            soundOn
              ? "border-clay/60 bg-clay/[0.07] text-clay-dark hover:bg-clay/[0.12]"
              : "border-hairline-strong text-ink-3 hover:border-clay/40 hover:text-clay-dark"
          }`}
          aria-label={soundOn ? "Mute chain sounds" : "Enable chain sounds"}
          title={soundOn ? "Mute chain sounds" : "Hear the walk — each state is a note"}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <div className="flex min-w-44 flex-1 items-center gap-3">
          <span className="micro">Rate</span>
          <Slider
            value={[speed]}
            min={0.5}
            max={12}
            step={0.5}
            onValueChange={(v) => useMarkov.getState().setSpeed(v[0])}
            className="flex-1"
          />
          <span className="num well px-2 py-0.5 text-[11px] text-ink-2">
            {speed.toFixed(1)}<span className="text-ink-3">/s</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
