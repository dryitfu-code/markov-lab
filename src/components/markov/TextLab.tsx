"use client";

import { useMemo, useState } from "react";
import { trainTextModel, generateText, type TextModel } from "@/lib/markov/engine";
import { DEFAULT_CORPUS } from "@/lib/markov/presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Train className="h-4 w-4 text-emerald-400" />
            Corpus
            <Badge variant="outline" className="ml-auto border-zinc-700 text-[10px] font-mono text-zinc-500">
              {stats.words} words
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={corpus}
            onChange={(e) => setCorpus(e.target.value)}
            className="h-56 resize-none border-zinc-800 bg-zinc-900/40 font-mono text-xs leading-relaxed text-zinc-300"
            placeholder="Paste any text — song lyrics, prose, your own writing…"
          />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500">context</span>
              <div className="flex overflow-hidden rounded-md border border-zinc-800">
                {[1, 2].map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrder(o)}
                    className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                      order === o
                        ? "bg-emerald-600 text-zinc-950"
                        : "bg-zinc-900/60 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {o}-gram
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <Thermometer className="h-3.5 w-3.5 text-zinc-500" />
              <Slider
                value={[temperature]}
                min={0.2}
                max={2}
                step={0.1}
                onValueChange={(v) => setTemperature(v[0])}
                className="flex-1"
              />
              <Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-400">
                T={temperature.toFixed(1)}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={train}
              className="h-8 border-zinc-700 text-xs hover:border-emerald-500/50 hover:text-emerald-400"
            >
              Train model
            </Button>
          </div>
          <p className="text-[10px] leading-relaxed text-zinc-600">
            {stats.contexts > 0 && (
              <>
                Model: <span className="font-mono text-zinc-500">{stats.contexts} contexts</span> · order-{order} word
                chain. Low T = safe & repetitive, high T = chaotic & creative.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="flex flex-col border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Generated text
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <div className="flex-1 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-4">
            {output ? (
              <p className="text-sm leading-relaxed text-zinc-200">{output}</p>
            ) : (
              <p className="py-8 text-center text-xs text-zinc-600">
                Train on a corpus, then conjure new sentences from pure probability.
              </p>
            )}
          </div>
          <Button
            onClick={generate}
            className="h-10 gap-2 bg-gradient-to-r from-emerald-500 to-violet-500 text-sm font-semibold text-zinc-950 hover:from-emerald-400 hover:to-violet-400"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
