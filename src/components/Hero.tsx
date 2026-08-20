"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/**
 * Scroll-driven hero, two beats:
 *  1. the monumental statement scales into the "Joshua Jumbo" wordmark;
 *  2. immediately after, a large tagline rises up from behind the reel to fill
 *     the whitespace the statement vacated.
 * The reel stays anchored throughout — typography moves, the work is constant.
 */

const STATEMENT = ["Understanding", "before", "interface"];
const TAGLINE =
  "6 years designing web and mobile products across edtech, fintech, healthtech and AI";
const FINAL_SCALE = 0.14;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// Normalised 0→1 across a sub-range of the overall progress.
const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Hero() {
  const stage = useRef<HTMLElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const tagline = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const apply = () => {
      ticking = false;
      const st = stage.current;
      const h1 = statement.current;
      const wm = wordmark.current;
      const tag = tagline.current;
      if (!st || !h1 || !wm || !tag) return;

      const rect = st.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;

      // Beat 1 — statement recedes into the lockup, wordmark resolves in.
      h1.style.transform = `scale(${1 + (FINAL_SCALE - 1) * range(p, 0, 0.42)})`;
      h1.style.opacity = String(1 - range(p, 0.28, 0.42));

      const w = range(p, 0.34, 0.5);
      wm.style.opacity = String(w);
      wm.style.transform = `translateY(${(1 - w) * 10}px)`;
      // Only clickable once the name has resolved in — keeps the invisible
      // early pill from swallowing clicks over the statement.
      wm.style.pointerEvents = w > 0.6 ? "auto" : "none";

      // Beat 2 — tagline fades and rises into the whitespace the statement left.
      const t = easeOut(range(p, 0.5, 0.92));
      tag.style.transform = `translateY(${(1 - t) * 130}%)`;
      tag.style.opacity = String(range(p, 0.5, 0.62));
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(apply);
        ticking = true;
      }
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
          <span className={styles.wordmarkName}>Joshua Jumbo</span>
          <a
            className={styles.contact}
            href="https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact me
          </a>
        </div>

        <p ref={tagline} className={styles.tagline}>
          {TAGLINE}
        </p>
      </div>
    </section>
  );
}
