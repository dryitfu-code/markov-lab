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

/** Clay starburst mark — the asterisk-like radial glyph */
function Starburst({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
    </svg>
  );
}

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
      <header className="sticky top-0 z-40 border-b border-hairline bg-[#F0EEE6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <a href="#" className="flex items-center gap-2.5" aria-label="Markov Lab home">
            <Starburst className="h-[18px] w-[18px] text-clay" />
            <span className="font-serif text-[17px] font-semibold leading-none tracking-[-0.01em] text-ink">
              Markov Lab
            </span>
          </a>
          <span className="micro hidden md:inline">
            P(X<sub>t+1</sub> | X<sub>t</sub>) — the future depends only on the present
          </span>

          <div className="ml-auto flex items-center gap-2.5">
            {/* step readout */}
            <div className="well hidden h-8 items-center gap-2 px-2.5 sm:flex">
              <span className={`led ${running ? "" : "led-idle"}`} aria-hidden="true" />
              <span className="text-[11px] text-ink-3">
                step <span className="num font-medium text-ink">{String(totalSteps).padStart(4, "0")}</span>
              </span>
            </div>
            <a
              href="https://github.com/dryitfu-code"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-3 transition-colors duration-180 hover:bg-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
              aria-label="GitHub profile"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {/* Hero — editorial intro */}
        <section className="mb-7 border-b border-hairline pb-7 pt-4 sm:pt-6">
          <p className="eyebrow">Markov chain laboratory</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="font-serif text-[34px] font-medium leading-[1.1] tracking-[-0.012em] text-ink sm:text-[42px]">
              {emoji} {name}
              <span className="text-clay">.</span>
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-card px-3 py-1.5 text-[12px] text-ink-2">
              <span className="led" aria-hidden="true" />
              walker @ <span className="font-medium text-ink">{states[current] ?? "—"}</span>
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">{description}</p>
        </section>

        <Tabs defaultValue="lab" className="w-full">
          <ChainAudio />
          <TabsList className="mb-5 h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-hairline bg-[#E9E5DA] p-1 sm:w-auto">
            <TabsTrigger
              value="lab"
              className="shrink-0 gap-2 rounded-md px-4 py-2 text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_2px_rgba(25,25,25,0.10)]"
            >
              <FlaskConical className="h-4 w-4" /> Laboratory
            </TabsTrigger>
            <TabsTrigger
              value="build"
              className="shrink-0 gap-2 rounded-md px-4 py-2 text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_2px_rgba(25,25,25,0.10)]"
            >
              <Footprints className="h-4 w-4" /> Build &amp; Edit
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="shrink-0 gap-2 rounded-md px-4 py-2 text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_2px_rgba(25,25,25,0.10)]"
            >
              <BookOpen className="h-4 w-4" /> Text Playground
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="shrink-0 gap-2 rounded-md px-4 py-2 text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_2px_rgba(25,25,25,0.10)]"
            >
              <FolderOpen className="h-4 w-4" /> Library
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
                  <h3 className="eyebrow mb-3">Editing protocol</h3>
                  <ul className="space-y-2 text-[13px] leading-relaxed text-ink-2">
                    <li className="flex gap-3">
                      <span className="num shrink-0 text-clay-dark">01</span>
                      Each cell = probability of that transition (0–1). Rows are the “from” state.
                    </li>
                    <li className="flex gap-3">
                      <span className="num shrink-0 text-clay-dark">02</span>
                      Hit <span className="font-medium text-ink">Normalize rows</span> to auto-fix rows that don&apos;t sum to 1.
                    </li>
                    <li className="flex gap-3">
                      <span className="num shrink-0 text-clay-dark">03</span>
                      Add states up to 10; removing a state deletes its row &amp; column.
                    </li>
                    <li className="flex gap-3">
                      <span className="num shrink-0 text-clay-dark">04</span>
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

      {/* ── Footer — dark ink section ─────────────────────── */}
      <footer className="mt-auto bg-[#191919] text-[#A8A29A]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-7 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Starburst className="h-4 w-4 text-clay" />
            <span className="font-serif text-[15px] text-[#F0EEE6]">Markov Lab</span>
            <span className="hidden text-[12.5px] sm:inline">
              · custom force-directed engine · power-iteration math ·{" "}
              <a
                href="https://github.com/dryitfu-code"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#A8A29A]/40 underline-offset-4 transition-colors duration-180 hover:text-clay"
              >
                @dryitfu-code
              </a>
            </span>
          </div>
          <span className="num text-[11px] text-[#8F8F87]">Σπ = 1.000 · everything else is optional</span>
        </div>
      </footer>
    </div>
  );
}
