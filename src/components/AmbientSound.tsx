"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AmbientSound.module.css";

/**
 * Ambient music. On each load one track is chosen at random (shuffle, avoiding
 * an immediate repeat). It attempts to autoplay the moment the page loads; if
 * the browser blocks audio (it does until a user gesture) it starts on the
 * first interaction instead. Click to mute / play; the choice is remembered.
 * When a track ends, another is shuffled in so music keeps going.
 */

const KEY = "ambient-sound";
const LAST = "ambient-track";
const VOLUME = 0.55;

// Add more tracks here over time.
const TRACKS = [
  "/audio/drink-the-water.mp3",
  "/audio/cinema.mp3",
  "/audio/i-am-malala.mp3",
];

// Pick a random index, avoiding `exclude` when possible.
function shuffleIndex(exclude: number) {
  if (TRACKS.length < 2) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * TRACKS.length);
  return i;
}

export default function AmbientSound() {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const fadeRef = useRef<number | null>(null);

  const fadeTo = (target: number, ms: number, onDone?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      audio.volume = from + (target - from) * t;
      if (t < 1) fadeRef.current = requestAnimationFrame(step);
      else onDone?.();
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const load = (index: number) => {
    const audio = audioRef.current!;
    indexRef.current = index;
    sessionStorage.setItem(LAST, String(index));
    audio.src = TRACKS[index];
  };

  const play = async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      return false;
    }
    fadeTo(VOLUME, 1500);
    setOn(true);
    localStorage.setItem(KEY, "on");
    return true;
  };

  const pause = () => {
    fadeTo(0, 600, () => audioRef.current?.pause());
    setOn(false);
    localStorage.setItem(KEY, "off");
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    // Shuffle a track for this load, avoiding the previous one.
    const prev = Number(sessionStorage.getItem(LAST) ?? "-1");
    load(shuffleIndex(prev));

    // When a track ends, shuffle in another so music keeps playing.
    const onEnded = () => {
      load(shuffleIndex(indexRef.current));
      audioRef.current!.volume = 0;
      audioRef.current!.play().then(() => fadeTo(VOLUME, 1500)).catch(() => {});
    };
    audio.addEventListener("ended", onEnded);

    let started = false;
    const cleanup = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
    const attempt = async () => {
      if (started) return;
      if (await play()) {
        started = true;
        cleanup();
      }
    };
    const onGesture = () => {
      if (localStorage.getItem(KEY) === "off") return cleanup();
      attempt();
    };

    if (localStorage.getItem(KEY) !== "off") {
      attempt(); // try immediately; usually blocked until a gesture
      window.addEventListener("pointerdown", onGesture);
      window.addEventListener("keydown", onGesture);
    }

    return () => {
      cleanup();
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polite: pause when the tab is hidden, resume when it returns.
  useEffect(() => {
    const onVis = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (on && localStorage.getItem(KEY) !== "off") audio.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [on]);

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={on ? "Mute music" : "Play music"}
      aria-pressed={on}
      onClick={() => (on ? pause() : play())}
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
