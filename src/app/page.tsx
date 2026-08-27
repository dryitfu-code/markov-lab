"use client";

import { useEffect } from "react";
import { useMarkov } from "@/lib/markov/store";
import MarkovGraph from "@/components/markov/MarkovGraph";
import { TransitionMatrix, ChainEditor } from "@/components/markov/ChainEditors";
import { SimControl } from "@/components/markov/SimControl";
import { StatsPanel, ConvergenceChart } from "@/components/markov/Analytics";
import { ModelLibrary } from "@/components/markov/ModelLibrary";
import { TextLab } from "@/components/markov/TextLab";
import ChainAudio from "@/components/markov/ChainAudio";
import { ShareTools, decodeSharePayload } from "@/components/markov/ShareTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, FlaskConical, Footprints, BookOpen, FolderOpen } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { name, emoji, description, states, current, totalSteps, running } = useMarkov();

  // Load a shared chain from the URL hash (#c=...) on first mount
  useEffect(() => {
    const m = window.location.hash.match(/^#c=(.+)$/);
    if (!m) return;
    const chain = decodeSharePayload(m[1]);
    if (chain) {
      useMarkov.getState().importChain(chain);
      toast.success(`Loaded shared chain “${chain.name}” from link`);
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#090d0c]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-[#0e1413] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <span className="font-mono text-[13px] font-bold tracking-[0.14em] text-[#45e0a0]">
              MARKOV·LAB
            </span>
          </div>
          <span className="micro hidden md:inline">P(X t+1 | Xt) — the future depends only on the present</span>

          <div className="ml-auto flex items-center gap-2.5">
            {/* instrument readout */}
            <div className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-[#0e1413] px-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <span className={`led ${running ? "" : "led-amber"}`} aria-hidden="true" />
              <span className="micro text-[#9db5aa]">
                step <span className="num text-[#e7f2ec]">{String(totalSteps).padStart(4, "0")}</span>
              </span>
            </div>
            <a
              href="https://github.com/dryitfu-code"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-[#0e1413] text-[#526a60] transition-all duration-200 hover:border-white/20 hover:text-[#e7f2ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/70"
              aria-label="GitHub profile"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Hero strip */}
        <section className="mb-5 flex flex-wrap items-center gap-4">
          <span className="text-3xl" aria-hidden="true">
            {emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-[#e7f2ec]">
                {name}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,178,36,0.35)] bg-[rgba(255,178,36,0.08)] px-2.5 py-0.5 font-mono text-[11px] text-[#ffb224]">
                <span className="led led-amber" aria-hidden="true" />
                walker @ {states[current] ?? "—"}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 max-w-3xl text-[13px] leading-relaxed text-[#526a60]">
              {description}
            </p>
          </div>
        </section>

        <Tabs defaultValue="lab" className="w-full">
          <ChainAudio />
          <TabsList className="mb-4 h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-white/[0.07] bg-[#0e1413] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:w-auto">
            <TabsTrigger
              value="lab"
              className="shrink-0 gap-1.5 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#526a60] transition-colors duration-150 data-[state=active]:bg-[#45e0a0] data-[state=active]:text-[#07130e] data-[state=active]:shadow-[0_0_16px_rgba(69,224,160,0.25)] hover:text-[#9db5aa] data-[state=active]:hover:text-[#07130e]"
            >
              <FlaskConical className="h-3.5 w-3.5" /> Laboratory
            </TabsTrigger>
            <TabsTrigger
              value="build"
              className="shrink-0 gap-1.5 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#526a60] transition-colors duration-150 data-[state=active]:bg-[#45e0a0] data-[state=active]:text-[#07130e] data-[state=active]:shadow-[0_0_16px_rgba(69,224,160,0.25)] hover:text-[#9db5aa] data-[state=active]:hover:text-[#07130e]"
            >
              <Footprints className="h-3.5 w-3.5" /> Build & Edit
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="shrink-0 gap-1.5 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#526a60] transition-colors duration-150 data-[state=active]:bg-[#45e0a0] data-[state=active]:text-[#07130e] data-[state=active]:shadow-[0_0_16px_rgba(69,224,160,0.25)] hover:text-[#9db5aa] data-[state=active]:hover:text-[#07130e]"
            >
              <BookOpen className="h-3.5 w-3.5" /> Text Playground
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="shrink-0 gap-1.5 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#526a60] transition-colors duration-150 data-[state=active]:bg-[#45e0a0] data-[state=active]:text-[#07130e] data-[state=active]:shadow-[0_0_16px_rgba(69,224,160,0.25)] hover:text-[#9db5aa] data-[state=active]:hover:text-[#07130e]"
            >
              <FolderOpen className="h-3.5 w-3.5" /> Library
            </TabsTrigger>
          </TabsList>

          {/* TAB: Laboratory */}
          <TabsContent value="lab" className="mt-0 space-y-4">
            <SimControl />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MarkovGraph />
              </div>
              <StatsPanel />
            </div>
            <ConvergenceChart />
          </TabsContent>

          {/* TAB: Build & Edit */}
          <TabsContent value="build" className="mt-0 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TransitionMatrix />
              <div className="space-y-4">
                <ChainEditor />
                <ShareTools />
                <div className="panel p-4">
                  <h3 className="micro mb-2.5">Editing protocol</h3>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-[#526a60]">
                    <li className="flex gap-2">
                      <span className="text-[#45e0a0]">01</span>
                      Each cell = probability of that transition (0–1). Rows are the “from” state.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#45e0a0]">02</span>
                      Hit <span className="text-[#45e0a0]">Normalize rows</span> to auto-fix rows that don&apos;t sum to 1.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#45e0a0]">03</span>
                      Add states up to 10; removing a state deletes its row & column.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#45e0a0]">04</span>
                      The graph, stationary distribution and charts update live as you type.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: Text Playground */}
          <TabsContent value="text" className="mt-0">
            <TextLab />
          </TabsContent>

          {/* TAB: Library */}
          <TabsContent value="library" className="mt-0">
            <ModelLibrary />
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#090d0c]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#3f544c] sm:px-6">
          <span>
            Markov Lab · custom force-directed engine · power-iteration math ·{" "}
            <a
              href="https://github.com/dryitfu-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#526a60] underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-[#45e0a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/60"
            >
              @dryitfu-code
            </a>
          </span>
          <span className="num normal-case tracking-normal">Σπ = 1.000 · everything else is optional</span>
        </div>
      </footer>
    </div>
  );
}
