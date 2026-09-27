import AboutStack from "./AboutStack";
import styles from "./About.module.css";

/**
 * About — a photo-pile "experience" up top (see AboutStack), then a short
 * positioning statement split across two columns so a recruiter can gauge
 * fit quickly: the headline on the left, the supporting detail + CTA right.
 */
export default function About() {
  return (
    <section id="about" className={styles.about} aria-label="About Joshua Jumbo">
      <p className={styles.kicker}>About</p>

      <AboutStack />

      <div className={styles.split}>
        <div className={styles.left}>
          <p className={styles.lead}>
            I&rsquo;m a product designer who starts with understanding &mdash;
            framing the real problem before touching an interface.
          </p>
        </div>

        <div className={styles.right}>
          <p className={styles.text}>
            Over the past six years I&rsquo;ve shaped web and mobile products
            across edtech, fintech, healthtech and AI &mdash; from a government
            education-data MVP presented to Nigeria&rsquo;s Vice President, to
            fintech tools for small businesses and healthcare platforms for New
            York clinics.
          </p>
          <p className={styles.text}>
            I care about clarity, systems thinking, and building products people
            genuinely understand and trust.
          </p>
          <p className={styles.availability}>
            Currently open to product design roles &mdash; full-time or
            freelance.
          </p>
          <a
            className={styles.cta}
            href="https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
