"use client";

import { useEffect, useState } from "react";
import styles from "./Intro.module.css";

/**
 * Opening sequence — not a loading state.
 * A deliberate counter (000 → 100) with a single progressive line that
 * dissolves into the homepage on the same canvas. See preloader brief.
 */

const STATEMENTS = [
  "Designing clarity from complexity",
  "Building products people understand",
  "Fintech • Healthtech • AI • SaaS",
  "Joshua Jumbo",
];

const COUNT_DURATION = 4200; // ms — within the 3–5s window
const HOLD = 700; // pause on the name once 100 is reached
const DISSOLVE = 650; // overlay fade / homepage reveal overlap

type Phase = "loading" | "revealing" | "done";

// Statement index from the current count: equal thirds, then the name at 100.
function statementFor(count: number) {
  if (count >= 100) return 3;
  return Math.min(2, Math.floor(count / 34));
}

// easeInOutQuad — slow, steady, slow. Reads as intentional, never mechanical.
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Intro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Show once per session — repeat navigation shouldn't replay the intro.
    // Synchronous to avoid a one-frame flash of the overlay for returning users.
    if (sessionStorage.getItem("intro-seen")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const pending: ReturnType<typeof setTimeout>[] = [];

    const finish = () => {
      sessionStorage.setItem("intro-seen", "1");
      setPhase("revealing");
      pending.push(setTimeout(() => setPhase("done"), DISSOLVE));
    };

    if (reduce) {
      // No counting — settle on the name, then reveal calmly.
      setCount(100);
      pending.push(setTimeout(finish, 900));
      return () => pending.forEach(clearTimeout);
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_DURATION);
      setCount(Math.round(ease(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        pending.push(setTimeout(finish, HOLD));
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      pending.forEach(clearTimeout);
    };
  }, []);

  // Lock scroll only while the counter is running.
  useEffect(() => {
    const locked = phase === "loading";
    document.documentElement.style.overflow = locked ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  const active = statementFor(count);

  return (
    <>
      <div
        className={`${styles.content} ${
          phase !== "loading" ? styles.revealed : ""
        }`}
      >
        {children}
      </div>

      {phase !== "done" && (
        <div
          className={`${styles.overlay} ${
            phase === "revealing" ? styles.exiting : ""
          }`}
          role="presentation"
          aria-hidden="true"
        >
          <div className={styles.inner}>
            <div className={styles.counter}>
              {String(count).padStart(3, "0")}
            </div>
            <div className={styles.captions}>
              {STATEMENTS.map((line, i) => (
                <span
                  key={line}
                  className={`${styles.statement} ${
                    i === active
                      ? styles.statementActive
                      : i < active
                        ? styles.statementBefore
                        : styles.statementAfter
                  }`}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
