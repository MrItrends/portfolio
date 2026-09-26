"use client";

import { useEffect, useState } from "react";
import styles from "./CursorFace.module.css";

/**
 * Opt-in face cursor. Off by default (recruiters get a normal pointer); a small
 * face avatar bottom-right toggles it on. When on, the pointer becomes a 56px
 * portrait that — if the mouse sits still — grows into a 240px card and bursts,
 * reappearing on the next move. The choice is remembered.
 */

const KEY = "face-cursor";

const BASE = 56;
const MAX = 240;
const R_BASE = 28;
const R_MAX = 24;
const GROW_START = 60_000;
const GROW_DURATION = 5 * 60_000;
const HOLD_BEFORE_BURST = 5 * 60_000;
const EXPLODE_AT = GROW_START + GROW_DURATION + HOLD_BEFORE_BURST;

export default function CursorFace() {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setReady(true);
    try {
      if (localStorage.getItem(KEY) === "on") setEnabled(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = document.createElement("div");
    el.className = styles.cursor;
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    document.documentElement.classList.add("faceCursorOn");

    let lastMove = performance.now();
    let phase: "active" | "exploding" | "gone" = "active";
    let raf = 0;
    let burstTimer = 0;

    const setSize = (s: number, r: number) => {
      el.style.setProperty("--size", `${s}px`);
      el.style.setProperty("--radius", `${r}px`);
    };
    setSize(BASE, R_BASE);

    const reset = () => {
      if (burstTimer) {
        clearTimeout(burstTimer);
        burstTimer = 0;
      }
      el.classList.remove(styles.explode);
      el.style.removeProperty("--boom");
      el.style.opacity = "1";
      el.style.visibility = "visible";
      el.style.filter = "";
      setSize(BASE, R_BASE);
      phase = "active";
    };

    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
      lastMove = performance.now();
      if (phase !== "active") reset();
      else if (el.style.visibility === "hidden") el.style.visibility = "visible";
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (reduce || phase !== "active") return;
      const idle = now - lastMove;
      if (idle < GROW_START) {
        setSize(BASE, R_BASE);
      } else if (idle < EXPLODE_AT) {
        const p = Math.min((idle - GROW_START) / GROW_DURATION, 1);
        setSize(BASE + (MAX - BASE) * p, R_BASE + (R_MAX - R_BASE) * p);
      } else {
        phase = "exploding";
        setSize(MAX, R_MAX);
        el.classList.add(styles.explode);
        burstTimer = window.setTimeout(() => {
          el.style.visibility = "hidden";
          phase = "gone";
        }, 650);
      }
    };
    raf = requestAnimationFrame(frame);

    const onLeave = () => {
      el.style.visibility = "hidden";
    };
    const onEnter = () => {
      if (phase === "active") el.style.visibility = "visible";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      if (burstTimer) clearTimeout(burstTimer);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("faceCursorOn");
      el.remove();
    };
  }, [enabled]);

  if (!ready) return null;

  return (
    <button
      type="button"
      className={`${styles.toggle} ${enabled ? styles.on : ""}`}
      aria-label={enabled ? "Turn off face cursor" : "Turn on face cursor"}
      aria-pressed={enabled}
      title={enabled ? "Face cursor: on" : "Face cursor: off"}
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        try {
          localStorage.setItem(KEY, next ? "on" : "off");
        } catch {}
      }}
    />
  );
}
