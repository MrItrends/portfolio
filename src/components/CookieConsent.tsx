"use client";

import { useEffect, useState } from "react";
import styles from "./CookieConsent.module.css";

/**
 * Cookie consent banner wired to Google Consent Mode v2.
 * Analytics storage defaults to "denied" (set in the layout's gtag snippet);
 * this banner updates it to "granted" on Accept and remembers the choice.
 */

const KEY = "cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "granted") {
      // Re-apply the grant on load — consent resets to denied each page load.
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
    } else if (saved !== "denied") {
      setShow(true);
    }
  }, []);

  const decide = (granted: boolean) => {
    localStorage.setItem(KEY, granted ? "granted" : "denied");
    window.gtag?.("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
    });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={styles.banner}
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <p className={styles.text}>
        This site uses analytics cookies to understand how it&rsquo;s used.
        You can accept or decline.
      </p>
      <div className={styles.actions}>
        <button className={styles.decline} onClick={() => decide(false)}>
          Decline
        </button>
        <button className={styles.accept} onClick={() => decide(true)}>
          Accept
        </button>
      </div>
    </div>
  );
}
