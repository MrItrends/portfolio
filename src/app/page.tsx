import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.holding}>
      <div className="container">
        <p className={styles.kicker}>Portfolio</p>
        <h1 className={styles.title}>
          Selected work,
          <br />
          coming soon.
        </h1>
        <p className={styles.meta}>In progress — 2026</p>
      </div>
    </main>
  );
}
