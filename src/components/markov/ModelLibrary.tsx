"use client";

import { useEffect, useState, useCallback } from "react";
import { useMarkov } from "@/lib/markov/store";
import { PRESET_CHAINS } from "@/lib/markov/presets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      toast.success("Chain saved to the library 💾");
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
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preset models</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_CHAINS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-600/50 hover:bg-zinc-900/80"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xl">{p.emoji}</span>
                <Badge variant="outline" className="border-zinc-700 text-[9px] text-zinc-500">
                  {p.category}
                </Badge>
              </div>
              <div className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-300">
                {p.name}
              </div>
              <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-500">
                {p.description}
              </div>
              <div className="mt-2 text-[10px] font-mono text-zinc-600">{p.states.length} states</div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4 text-violet-400" /> Your saved chains
            <Badge variant="outline" className="border-zinc-700 text-[10px] text-zinc-500">
              SQLite-persisted
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={meta.name}
              onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))}
              placeholder="Chain name"
              className="h-9 border-zinc-800 bg-zinc-900/40 text-xs sm:max-w-52"
            />
            <Input
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              placeholder="Description…"
              className="h-9 flex-1 border-zinc-800 bg-zinc-900/40 text-xs"
            />
            <Button
              size="sm"
              onClick={save}
              className="h-9 gap-1.5 bg-violet-600 text-xs text-white hover:bg-violet-500"
            >
              {chainId ? <Download className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              Save current
            </Button>
          </div>

          {loading ? (
            <p className="py-4 text-center text-xs text-zinc-600">loading…</p>
          ) : saved.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-800 py-6 text-center text-xs text-zinc-600">
              Nothing saved yet — tweak a chain and hit “Save current”.
            </p>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-start justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5"
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
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-xs font-semibold text-zinc-200 group-hover:text-violet-300">
                      {c.name}
                    </div>
                    <div className="truncate text-[10px] text-zinc-600">
                      {c.states.length} states · {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded p-1 text-zinc-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
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
