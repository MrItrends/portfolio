"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/lib/chat/types";
import { Chip } from "./Inbox";
import { visitorLabel } from "./format";
import styles from "./Admin.module.css";

type Action = "takeover" | "release" | "close" | "reopen";

const ROLE_NAME = { visitor: "Visitor", ai: "Digital Joshua", owner: "You" } as const;

export default function ConversationView({ id }: { id: string }) {
  const router = useRouter();
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [missing, setMissing] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/conversations/${id}`, { cache: "no-store" });
      if (res.status === 401) return router.refresh();
      if (res.status === 404) return setMissing(true);
      if (!res.ok) return;
      const { conversation } = (await res.json()) as { conversation: Conversation };
      setConvo(conversation);
      // Having it open counts as reading it.
      if (conversation.unread) {
        fetch(`/api/admin/conversations/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read" }),
        }).catch(() => {});
      }
    } catch {
      // keep what we have
    }
  }, [id, router]);

  const act = useCallback(
    async (action: Action | "reply", body: Record<string, unknown> = {}) => {
      const res = await fetch(`/api/admin/conversations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      if (res.status === 401) {
        router.refresh();
        return false;
      }
      if (!res.ok) return false;
      setConvo(((await res.json()) as { conversation: Conversation }).conversation);
      return true;
    },
    [id, router],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const poll = window.setInterval(() => !document.hidden && load(), 3000);
    return () => window.clearInterval(poll);
  }, [load]);

  // Follow new messages unless the owner scrolled up to read history.
  useEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [convo?.messages.length]);

  async function remove() {
    if (!window.confirm("Delete this conversation permanently?")) return;
    const res = await fetch(`/api/admin/conversations/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin");
    else setError("Couldn't delete that. Try again.");
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError("");
    stick.current = true;
    const ok = await act("reply", { text: value });
    if (ok) setText("");
    else setError("Couldn't send that. Try again.");
    setSending(false);
  }

  if (missing) {
    return (
      <main className={styles.shell}>
        <Link href="/admin" className={styles.back}>
          ← Inbox
        </Link>
        <p className={styles.empty}>This conversation no longer exists.</p>
      </main>
    );
  }
  if (!convo) {
    return (
      <main className={styles.shell}>
        <Link href="/admin" className={styles.back}>
          ← Inbox
        </Link>
        <p className={styles.muted}>Loading…</p>
      </main>
    );
  }

  const { status, escalation, visitor } = convo;

  return (
    <main className={`${styles.shell} ${styles.convShell}`}>
      <header className={styles.convHead}>
        <Link href="/admin" className={styles.back}>
          ← Inbox
        </Link>
        <div className={styles.convTitle}>
          <h1 className={styles.title}>{visitorLabel(visitor)}</h1>
          <Chip status={status} />
        </div>
        <p className={styles.meta}>
          Started {new Date(convo.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {convo.page ? ` · from ${convo.page}` : ""}
        </p>
        {visitor.email && (
          <a className={styles.mail} href={`mailto:${visitor.email}`}>
            {visitor.email}
          </a>
        )}

        {escalation && (
          <section className={styles.brief}>
            <p className={styles.kicker}>
              {escalation.urgency === "urgent" ? "Urgent · " : ""}Why it was escalated
            </p>
            <p className={styles.briefText}>{escalation.reason}</p>
            <p className={styles.briefText}>{escalation.summary}</p>
          </section>
        )}

        <div className={styles.actions}>
          {(status === "ai" || status === "escalated") && (
            <button className={styles.ghost} onClick={() => act("takeover")}>
              Take over
            </button>
          )}
          {status === "human" && (
            <button className={styles.ghost} onClick={() => act("release")}>
              Hand back to AI
            </button>
          )}
          {status !== "closed" && (
            <button className={styles.ghost} onClick={() => act("close")}>
              End chat
            </button>
          )}
          {status === "closed" && (
            <button className={styles.ghost} onClick={() => act("reopen")}>
              Reopen
            </button>
          )}
          <button className={styles.ghost} onClick={remove}>
            Delete
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        className={styles.thread}
        onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
      >
        {convo.messages.map((m) => (
          <div key={m.id} className={`${styles.bubbleRow} ${styles[`from_${m.role}`]}`}>
            <span className={styles.who}>
              {ROLE_NAME[m.role]} ·{" "}
              {new Date(m.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
            {m.text && <p className={styles.bubble}>{m.text}</p>}
            {m.cards?.map((c, i) => (
              <span key={i} className={styles.shared}>
                Shared: {c.type === "project" ? c.title : c.label}
              </span>
            ))}
          </div>
        ))}
        {status === "closed" && <p className={styles.muted}>This chat is closed.</p>}
      </div>

      <form className={styles.composer} onSubmit={send}>
        {status !== "human" && status !== "closed" && (
          <p className={styles.hint}>Replying takes over from the digital Joshua.</p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <div className={styles.composerRow}>
          <textarea
            className={styles.field}
            rows={2}
            value={text}
            maxLength={2000}
            placeholder={status === "closed" ? "Reply to reopen…" : "Write as yourself…"}
            aria-label="Reply as Joshua"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className={styles.primary} disabled={sending || !text.trim()}>
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
