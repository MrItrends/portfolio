"use client";

import { useEffect, useState } from "react";
import styles from "./Intro.module.css";

/**
 * Opening sequence, modelled on studio-wilhelm.com's preloader:
 * a bottom line in a 3-line masked stack counts 000% → 100% while a bar
 * grows from the bottom edge; at 100% the percent line exits and the two
 * name lines above it reveal in its place; after a hold, everything recedes
 * into the homepage underneath.
 */

const NAME = ["Joshua", "Jumbo"];
const YEAR = new Date().getFullYear();

const COUNT_DURATION = 2200; // ms — the 000→100 count
const NAME_STAGGER = 100; // ms between the two name lines revealing
const HOLD = 600; // ms holding on the full name before exit
const DISSOLVE = 650; // ms overlay/bar exit, overlapping the homepage reveal

type Phase = "loading" | "revealing" | "done";
type Stage = "count" | "name";

// easeInOutQuad — slow, steady, slow. Reads as intentional, never mechanical.
function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Intro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [stage, setStage] = useState<Stage>("count");
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
      setStage("name");
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
        setStage("name");
        pending.push(
          setTimeout(finish, NAME_STAGGER * NAME.length + HOLD)
        );
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

  const counting = stage === "count";

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
          <div
            className={`${styles.bar} ${
              phase !== "loading" ? styles.barRecede : ""
            }`}
            style={{ height: phase === "loading" ? `${count * 0.14}vh` : "0vh" }}
          />

          <div className={styles.stack}>
            {NAME.map((line, i) => (
              <div className={styles.mask} key={line}>
                <span
                  className={`${styles.text} ${!counting ? styles.textIn : ""}`}
                  style={{ transitionDelay: !counting ? `${i * NAME_STAGGER}ms` : "0ms" }}
                >
                  {line}
                </span>
              </div>
            ))}
            <div className={styles.mask}>
              <span
                className={`${styles.text} ${styles.percentLine} ${
                  counting ? styles.textIn : styles.textOut
                }`}
              >
                {String(count).padStart(3, "0")}
                <em className={styles.percentSign}>%</em>
              </span>
            </div>
          </div>

          <span className={styles.brand}>Joshua Jumbo</span>
          <span className={styles.copyright}>
            <em>&copy;</em> {YEAR}
          </span>
        </div>
      )}
    </>
  );
}
