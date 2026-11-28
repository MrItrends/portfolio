import { SITE, mailto } from "@/lib/site";
import styles from "./Hero.module.css";

/**
 * Landing hero — built for a 10-second read. Who (name), what (role + domains),
 * proof (years, a national-scale project, current role), availability, and the
 * next step. Plain server-rendered content: never hidden behind an animation.
 */
export default function Hero() {
  const email = mailto();

  return (
    <section className={styles.heroWrap} aria-label="Introduction">
      <header className={styles.header}>
        <span className={styles.identity}>{SITE.name}</span>
        <nav className={styles.nav} aria-label="Primary">
          <a href="#work">Work</a>
          <a href="#built">Built with AI</a>
          <a href="#about">About</a>
          <a href={SITE.resumeUrl} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </nav>
        <a
          className={styles.contact}
          href={SITE.bookUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Book a call
        </a>
      </header>

      <div className={styles.body}>
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          Open to product design roles &middot; full-time or freelance
        </p>

        <h1 className={styles.headline}>
          Product designer for fintech, edtech, healthtech and AI products.
        </h1>

        <p className={styles.sub}>
          Six years shaping web and mobile products &mdash; from a national
          education-data platform presented to Nigeria&rsquo;s Vice President to
          an AI sales app tried by 80+ people. Currently UI/UX Designer
          at Idealoft Studio.
        </p>

        <div className={styles.actions}>
          <a className={styles.primary} href="#work">
            See selected work
          </a>
          <a
            className={styles.secondary}
            href={SITE.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </a>
          {email && (
            <a className={styles.secondary} href={email}>
              Email me
            </a>
          )}
          <a
            className={styles.secondary}
            href={SITE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>

        <ul className={styles.facts} aria-label="At a glance">
          <li>
            <strong>6 yrs</strong>
            <span>product design</span>
          </li>
          <li>
            <strong>8</strong>
            <span>case studies</span>
          </li>
          <li>
            <strong>4</strong>
            <span>industries</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
