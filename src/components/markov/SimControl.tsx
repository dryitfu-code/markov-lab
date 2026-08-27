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
    <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3 px-0">
        <span className="micro hidden sm:inline">Transport</span>

        <div className="flex items-center gap-1.5">
          {running ? (
            <Button
              size="sm"
              onClick={pause}
              className="h-9 gap-1.5 rounded-lg bg-[#ffb224] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#1a1206] shadow-[0_0_20px_rgba(255,178,36,0.25)] duration-200 hover:bg-[#ffc24a]"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={play}
              className="h-9 gap-1.5 rounded-lg bg-[#45e0a0] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#07130e] shadow-[0_0_20px_rgba(69,224,160,0.3)] duration-200 hover:bg-[#6ae8bc]"
            >
              <Play className="h-3.5 w-3.5" /> Run walk
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(1)}
            className="h-9 w-9 rounded-lg border-white/[0.09] bg-[#141b1a] p-0 text-[#9db5aa] duration-200 hover:border-[#45e0a0]/50 hover:bg-[#16211f] hover:text-[#45e0a0]"
            aria-label="Step once"
            title="Step once"
          >            <StepForward className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => step(200)}
            className="h-9 gap-1 rounded-lg border-white/[0.09] bg-[#141b1a] font-mono text-[11px] text-[#9db5aa] duration-200 hover:border-[#45e0a0]/50 hover:bg-[#16211f] hover:text-[#45e0a0]"
            title="Fast-forward 200 steps"
          >
            <Zap className="h-3.5 w-3.5" /> ×200
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={reset}
            className="h-9 w-9 rounded-lg border-white/[0.09] bg-[#141b1a] p-0 text-[#9db5aa] duration-200 hover:border-[#ff6b6b]/50 hover:bg-[#16211f] hover:text-[#ff6b6b]"
            aria-label="Reset simulation"
            title="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-white/[0.07]" aria-hidden="true" />

        <Button
          size="sm"
          variant="outline"
          onClick={toggleSound}
          aria-pressed={soundOn}
          className={`h-9 w-9 rounded-lg border bg-[#141b1a] p-0 transition-all duration-200 ${
            soundOn
              ? "border-[#45e0a0]/60 bg-[rgba(69,224,160,0.1)] text-[#45e0a0] shadow-[0_0_16px_rgba(69,224,160,0.2)]"
              : "border-white/[0.09] text-[#526a60] hover:border-[#45e0a0]/40 hover:text-[#45e0a0]"
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
          <span className="num well rounded-md px-2 py-0.5 text-[11px] text-[#9db5aa]">
            {speed.toFixed(1)}<span className="text-[#526a60]">/s</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
