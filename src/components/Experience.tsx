import styles from "./Experience.module.css";

/**
 * Résumé-style experience list — year · company · role. Scannable for recruiters.
 */
const ROLES = [
  { year: "2026", company: "Idealoft Studio", role: "UI/UX Designer" },
  { year: "2025", company: "3MTT", role: "Product Designer" },
  { year: "2022", company: "Edukoya", role: "Product Designer" },
  { year: "2021", company: "AI Planet", role: "UI/UX Designer" },
];

export default function Experience() {
  return (
    <section className={styles.experience} aria-label="Experience">
      <ul className={styles.list}>
        {ROLES.map((r) => (
          <li key={r.year + r.company} className={styles.row}>
            <span className={styles.year}>{r.year}</span>
            <span className={styles.company}>{r.company}</span>
            <span className={styles.role}>{r.role}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
