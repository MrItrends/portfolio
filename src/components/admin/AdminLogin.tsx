"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !password) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      setError(
        res.status === 429
          ? "Too many attempts. Try again in a few minutes."
          : res.status === 503
            ? "Admin isn't set up yet."
            : "That password isn't right.",
      );
    } catch {
      setError("Couldn't reach the server.");
    }
    setBusy(false);
  }

  return (
    <main className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={submit}>
        <p className={styles.kicker}>Private</p>
        <h1 className={styles.loginTitle}>Chat inbox</h1>

        {!configured ? (
          <p className={styles.muted}>
            Set the <code>ADMIN_PASSWORD</code> environment variable (8+ characters) to
            switch the inbox on.
          </p>
        ) : (
          <>
            <input
              className={styles.field}
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              autoFocus
            />
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <button className={styles.primary} disabled={busy || !password}>
              {busy ? "Checking…" : "Sign in"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
