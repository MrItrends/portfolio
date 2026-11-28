import Link from "next/link";
import { PROJECTS } from "@/lib/projects";
import { SITE, mailto } from "@/lib/site";
import styles from "./CaseStudy.module.css";

/** End of a case study: the next project, and an obvious way to get in touch. */
export default function CaseFooter({ slug }: { slug: string }) {
  const live = PROJECTS.filter((p) => !p.comingSoon);
  const i = live.findIndex((p) => p.slug === slug);
  const next = live[(i + 1) % live.length];
  const email = mailto();

  return (
    <footer className={styles.caseFooter}>
      <Link href={`/work/${next.slug}`} className={styles.next}>
        <span className={styles.nextLabel}>Next project</span>
        <span className={styles.nextTitle}>
          {next.title} <span aria-hidden="true">&rarr;</span>
        </span>
        {next.blurb && <span className={styles.nextBlurb}>{next.blurb}</span>}
      </Link>

      <div className={styles.cta}>
        <p className={styles.ctaLine}>
          Open to product design roles &mdash; full-time or freelance.
        </p>
        <div className={styles.ctaActions}>
          <a className={styles.ctaPrimary} href={SITE.bookUrl} target="_blank" rel="noopener noreferrer">
            Book a call
          </a>
          {email && (
            <a className={styles.ctaSecondary} href={email}>
              Email me
            </a>
          )}
          <a className={styles.ctaSecondary} href={SITE.resumeUrl} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
          <Link className={styles.ctaSecondary} href="/#work">
            All work
          </Link>
        </div>
      </div>
    </footer>
  );
}
