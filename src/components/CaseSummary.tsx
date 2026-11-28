import { CASE_SUMMARIES } from "@/lib/caseSummaries";
import styles from "./CaseStudy.module.css";

/** The 30-second read: problem, what I did, and the result — before any scrolling. */
export default function CaseSummary({ slug }: { slug: string }) {
  const s = CASE_SUMMARIES[slug];
  if (!s) return null;
  return (
    <section className={styles.summary} aria-label="Summary">
      <div className={styles.summaryItem}>
        <h2 className={styles.summaryLabel}>The problem</h2>
        <p>{s.problem}</p>
      </div>
      <div className={styles.summaryItem}>
        <h2 className={styles.summaryLabel}>What I did</h2>
        <p>{s.did}</p>
      </div>
      <div className={`${styles.summaryItem} ${styles.summaryResult}`}>
        <h2 className={styles.summaryLabel}>The result</h2>
        <p>{s.result}</p>
      </div>
    </section>
  );
}
