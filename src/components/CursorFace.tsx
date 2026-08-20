"use client";

import { useEffect } from "react";
import styles from "./CursorFace.module.css";

/**
 * Replaces the pointer with a small circular portrait of Joshua.
 *
 * Idle choreography (only when motion is allowed):
 *   • active      — 56px circle following the pointer.
 *   • after 1 min — begins growing, reaching 240px over the next 5 min; as it
 *                   grows the corners square off (radius 28px → 24px).
 *   • +5 min      — at full size it bursts and fades out.
 *   • gone        — hidden until the next pointer movement, which resets it.
 *
 * Tip: add "#cursor-fast" to the URL to watch the whole cycle ~20× faster.
 */

const BASE = 56;
const MAX = 240;
const R_BASE = 28; // 50% of BASE → a full circle
const R_MAX = 24; // at MAX → a rounded card

const GROW_START = 60_000; // 1 min idle before it starts to grow
const GROW_DURATION = 5 * 60_000; // grows to MAX over 5 min
const HOLD_BEFORE_BURST = 5 * 60_000; // 5 min at MAX, then it explodes
const EXPLODE_AT = GROW_START + GROW_DURATION + HOLD_BEFORE_BURST;

export default function CursorFace() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Optional fast demo mode — compresses the whole cycle for verification.
    const fast = window.location.hash.includes("cursor-fast");
    const k = fast ? 20 : 1;
    const growStart = GROW_START / k;
    const growDur = GROW_DURATION / k;
    const explodeAt = EXPLODE_AT / k;

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
      if (reduce || phase !== "active") return; // no idle growth/burst
      const idle = now - lastMove;
      if (idle < growStart) {
        setSize(BASE, R_BASE);
      } else if (idle < explodeAt) {
        const p = Math.min((idle - growStart) / growDur, 1);
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
  }, []);

  return null;
}
