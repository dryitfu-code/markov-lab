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
      <Card className="gap-0 p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="eyebrow flex items-center gap-2">
            <Train className="h-3.5 w-3.5 text-clay" /> Corpus
            <span className="num ml-auto rounded border border-hairline bg-white px-1.5 py-0.5 text-[10px] text-ink-3">
              {stats.words}w
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <Textarea
            value={corpus}
            onChange={(e) => setCorpus(e.target.value)}
            className="h-56 resize-none rounded-lg border-hairline bg-white font-serif text-[14px] leading-relaxed text-ink transition-colors duration-150 focus:border-clay/60"
            placeholder="Paste any text — song lyrics, prose, your own writing…"
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="micro">Context</span>
              <div className="flex overflow-hidden rounded-md border border-hairline">
                {[1, 2].map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrder(o)}
                    aria-pressed={order === o}
                    className={`px-3.5 py-2 text-[12px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-clay/60 ${
                      order === o
                        ? "bg-clay text-white"
                        : "bg-white text-ink-3 hover:text-ink"
                    }`}
                  >
                    {o}-gram
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-ink-3" />
              <Slider
                value={[temperature]}
                min={0.2}
                max={2}
                step={0.1}
                onValueChange={(v) => setTemperature(v[0])}
                className="flex-1"
              />
              <span className="num well px-2 py-0.5 text-[11px] text-ink-2">
                T={temperature.toFixed(1)}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={train}
              className="h-9 gap-1.5 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink"
            >
              <Train className="h-3 w-3" /> Train
            </Button>
          </div>
          <p className="micro text-[10px] leading-relaxed">
            {stats.contexts > 0 && (
              <>
                Model online: <span className="num text-ink-2">{stats.contexts} contexts</span> ·
                order-{order} word chain. Low T = safe &amp; repetitive · high T = chaotic &amp; creative.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-col gap-0 p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="eyebrow flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-clay" /> Generated text
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 px-0">
          <div
            className={`relative flex-1 overflow-hidden rounded-lg p-4 transition-colors duration-150 ${
              output ? "border border-hairline bg-white" : "border border-dashed border-hairline-strong bg-white/60"
            }`}
          >
            {output ? (
              <p className="font-serif text-[15px] leading-[1.75] text-ink">
                {output}
              </p>
            ) : (
              <div className="relative flex h-full min-h-36 flex-col items-center justify-center gap-2.5 text-center">
                <Sparkles className="h-5 w-5 text-ink-3" aria-hidden="true" />
                <p className="micro max-w-64 leading-relaxed">
                  Train on a corpus, then conjure new sentences from pure probability.
                </p>
              </div>
            )}
          </div>
          <Button
            onClick={generate}
            className="h-10 gap-2 rounded-md px-5 text-[13px] font-medium"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
