"use client";

import { useEffect, useRef } from "react";
import { useMarkov } from "@/lib/markov/store";
import { noteForState, playTone } from "@/lib/markov/audio";

/**
 * Invisible component: listens for walker transitions and plays
 * the corresponding note when sound is enabled.
 */
export default function ChainAudio() {
  const enabledRef = useRef(false);

  useEffect(() => {
    const unsub = useMarkov.subscribe((s, prev) => {
      enabledRef.current = s.soundOn;
      if (s.soundOn && s.current !== prev.current) {
        playTone(noteForState(s.states[s.current] ?? "", s.current));
      }
    });
    return unsub;
  }, []);

  return null;
}
