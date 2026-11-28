import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import FadeImage from "./FadeImage";
import styles from "./SelectedWork.module.css";

/**
 * Work grid — every tile is labelled (title, domain, one line on what it is and
 * what was done) without needing a hover, so it reads on a phone. Only finished
 * case studies are shown.
 */
export default function SelectedWork() {
  const live = PROJECTS.filter((p) => !p.comingSoon);

  return (
    <section id="work" className={styles.work} aria-label="Selected work">
      <div className={styles.head}>
        <h2 className={styles.label}>Selected work</h2>
        <span className={styles.count}>{live.length} case studies</span>
      </div>

      <ul className={styles.grid}>
        {live.map((p, i) => (
          <li
            key={p.slug}
            data-reveal={i < 3 ? undefined : ""}
            className={`${styles.item} ${p.wide ? styles.wide : ""}`}
          >
            <Link href={`/work/${p.slug}`} className={styles.link}>
              <div className={styles.media}>
                {p.image && (
                  <FadeImage
                    src={p.image}
                    alt={`${p.title} — ${p.category}`}
                    fill
                    quality={75}
                    priority={i < 3}
                    sizes={
                      p.wide
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 100vw, 25vw"
                    }
                    className={styles.img}
                  />
                )}
              </div>
              <div className={styles.caption}>
                <div className={styles.titleRow}>
                  <span className={styles.title}>{p.title}</span>
                  <span className={styles.category}>{p.category}</span>
                </div>
                {p.blurb && <p className={styles.blurb}>{p.blurb}</p>}
                <span className={styles.cta}>
                  Read case study <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
