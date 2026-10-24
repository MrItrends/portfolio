import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import FadeImage from "./FadeImage";
import WorkCursor from "./WorkCursor";
import styles from "./SelectedWork.module.css";

/**
 * Work grid — real project mockups in a mixed-orientation grid (portrait phones
 * span one column, landscape laptops span two). Hovering a tile reveals the
 * title + category; coming-soon tiles are dimmed and not clickable. A "View"
 * pill (WorkCursor) follows the mouse while hovering a live tile.
 */
export default function SelectedWork() {
  const live = PROJECTS.filter((p) => !p.comingSoon).length;

  return (
    <section id="work" className={styles.work} aria-label="Selected work">
      <WorkCursor />
      <div className={styles.head} data-reveal="fade">
        <span className={styles.label}>Selected Work</span>
        <span className={styles.count}>{live} case studies</span>
      </div>

      <ul className={styles.grid}>
        {PROJECTS.map((p) => {
          const inner = (
            <div className={styles.media}>
              {p.image && (
                <FadeImage
                  src={p.image}
                  alt={p.title}
                  fill
                  quality={90}
                  sizes={
                    p.wide
                      ? "(max-width: 768px) 100vw, 50vw"
                      : "(max-width: 768px) 50vw, 25vw"
                  }
                  className={styles.img}
                />
              )}
              <div className={styles.overlay}>
                <span className={styles.title}>{p.title}</span>
                <span className={styles.category}>{p.category}</span>
              </div>
              {p.comingSoon && <span className={styles.soon}>Coming soon</span>}
            </div>
          );

          return (
            <li
              key={p.slug}
              data-reveal=""
              className={`${styles.item} ${p.wide ? styles.wide : ""} ${
                p.comingSoon ? styles.isSoon : ""
              }`}
            >
              {p.comingSoon ? (
                inner
              ) : (
                <Link href={`/work/${p.slug}`} className={styles.link}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
