"use client";

import { useRef } from "react";
import { useMarkov } from "@/lib/markov/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Link2, Music4 } from "lucide-react";
import { toast } from "sonner";

function encodeSharePayload(payload: object): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeSharePayload(hash: string): {
  name: string;
  description: string;
  states: string[];
  matrix: number[][];
} | null {
  try {
    const raw = JSON.parse(decodeURIComponent(escape(atob(hash))));
    if (
      typeof raw?.n === "string" &&
      Array.isArray(raw?.s) &&
      Array.isArray(raw?.m) &&
      raw.s.length >= 2 &&
      raw.s.length <= 10 &&
      raw.m.length === raw.s.length &&
      raw.m.every((r: unknown[]) => Array.isArray(r) && r.length === raw.s.length)
    ) {
      return {
        name: raw.n,
        description: typeof raw.d === "string" ? raw.d : "",
        states: raw.s.map(String),
        matrix: raw.m as number[][],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function ShareTools() {
  const { name, description, states, matrix, importChain } = useMarkov();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const data = { name, description, states, matrix, _format: "markov-lab/chain@1" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chain exported as JSON");
  };

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      const sName = typeof raw?.name === "string" ? raw.name : "Imported chain";
      const sDesc = typeof raw?.description === "string" ? raw.description : "";
      if (
        !Array.isArray(raw?.states) ||
        !Array.isArray(raw?.matrix) ||
        raw.states.length < 2 ||
        raw.states.length > 10 ||
        raw.matrix.length !== raw.states.length
      ) {
        throw new Error("bad shape");
      }
      importChain({
        name: sName,
        description: sDesc,
        states: raw.states.map(String),
        matrix: raw.matrix,
      });
      toast.success(`Imported “${sName}”`);
    } catch {
      toast.error("Invalid chain JSON — expected { name, states[], matrix[][] }");
    }
  };

  const copyShareLink = async () => {
    const hash = encodeSharePayload({ n: name, d: description, s: states, m: matrix });
    if (hash.length > 6000) {
      toast.error("Chain too large for a share link — export JSON instead");
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}#c=${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.info("Clipboard blocked — link placed in the URL bar");
      window.location.hash = `c=${hash}`;
    }
  };

  return (
    <Card className="gap-0 p-4">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="eyebrow flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-clay" /> Share &amp; export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-0">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportJson}
            className="h-9 gap-1.5 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-9 gap-1.5 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink"
          >
            <Upload className="h-3.5 w-3.5" /> Import JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={copyShareLink}
            className="h-9 gap-1.5 rounded-md border-hairline-strong bg-transparent px-3 text-[12.5px] font-medium text-ink-2 hover:bg-accent hover:text-ink"
          >
            <Link2 className="h-3.5 w-3.5" /> Copy share link
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        <div className="flex items-start gap-2.5 rounded-md border border-hairline bg-[#F0EEE6] p-3 text-[12.5px] leading-relaxed text-ink-2">
          <Music4 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-dark" />
          <span>
            Tip: enable the <span className="font-medium text-ink">sound toggle</span> in
            the Laboratory and run the walk — every state is a note, and the Melody Walker preset
            plays real solfège.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
