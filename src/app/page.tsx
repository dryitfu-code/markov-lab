"use client";

import { useMarkov } from "@/lib/markov/store";
import MarkovGraph from "@/components/markov/MarkovGraph";
import { TransitionMatrix, ChainEditor } from "@/components/markov/ChainEditors";
import { SimControl } from "@/components/markov/SimControl";
import { StatsPanel, ConvergenceChart } from "@/components/markov/Analytics";
import { ModelLibrary } from "@/components/markov/ModelLibrary";
import { TextLab } from "@/components/markov/TextLab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Github, Atom, Footprints, BookOpen, FlaskConical } from "lucide-react";

export default function Home() {
  const { name, emoji, description, states, current, totalSteps } = useMarkov();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-violet-600 shadow-lg shadow-violet-900/30">
            <Atom className="h-5 w-5 text-zinc-950" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold tracking-tight sm:text-base">
              MARKOV LAB
              <span className="ml-2 hidden font-mono text-[10px] font-normal text-zinc-500 sm:inline">
                P(Xₜ₊₁ | Xₜ) — the future depends only on the present
              </span>
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-emerald-800/60 bg-emerald-950/40 font-mono text-[10px] text-emerald-400 sm:inline-flex"
            >
              step {totalSteps}
            </Badge>
            <a
              href="https://github.com/dryitfu-code"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
              aria-label="GitHub profile"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Hero strip */}
        <section className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="text-lg font-bold tracking-tight sm:text-xl">{name}</h2>
              <span className="font-mono text-xs text-emerald-400">
                walker @ {states[current] ?? "—"}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 max-w-3xl text-xs leading-relaxed text-zinc-500">
              {description}
            </p>
          </div>
        </section>

        <Tabs defaultValue="lab" className="w-full">
          <TabsList className="mb-4 h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 sm:w-auto">
            <TabsTrigger
              value="lab"
              className="gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-zinc-950"
            >
              <FlaskConical className="h-3.5 w-3.5" /> Laboratory
            </TabsTrigger>
            <TabsTrigger
              value="build"
              className="gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-zinc-950"
            >
              <Footprints className="h-3.5 w-3.5" /> Build & Edit
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-zinc-950"
            >
              <BookOpen className="h-3.5 w-3.5" /> Text Playground
            </TabsTrigger>
            <TabsTrigger
              value="library"
              className="gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-zinc-950"
            >
              Library
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
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-zinc-200">Editing guide</h3>
                  <ul className="space-y-1.5 text-xs leading-relaxed text-zinc-500">
                    <li>
                      • Each cell = probability of that transition (0–1). Rows are the “from” state.
                    </li>
                    <li>• Hit <span className="text-emerald-400">Normalize rows</span> to auto-fix rows that don&apos;t sum to 1.</li>
                    <li>• Add states up to 10; removing a state deletes its row & column.</li>
                    <li>• The graph, stationary distribution and charts update live as you type.</li>
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

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[11px] text-zinc-600 sm:px-6">
          <span>
            Markov Lab — custom force-directed engine · power-iteration math · Next.js 16 · made for{" "}
            <a
              href="https://github.com/dryitfu-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 hover:text-emerald-400"
            >
              @dryitfu-code
            </a>
          </span>
          <span className="font-mono">Σπ=1.000 · everything else is optional</span>
        </div>
      </footer>
    </div>
  );
}
