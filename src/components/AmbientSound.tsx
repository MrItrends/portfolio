"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AmbientSound.module.css";

/**
 * Ambient water wash, synthesized with the Web Audio API — no audio files.
 * Brown noise through two overlapping, slowly-swelling low-pass layers makes a
 * calm, non-repeating ocean sound, randomized each load. Defaults on, but only
 * starts once the browser allows audio (first gesture), and remembers OFF.
 */

const KEY = "ambient-sound";
const VOLUME = 0.12; // keep it a quiet background — adjust to taste
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const build = () => {
    if (ctxRef.current) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Brown noise (deepest, calmest), ~8s seamless loop.
    const len = ctx.sampleRate * 8;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // A wave layer: low-pass whose cutoff drifts, gain that swells like surf.
    const layer = (cut: number, swell: number, drift: number, level: number) => {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cut;
      lp.Q.value = 0.6;

      const driftLfo = ctx.createOscillator();
      driftLfo.type = "sine";
      driftLfo.frequency.value = 1 / drift;
      const driftAmt = ctx.createGain();
      driftAmt.gain.value = cut * 0.3;
      driftLfo.connect(driftAmt).connect(lp.frequency);
      driftLfo.start();

      const g = ctx.createGain();
      g.gain.value = level * 0.6;
      const swellLfo = ctx.createOscillator();
      swellLfo.type = "sine";
      swellLfo.frequency.value = 1 / swell;
      const swellAmt = ctx.createGain();
      swellAmt.gain.value = level * 0.4;
      swellLfo.connect(swellAmt).connect(g.gain);
      swellLfo.start();

      src.connect(lp).connect(g).connect(master);
    };

    // Two layers at incommensurate periods → never quite repeats.
    layer(rand(420, 640), rand(8, 12), rand(13, 19), 0.6);
    layer(rand(720, 1000), rand(6, 9), rand(10, 15), 0.4);

    src.start();
    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const fade = (to: number, seconds: number) => {
    const ctx = ctxRef.current;
    const m = masterRef.current;
    if (!ctx || !m) return;
    m.gain.cancelScheduledValues(ctx.currentTime);
    m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
    m.gain.linearRampToValueAtTime(to, ctx.currentTime + seconds);
  };

  const enable = async () => {
    build();
    try {
      await ctxRef.current!.resume();
    } catch {
      return false;
    }
    if (ctxRef.current!.state !== "running") return false;
    fade(VOLUME, 2);
    setOn(true);
    localStorage.setItem(KEY, "on");
    return true;
  };

  const disable = () => {
    fade(0, 0.8);
    setOn(false);
    localStorage.setItem(KEY, "off");
  };

  // Default on, but only start once audio is permitted (first gesture).
  useEffect(() => {
    if (localStorage.getItem(KEY) === "off") return;

    let started = false;
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    const attempt = async () => {
      if (started) return;
      if (await enable()) {
        started = true;
        cleanup();
      }
    };
    const onGesture = () => {
      if (localStorage.getItem(KEY) === "off") return cleanup();
      attempt();
    };

    attempt(); // try immediately; usually blocked until a gesture
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polite: pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (document.hidden) {
        if (ctx.state === "running") ctx.suspend();
      } else if (on && localStorage.getItem(KEY) !== "off") {
        ctx.resume();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [on]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={on ? "Mute ambient sound" : "Play ambient sound"}
      aria-pressed={on}
      onClick={() => (on ? disable() : enable())}
    >
      <span className={`${styles.bars} ${on ? styles.playing : ""}`} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}
