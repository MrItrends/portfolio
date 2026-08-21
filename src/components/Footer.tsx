import styles from "./Footer.module.css";

/**
 * Site footer — copyright on the left, external identity links on the right.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© Copyright 2026</span>
      <nav className={styles.links}>
        <a
          className={styles.link}
          href="https://www.linkedin.com/in/joshuajumbo91/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a
          className={styles.link}
          href="https://drive.google.com/file/d/1HiwxVZHbhg37MiNFBmEBiKmhSVLSZSCw/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume
        </a>
      </nav>
    </footer>
  );
}
