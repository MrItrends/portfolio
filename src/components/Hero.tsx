"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/**
 * Scroll-driven hero. The monumental statement scales toward the top-left
 * lockup as you scroll, dissolving into the "Joshua Jumbo" wordmark.
 * Typography is the architecture, the transition, and the identity.
 */

const STATEMENT = ["Understanding", "before", "interface"];
const FINAL_SCALE = 0.14;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// Normalised 0→1 across a sub-range of the overall progress.
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);

export default function Hero() {
  const stage = useRef<HTMLElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // At rest the statement is vertically centered; it rises to the top anchor
    // as it shrinks. restLift depends only on viewport/type size — cache it and
    // recompute on resize so the scroll loop never forces a reflow.
    let restLift = 0;
    const measure = () => {
      const h1 = statement.current;
      if (!h1) return;
      const anchor = parseFloat(getComputedStyle(h1).top) || 0;
      restLift = Math.max(0, (window.innerHeight - h1.offsetHeight) / 2 - anchor);
    };

    let ticking = false;
    const apply = () => {
      ticking = false;
      const st = stage.current;
      const h1 = statement.current;
      const wm = wordmark.current;
      if (!st || !h1 || !wm) return;

      const rect = st.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

      const scale = 1 + (FINAL_SCALE - 1) * p;
      const lift = (1 - p) * restLift;
      h1.style.transform = `translateY(${lift}px) scale(${scale})`;
      h1.style.opacity = String(1 - range(p, 0.45, 0.7));

      const w = range(p, 0.55, 0.82);
      wm.style.opacity = String(w);
      wm.style.transform = `translateY(${(1 - w) * 10}px)`;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(apply);
        ticking = true;
      }
    };
    const onResize = () => {
      measure();
      apply();
    };

    measure();
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={stage} className={styles.stage}>
      <div className={styles.pin}>
        <h1 ref={statement} className={styles.statement}>
          {STATEMENT.map((line) => (
            <span key={line} className={styles.line}>
              {line}
            </span>
          ))}
        </h1>
        <div ref={wordmark} className={styles.wordmark}>
          Joshua Jumbo
        </div>
      </div>
    </section>
  );
}
