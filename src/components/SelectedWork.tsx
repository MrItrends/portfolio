import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import styles from "./SelectedWork.module.css";

/**
 * Work grid — real project mockups in a mixed-orientation grid (portrait phones
 * span one column, landscape laptops span two). Hovering a tile reveals the
 * title + category; coming-soon tiles are dimmed and not clickable.
 */
export default function SelectedWork() {
  const live = PROJECTS.filter((p) => !p.comingSoon).length;

  return (
    <section id="work" className={styles.work} aria-label="Selected work">
      <div className={styles.head}>
        <span className={styles.label}>Selected Work</span>
        <span className={styles.count}>{live} case studies</span>
      </div>

      <ul className={styles.grid}>
        {PROJECTS.map((p) => {
          const inner = (
            <div className={styles.media}>
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
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
