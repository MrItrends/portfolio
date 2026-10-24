"use client";

import { useEffect, useState } from "react";
import styles from "./Admin.module.css";

type State =
  | "loading"
  | "unsupported"
  | "ios-install"
  | "unconfigured"
  | "off"
  | "on"
  | "denied";

const SCOPE = "/admin";

function keyToUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  const existing = await navigator.serviceWorker.getRegistration(SCOPE);
  if (existing) return existing;
  await navigator.serviceWorker.register("/sw.js", { scope: SCOPE, updateViaCache: "none" });
  return navigator.serviceWorker.ready;
}

export default function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [note, setNote] = useState("");

  useEffect(() => {
    (async () => {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState(ios && !standalone ? "ios-install" : "unsupported");
        return;
      }
      try {
        const cfg = (await fetch("/api/admin/push").then((r) => r.json())) as {
          configured: boolean;
        };
        if (!cfg.configured) return setState("unconfigured");
        if (Notification.permission === "denied") return setState("denied");
        const reg = await registration();
        setState((await reg.pushManager.getSubscription()) ? "on" : "off");
      } catch {
        setState("unsupported");
      }
    })();
  }, []);

  async function enable() {
    setNote("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState("denied");
      const { publicKey } = (await fetch("/api/admin/push").then((r) => r.json())) as {
        publicKey: string;
      };
      const reg = await registration();
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToUint8(publicKey),
        }));
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setNote("Couldn't turn notifications on. Try again.");
    }
  }

  async function disable() {
    setNote("");
    try {
      const reg = await registration();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/admin/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setNote("Couldn't turn notifications off.");
    }
  }

  async function test() {
    setNote("Sending…");
    const res = await fetch("/api/admin/push/test", { method: "POST" });
    setNote(res.ok ? "Sent — check your notifications." : "Couldn't send a test.");
  }

  if (state === "loading") return null;

  return (
    <div className={styles.push}>
      {state === "off" && (
        <button className={styles.pushBtn} onClick={enable}>
          Turn on phone notifications
        </button>
      )}
      {state === "on" && (
        <>
          <span className={styles.pushOn}>Notifications on for this device</span>
          <button className={styles.linkBtn} onClick={test}>
            Send test
          </button>
          <button className={styles.linkBtn} onClick={disable}>
            Turn off
          </button>
        </>
      )}
      {state === "denied" && (
        <span className={styles.muted}>
          Notifications are blocked — allow them in your browser or phone settings.
        </span>
      )}
      {state === "ios-install" && (
        <span className={styles.muted}>
          On iPhone: tap Share → Add to Home Screen, then open the app from your home
          screen to enable notifications.
        </span>
      )}
      {state === "unconfigured" && (
        <span className={styles.muted}>
          Push isn&rsquo;t set up on the server yet (VAPID keys). Email alerts still work.
        </span>
      )}
      {state === "unsupported" && (
        <span className={styles.muted}>This browser can&rsquo;t receive push notifications.</span>
      )}
      {note && <span className={styles.muted}>{note}</span>}
    </div>
  );
}
