import HeroCard from "./HeroCard";
import styles from "./Hero.module.css";

/**
 * Landing hero — a single oversized line of the brand phrase scrolling across
 * the centre (reference-style), framed by a clean, evenly-placed set of project
 * cards. Each card reveals its name + "View case study" on hover.
 */

const PHRASE = "Understanding before interface";

const CARDS = [
  { slug: "nomnom", title: "NomNom", image: "/images/thumbs/nomnom.webp", cls: styles.c1 },
  { slug: "spal", title: "SPAL", image: "/images/thumbs/spal.webp", cls: styles.c2 },
  { slug: "moodoo", title: "Moodoo", image: "/images/thumbs/moodoo.webp", cls: styles.c3 },
  { slug: "anybuy", title: "Anybuy", image: "/images/thumbs/anybuy.webp", cls: styles.c5 },
  { slug: "nedi", title: "NEDI", image: "/images/thumbs/nedi.webp", cls: styles.c6 },
];

export default function Hero() {
  return (
    <section className={styles.heroWrap}>
      <header className={styles.header}>
        <span className={styles.identity}>
          Joshua Jumbo
          <span className={styles.role}>Product Designer</span>
        </span>
        <a
          className={styles.contact}
          href="https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact me
        </a>
      </header>

      <div className={styles.stage}>
        <p className={styles.lede}>
          Product Designer with 6 years across edtech, fintech, healthtech and
          AI.
        </p>

        <div className={styles.center}>
          <h1 className={styles.marquee} aria-label={PHRASE}>
            <span className={styles.marqueeTrack} aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={styles.marqueeItem}>
                  {PHRASE}
                  <span className={styles.dot}>&bull;</span>
                </span>
              ))}
            </span>
          </h1>
        </div>

        <div className={styles.cards}>
          {CARDS.map((c) => (
            <HeroCard
              key={c.slug}
              slug={c.slug}
              title={c.title}
              image={c.image}
              className={c.cls}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
