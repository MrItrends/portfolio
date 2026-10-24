"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ConversationSummary } from "@/app/api/admin/conversations/route";
import PushToggle from "./PushToggle";
import { STATUS_LABEL, timeAgo, visitorLabel } from "./format";
import styles from "./Admin.module.css";

type Filter = "all" | "needs" | "live";

const ROLE_PREFIX = { visitor: "", ai: "AI: ", owner: "You: " } as const;

export function Chip({ status }: { status: ConversationSummary["status"] }) {
  return (
    <span className={`${styles.chip} ${styles[`chip_${status}`]}`}>{STATUS_LABEL[status]}</span>
  );
}

export default function Inbox() {
  const router = useRouter();
  const [items, setItems] = useState<ConversationSummary[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/conversations", { cache: "no-store" });
      if (res.status === 401) return router.refresh();
      if (res.ok) setItems(((await res.json()) as { items: ConversationSummary[] }).items);
    } catch {
      // keep what we have
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const poll = window.setInterval(() => !document.hidden && load(), 5000);
    const clock = window.setInterval(() => tick((n) => n + 1), 30000);
    const onVis = () => !document.hidden && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const needs = (items ?? []).filter((c) => c.status === "escalated" || c.unread);
  const live = (items ?? []).filter((c) => c.status === "human");
  const shown = filter === "needs" ? needs : filter === "live" ? live : (items ?? []);

  return (
    <main className={styles.shell}>
      <header className={styles.bar}>
        <div>
          <p className={styles.kicker}>Joshua</p>
          <h1 className={styles.title}>Chat inbox</h1>
        </div>
        <button className={styles.linkBtn} onClick={logout}>
          Sign out
        </button>
      </header>

      <PushToggle />

      <nav className={styles.tabs} aria-label="Filter conversations">
        {(
          [
            ["all", "All", items?.length ?? 0],
            ["needs", "Needs you", needs.length],
            ["live", "Live", live.length],
          ] as const
        ).map(([key, label, n]) => (
          <button
            key={key}
            className={`${styles.tab} ${filter === key ? styles.tabOn : ""}`}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
          >
            {label} <span className={styles.count}>{n}</span>
          </button>
        ))}
      </nav>

      {items === null ? (
        <p className={styles.muted}>Loading…</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>
          {filter === "all"
            ? "No conversations yet. When someone chats with your digital self, it shows up here."
            : "Nothing here right now."}
        </p>
      ) : (
        <ul className={styles.list}>
          {shown.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/c/${c.id}`} className={styles.row}>
                <span className={styles.rowTop}>
                  {c.unread && <span className={styles.dot} aria-label="Unread" />}
                  <span className={styles.name}>{visitorLabel(c)}</span>
                  {c.urgent && c.status !== "closed" && <span className={styles.urgent}>Urgent</span>}
                  <Chip status={c.status} />
                  <span className={styles.time}>{timeAgo(c.updatedAt)}</span>
                </span>
                <span className={styles.preview}>
                  {c.previewRole ? ROLE_PREFIX[c.previewRole] : ""}
                  {c.preview || "No messages"}
                </span>
                <span className={styles.meta}>
                  {c.count} message{c.count === 1 ? "" : "s"}
                  {c.page ? ` · from ${c.page}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
