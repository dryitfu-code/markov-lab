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
      <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="micro">Preset models</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2.5 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {PRESET_CHAINS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p.id)}
              className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b110f] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#45e0a0]/40 hover:shadow-[0_8px_32px_rgba(69,224,160,0.1)] focus-visible:-translate-y-0.5 focus-visible:border-[#45e0a0]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/50"
              aria-label={`Load preset ${p.name}`}
            >
              {/* corner glow on hover */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#45e0a0]/0 blur-2xl transition-all group-hover:bg-[#45e0a0]/15" />
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xl" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="micro rounded border border-white/[0.08] px-1.5 py-0.5 text-[9px]">
                  {p.category}
                </span>
              </div>
              <div className="text-sm font-semibold tracking-tight text-[#e7f2ec] transition-colors group-hover:text-[#45e0a0]">
                {p.name}
              </div>
              <div className="mt-1 line-clamp-2 font-mono text-[10px] leading-relaxed text-[#526a60]">
                {p.description}
              </div>
              <div className="num mt-2.5 flex items-center gap-1.5 text-[10px] text-[#526a60]">
                <span className="h-1 w-1 rounded-full bg-[#45e0a0]/60" />
                {p.states.length} states
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="gap-0 border-white/[0.07] bg-[#0e1413] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <CardHeader className="px-0 pb-3">
          <CardTitle className="micro flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5 text-[#45e0a0]" /> Saved chains
            <span className="micro rounded border border-white/[0.08] px-1.5 py-0.5 text-[9px]">
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
              className="h-9 rounded-lg border-white/[0.07] bg-[#0b110f] font-mono text-xs text-[#cfe5db] transition-colors duration-200 focus:border-[#45e0a0]/60 sm:max-w-52"
            />
            <Input
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              placeholder="Description…"
              className="h-9 flex-1 rounded-lg border-white/[0.07] bg-[#0b110f] font-mono text-xs text-[#cfe5db] transition-colors duration-200 focus:border-[#45e0a0]/60"
            />
            <Button
              size="sm"
              onClick={save}
              className="h-9 gap-1.5 rounded-lg bg-[#45e0a0] font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#07130e] shadow-[0_0_20px_rgba(69,224,160,0.25)] duration-200 hover:bg-[#6ae8bc]"
            >
              {chainId ? <Download className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              Save current
            </Button>
          </div>

          {loading ? (
            <p className="micro py-10 text-center normal-case tracking-normal">loading…</p>
          ) : saved.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-white/[0.09] bg-[#0b110f]/60 px-4 py-10 text-center">
              <FolderOpen className="h-5 w-5 text-[#526a60]" aria-hidden="true" />
              <p className="micro normal-case tracking-normal">
                Nothing saved yet — tweak a chain and hit “Save current”.
              </p>
            </div>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-start justify-between gap-2 rounded-lg border border-white/[0.07] bg-[#0b110f] p-2.5 transition-all duration-200 hover:border-[#45e0a0]/30"
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
                    className="min-w-0 flex-1 rounded-md text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/50"
                    aria-label={`Load chain ${c.name}`}
                  >
                    <div className="truncate font-mono text-xs font-semibold text-[#cfe5db] transition-colors group-hover:text-[#45e0a0] group-focus-visible:text-[#45e0a0]">
                      {c.name}
                    </div>
                    <div className="num mt-0.5 text-[10px] text-[#526a60]">
                      {c.states.length} states · {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#526a60] opacity-0 transition-all duration-200 hover:bg-[rgba(255,107,107,0.08)] hover:text-[#ff6b6b] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45e0a0]/60 group-hover:opacity-100"
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
