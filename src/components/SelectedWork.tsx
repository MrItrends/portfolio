"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PROJECTS } from "@/lib/projects";
import styles from "./SelectedWork.module.css";

/**
 * Selected Work index — an editorial grid of case studies that reveal as they
 * enter the viewport. Curated, not loaded. Thumbnails are placeholders for now.
 */
export default function SelectedWork() {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = listRef.current?.querySelectorAll("li");
    if (!items) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add(styles.inView));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(styles.inView);
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  return (
    <section className={styles.work} aria-label="Selected work">
      <header className={styles.head}>
        <p className={styles.label}>Selected Work</p>
        <p className={styles.count}>{PROJECTS.length} case studies</p>
      </header>

      <ol ref={listRef} className={styles.grid}>
        {PROJECTS.map((p, i) => (
          <li
            key={p.slug}
            className={styles.item}
            style={{ "--col": i % 2 } as React.CSSProperties}
          >
            <Link href={`/work/${p.slug}`} className={styles.link}>
              <figure className={styles.thumb}>
                <span className={styles.thumbLabel}>{p.title}</span>
              </figure>
              <div className={styles.meta}>
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.title}>{p.title}</h3>
                <span className={styles.category}>{p.category}</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
