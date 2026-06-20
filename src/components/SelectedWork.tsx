"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SelectedWork.module.css";

/**
 * Selected Work emerges only after the hero lockup settles — curated, not
 * loaded. Minimal for now: the section label and the first real entry.
 */
export default function SelectedWork() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`${styles.work} ${revealed ? styles.revealed : ""}`}
      aria-label="Selected work"
    >
      <p className={styles.label}>Selected Work</p>

      <ul className={styles.list}>
        <li className={styles.row}>
          <span className={styles.index}>01</span>
          <h2 className={styles.title}>SPAL</h2>
          <span className={styles.desc}>
            Turning information into understanding
          </span>
        </li>
      </ul>
    </section>
  );
}
