"use client";

import { useEffect, useState } from "react";

type Graph = { ctx: AudioContext; analyser: AnalyserNode };
const graphs = new WeakMap<HTMLAudioElement, Graph>();

/**
 * Routes an <audio> element through an analyser so the avatar's mouth can follow
 * the real voice. Must be called from a user gesture (it resumes an AudioContext).
 * If the browser won't give us a running context we bail out *before* hooking
 * the element, so audio always still plays — just without lip-sync.
 */
export async function ensureLipSync(audio: HTMLAudioElement): Promise<void> {
  if (graphs.has(audio)) return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    await ctx.resume().catch(() => {});
    if (ctx.state !== "running") {
      void ctx.close();
      return;
    }
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const source = ctx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    graphs.set(audio, { ctx, analyser });
  } catch {
    // no lip-sync; playback unaffected
  }
}

/** True while the voice is loud enough to read as an open mouth. */
export function useMouthOpen(audio: HTMLAudioElement | null, playing: boolean): boolean {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!playing || !audio) return;
    const graph = graphs.get(audio);
    let raf = 0;
    let timer = 0;
    let last = false;
    const set = (v: boolean) => {
      if (v !== last) {
        last = v;
        setOpen(v);
      }
    };

    if (graph) {
      const buf = new Uint8Array(graph.analyser.fftSize);
      const tick = () => {
        graph.analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buf.length);
        // hysteresis so the mouth doesn't flutter on the threshold
        set(last ? rms > 0.035 : rms > 0.06);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } else {
      // No analyser available: a steady talking rhythm instead.
      timer = window.setInterval(() => set(!last), 190);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      setOpen(false);
    };
  }, [audio, playing]);

  return playing ? open : false;
}
