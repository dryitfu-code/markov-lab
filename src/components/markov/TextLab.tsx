"use client";

import { useMemo, useState } from "react";
import { trainTextModel, generateText, type TextModel } from "@/lib/markov/engine";
import { DEFAULT_CORPUS } from "@/lib/markov/presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Train, Thermometer } from "lucide-react";

export function TextLab() {
  const [corpus, setCorpus] = useState(DEFAULT_CORPUS);
  const [order, setOrder] = useState(1);
  const [temperature, setTemperature] = useState(1);
  const [model, setModel] = useState<TextModel | null>(null);
  const [output, setOutput] = useState<string>("");

  const stats = useMemo(() => {
    const words = corpus.trim().split(/\s+/).filter(Boolean).length;
    return { words, contexts: model?.transitions.size ?? 0 };
  }, [corpus, model]);

  const train = () => {
    const m = trainTextModel(corpus, order);
    setModel(m);
    setOutput("");
  };

  const generate = () => {
    if (!model || model.order !== order) {
      const m = trainTextModel(corpus, order);
      setModel(m);
      setOutput(generateText(m, 70, temperature));
    } else {
      setOutput(generateText(model, 70, temperature));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="micro flex items-center gap-2">
            <Train className="h-3.5 w-3.5 text-[#45e0a0]" /> Corpus
            <span className="num ml-auto rounded border border-white/[0.08] bg-[#0b110f] px-1.5 py-0.5 text-[10px] text-[#9db5aa]">
              {stats.words}w
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <Textarea
            value={corpus}
            onChange={(e) => setCorpus(e.target.value)}
            className="h-56 resize-none rounded-lg border-white/[0.07] bg-[#0b110f] font-mono text-xs leading-relaxed text-[#cfe5db] transition-colors duration-200 focus:border-[#45e0a0]/60"
            placeholder="Paste any text — song lyrics, prose, your own writing…"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="micro">Context</span>
              <div className="flex overflow-hidden rounded-lg border border-white/[0.09]">
                {[1, 2].map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrder(o)}
                    aria-pressed={order === o}
                    className={`px-3.5 py-2.5 font-mono text-[11px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#45e0a0]/60 ${
                      order === o
                        ? "bg-[#45e0a0] text-[#07130e]"
                        : "bg-[#141b1a] text-[#526a60] hover:text-[#9db5aa]"
                    }`}
                  >
                    {o}-gram
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-[#526a60]" />
              <Slider
                value={[temperature]}
                min={0.2}
                max={2}
                step={0.1}
                onValueChange={(v) => setTemperature(v[0])}
                className="flex-1"
              />
              <span className="num well rounded-md px-2 py-0.5 text-[11px] text-[#9db5aa]">
                T={temperature.toFixed(1)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={train}
              className="h-9 gap-1.5 rounded-lg border-white/[0.09] bg-[#141b1a] font-mono text-[10px] uppercase tracking-[0.1em] text-[#9db5aa] duration-200 hover:border-[#45e0a0]/50 hover:bg-[#16211f] hover:text-[#45e0a0]"
            >
              <Train className="h-3 w-3" /> Train
            </Button>
          </div>
          <p className="micro text-[9px] leading-relaxed normal-case tracking-normal text-[#526a60]">
            {stats.contexts > 0 && (
              <>
                Model online: <span className="num text-[#9db5aa]">{stats.contexts} contexts</span> ·
                order-{order} word chain. Low T = safe & repetitive · high T = chaotic & creative.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="micro flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#45e0a0]" /> Generated text
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 px-0">
          <div
            className={`relative flex-1 overflow-hidden rounded-xl p-4 transition-colors duration-200 ${
              output ? "border border-white/[0.07] bg-[#0b110f]" : "border border-dashed border-white/[0.09] bg-[#0b110f]/60"
            }`}
          >
            <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#45e0a0]/5 blur-2xl" />
            {output ? (
              <p className="relative font-mono text-[13px] leading-relaxed text-[#cfe5db]">
                {output}
              </p>
            ) : (
              <div className="relative flex h-full min-h-36 flex-col items-center justify-center gap-2.5 text-center">
                <Sparkles className="h-5 w-5 text-[#526a60]" aria-hidden="true" />
                <p className="micro normal-case tracking-normal">
                  Train on a corpus, then conjure new sentences from pure probability.
                </p>
              </div>
            )}
          </div>
          <Button
            onClick={generate}
            className="h-10 gap-2 rounded-lg bg-[#45e0a0] font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#07130e] shadow-[0_0_24px_rgba(69,224,160,0.25)] duration-200 hover:bg-[#6ae8bc] hover:shadow-[0_0_32px_rgba(69,224,160,0.4)]"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
