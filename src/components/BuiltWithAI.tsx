import { BUILDS } from "@/lib/builds";
import styles from "./BuiltWithAI.module.css";

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/**
 * Live products built with AI — proof that ideas get shipped, not just designed.
 * Every row opens the real product.
 */
export default function BuiltWithAI() {
  return (
    <section id="built" className={styles.section} aria-label="Built with AI">
      <div className={styles.head}>
        <h2 className={styles.label}>Built with AI</h2>
        <span className={styles.count}>{BUILDS.length} products</span>
      </div>
      <p className={styles.lede}>
        Beyond design files &mdash; products I&rsquo;ve built using AI. None
        were promoted; usage is word of mouth.
      </p>

      <ul className={styles.list}>
        {BUILDS.map((b) => (
          <li key={b.url}>
            <a
              className={styles.row}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.top}>
                <span className={styles.name}>{b.name}</span>
                {b.stat && <span className={styles.stat}>{b.stat}</span>}
              </span>
              <span className={styles.arrow} aria-hidden="true">
                &#8599;
              </span>
              <span className={styles.blurb}>{b.blurb}</span>
              <span className={styles.host}>{host(b.url)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
