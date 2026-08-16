import SwapMedia from "./SwapMedia";
import styles from "./CaseStudy.module.css";

/**
 * SPAL hero — the static poster shows first, then swaps to the reel after 10s.
 */
export default function SpalHero() {
  return (
    <figure className={styles.heroWide}>
      <SwapMedia
        poster="/images/spal-hero.webp"
        video="/images/SPAL.webm"
        alt="SPAL — business intelligence for small businesses"
        delay={10000}
        priority
        sizes="(max-width: 1024px) 100vw, 1200px"
        imgClass={styles.heroImg}
        videoClass={styles.heroVideo}
      />
    </figure>
  );
}
