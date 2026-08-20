"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/**
 * Landing hero.
 *  1. "Understanding before interface" fills the first screen with a scroll cue.
 *  2. On scroll the statement shrinks and fades off while the intro ("6 years…")
 *     scrolls up over it — the two share the same space, so the reveal adds no
 *     empty band. The name + Contact header stays pinned throughout.
 */

const STATEMENT = ["Understanding", "before", "interface"];
const TAGLINE =
  "6 years designing web and mobile products across edtech, fintech, healthtech and AI";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function Hero() {
  const layer = useRef<HTMLDivElement>(null);
  const statement = useRef<HTMLHeadingElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const apply = () => {
      ticking = false;
      const lay = layer.current;
      const h1 = statement.current;
      const c = cue.current;
      if (!lay || !h1) return;

      const vh = window.innerHeight;
      // Progress across (most of) the first screen of scrolling.
      const p = clamp(window.scrollY / (vh * 0.9), 0, 1);

      h1.style.transform = `scale(${1 - 0.45 * p})`;
      h1.style.opacity = String(1 - clamp(p / 0.8, 0, 1));
      if (c) c.style.opacity = String(clamp(1 - p * 4, 0, 1) * 0.55);
      // Once faded, drop it out entirely so it can never overlay later content.
      lay.style.visibility = p >= 1 ? "hidden" : "visible";
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
    <div className={styles.heroWrap}>
      <header className={styles.header}>
        <span>Joshua Jumbo</span>
        <a
          className={styles.contact}
          href="https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact me
        </a>
      </header>

      <div ref={layer} className={styles.statementLayer}>
        <h1 ref={statement} className={styles.statement}>
          {STATEMENT.map((line) => (
            <span key={line} className={styles.line}>
              {line}
            </span>
          ))}
        </h1>
        <div ref={cue} className={styles.cue}>
          Scroll
        </div>
      </div>

      <div className={styles.spacer} aria-hidden="true" />

      <section className={styles.intro}>
        <p className={styles.tagline}>{TAGLINE}</p>
      </section>
    </div>
  );
}
