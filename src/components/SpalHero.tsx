"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./CaseStudy.module.css";

/**
 * SPAL hero — the static poster shows first, then swaps to the reel after 30s.
 */
export default function SpalHero() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <figure className={styles.heroWide}>
      {showVideo ? (
        <video className={styles.heroVideo} autoPlay muted loop playsInline>
          <source src="/images/SPAL.webm" type="video/webm" />
        </video>
      ) : (
        <Image
          src="/images/spal-hero.webp"
          alt="SPAL — business intelligence for small businesses"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1200px"
          className={styles.heroImg}
        />
      )}
    </figure>
  );
}
