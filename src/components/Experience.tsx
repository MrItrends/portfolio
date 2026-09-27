import styles from "./Experience.module.css";

/**
 * Résumé-style experience — jobs on the left, Tools and Languages spread out
 * as their own columns across the rest of the row (studio-wilhelm.com's
 * about-page pattern: three separate columns, not a bunched side stack).
 */
const ROLES = [
  { year: "2026", company: "Idealoft Studio", role: "UI/UX Designer" },
  { year: "2025", company: "3MTT", role: "Product Designer" },
  { year: "2022", company: "Edukoya", role: "Product Designer" },
  { year: "2021", company: "AI Planet", role: "UI/UX Designer" },
];

const TOOLS = ["Figma", "Claude"];
const LANGUAGES = ["English"];

export default function Experience() {
  return (
    <section className={styles.experience} aria-label="Experience">
      <div className={styles.grid}>
        <ul className={styles.list}>
          {ROLES.map((r) => (
            <li key={r.year + r.company} className={styles.row}>
              <span className={styles.year}>{r.year}</span>
              <span className={styles.company}>{r.company}</span>
              <span className={styles.role}>{r.role}</span>
            </li>
          ))}
        </ul>

        <div className={styles.group}>
          <p className={styles.heading}>Tools</p>
          <ul className={styles.tags}>
            {TOOLS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className={styles.group}>
          <p className={styles.heading}>Languages</p>
          <ul className={styles.tags}>
            {LANGUAGES.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
