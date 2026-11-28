import { SITE, mailto } from "@/lib/site";
import styles from "./Footer.module.css";

/**
 * Site footer — a last, obvious next step for anyone who scrolled this far.
 */
export default function Footer() {
  const email = mailto();
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>&copy; {new Date().getFullYear()} {SITE.name}</span>
      <nav className={styles.links} aria-label="Contact">
        <a className={styles.link} href={SITE.bookUrl} target="_blank" rel="noopener noreferrer">
          Book a call
        </a>
        {email && (
          <a className={styles.link} href={email}>
            Email
          </a>
        )}
        <a className={styles.link} href={SITE.linkedinUrl} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a className={styles.link} href={SITE.resumeUrl} target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </nav>
    </footer>
  );
}
