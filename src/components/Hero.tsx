import styles from "./Hero.module.css";

/**
 * Landing hero — a single oversized line of the brand phrase scrolling across
 * the centre, with a refined collage of stickers and project stills floating
 * around it (reference-style). Header carries the nav + contact.
 */

const PHRASE = "Understanding before interface";

const RESUME_URL =
  "https://drive.google.com/file/d/1HiwxVZHbhg37MiNFBmEBiKmhSVLSZSCw/view?usp=sharing";

const DECOR = [
  { src: "/images/decor/decor-spal.png", cls: styles.d1 },
  { src: "/images/decor/decor-balloon.webp", cls: styles.d2 },
  { src: "/images/decor/decor-skfans.png", cls: styles.d3 },
  { src: "/images/decor/decor-figma.png", cls: styles.d4 },
  { src: "/images/decor/decor-face.png", cls: styles.d5 },
  { src: "/images/decor/decor-monster.png", cls: styles.d6 },
  { src: "/images/decor/decor-moodoo.png", cls: styles.d7 },
  { src: "/images/decor/decor-grass.webp", cls: styles.d8 },
];

export default function Hero() {
  return (
    <section className={styles.heroWrap}>
      <header className={styles.header}>
        <span className={styles.identity}>Joshua Jumbo</span>
        <nav className={styles.nav}>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </nav>
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
        <div className={styles.collage} aria-hidden="true">
          {DECOR.map((d) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={d.cls} src={d.src} alt="" className={`${styles.decor} ${d.cls}`} />
          ))}
        </div>

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
    </section>
  );
}
