"use client";

import { useEffect, useState, useCallback } from "react";
import { useMarkov } from "@/lib/markov/store";
import { PRESET_CHAINS } from "@/lib/markov/presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Download, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface SavedChain {
  id: string;
  name: string;
  description: string;
  category: string;
  states: string[];
  matrix: number[][];
  updatedAt: string;
}

export function ModelLibrary() {
  const { loadPreset, loadFromDb, name, description, states, matrix, chainId } = useMarkov();
  const [saved, setSaved] = useState<SavedChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ name: "", description: "" });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/chains");
      if (res.ok) setSaved(await res.json());
    } catch {
      /* offline is fine */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setMeta({ name: `${name} (remix)`, description });
  }, [name, description]);

  const save = async () => {
    if (!meta.name.trim()) return;
    const payload = {
      name: meta.name.trim(),
      description: meta.description,
      category: "custom",
      states,
      matrix,
    };
    const res = await fetch("/api/chains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Chain saved to the library");
      refresh();
    } else {
      toast.error("Could not save — check matrix validity");
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/chains/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Chain deleted");
      refresh();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="gap-0 p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="eyebrow">Preset models</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_CHAINS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className="group rounded-lg border border-hairline bg-white p-3.5 text-left transition-colors duration-150 hover:border-hairline-strong hover:shadow-[0_2px_8px_rgba(25,25,25,0.06)] focus-visible:border-clay/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
              aria-label={`Load preset ${p.name}`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xl" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="rounded border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
                  {p.category}
                </span>
              </div>
              <div className="font-serif text-[15px] font-semibold leading-snug tracking-[-0.005em] text-ink transition-colors group-hover:text-clay-dark">
                {p.name}
              </div>
              <div className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-3">
                {p.description}
              </div>
              <div className="num mt-2.5 flex items-center gap-1.5 text-[10px] text-ink-3">
                <span className="h-1 w-1 rounded-full bg-clay/70" />
                {p.states.length} states
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-0 p-4">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="eyebrow flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5 text-clay" /> Saved chains
            <span className="rounded border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-ink-3">
              SQLite
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-0">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={meta.name}
              onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
              placeholder="Chain name"
              className="h-9 rounded-md border-hairline bg-white text-[13px] text-ink transition-colors duration-150 focus:border-clay/60 sm:max-w-52"
            />
            <Input
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              placeholder="Description…"
              className="h-9 flex-1 rounded-md border-hairline bg-white text-[13px] text-ink transition-colors duration-150 focus:border-clay/60"
            />
            <Button
              size="sm"
              onClick={save}
              className="h-9 gap-1.5 rounded-md px-4 text-[13px] font-medium"
            >
              {chainId ? <Download className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              Save current
            </Button>
          </div>

          {loading ? (
            <p className="micro py-10 text-center">loading…</p>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-hairline-strong bg-white/60 px-4 py-10 text-center">
              <FolderOpen className="h-5 w-5 text-ink-3" aria-hidden="true" />
              <p className="micro">
                Nothing saved yet — tweak a chain and hit “Save current”.
              </p>
            </div>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-start justify-between gap-2 rounded-lg border border-hairline bg-white transition-colors duration-150 hover:border-hairline-strong"
                >
                  <button
                    onClick={() =>
                      loadFromDb({
                        id: c.id,
                        name: c.name,
                        description: c.description,
                        category: c.category,
                        states: c.states,
                        matrix: c.matrix,
                      })
                    }
                    className="min-w-0 flex-1 rounded-md p-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
                    aria-label={`Load chain ${c.name}`}
                  >
                    <div className="truncate font-serif text-[14px] font-semibold text-ink transition-colors group-hover:text-clay-dark group-focus-visible:text-clay-dark">
                      {c.name}
                    </div>
                    <div className="num mt-0.5 text-[10px] text-ink-3">
                      {c.states.length} states · {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="mr-1.5 mt-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 opacity-0 transition-all duration-150 hover:bg-[#A3402A]/10 hover:text-[#A3402A] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 group-hover:opacity-100"
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
