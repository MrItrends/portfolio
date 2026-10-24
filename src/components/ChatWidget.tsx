"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type {
  Card,
  ChatMessage,
  ConversationStatus,
  StreamEvent,
} from "@/lib/chat/types";
import { GREETING, SUGGESTIONS } from "@/lib/chat/greeting";
import { BOOKING_URL, RESUME_URL } from "@/lib/site";
import styles from "./ChatWidget.module.css";

const STORAGE_KEY = "jj-chat-id";
const FACE = "/images/joshua/face-smile.webp";

type Mood = "idle" | "thinking" | "talking";

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;

function linkify(text: string) {
  return text.split(URL_RE).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

const readId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeId = (id: string | null) => {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable — chat still works for this page view
  }
};

const FALLBACK_CARDS: Card[] = [
  { type: "cv", url: RESUME_URL, label: "Joshua's CV" },
  { type: "booking", url: BOOKING_URL, label: "Book a call with Joshua" },
];

function CardView({ card }: { card: Card }) {
  const external = card.type !== "project";
  return (
    <a
      className={styles.card}
      href={card.url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {card.type === "project" && card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.cardThumb} src={card.image} alt="" />
      ) : null}
      <span className={styles.cardBody}>
        <span className={styles.cardKicker}>
          {card.type === "cv"
            ? "Résumé"
            : card.type === "booking"
              ? "Book a call"
              : card.category}
        </span>
        <span className={styles.cardTitle}>
          {card.type === "project" ? card.title : card.label}
        </span>
      </span>
      <span className={styles.cardArrow} aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConversationStatus>("ai");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [unread, setUnread] = useState(0);

  const convoId = useRef<string | null>(null);
  const lastSeen = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const mergeOwner = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const have = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !have.has(m.id));
      if (!fresh.length) return prev;
      if (!openRef.current) setUnread((n) => n + fresh.length);
      return [...prev, ...fresh];
    });
    lastSeen.current = Math.max(lastSeen.current, ...incoming.map((m) => m.at));
  }, []);

  // Restore an earlier conversation on this device.
  useEffect(() => {
    const id = readId();
    if (!id) return;
    fetch(`/api/chat?id=${id}&full=1`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { status: ConversationStatus; messages: ChatMessage[] }) => {
        convoId.current = id;
        setMessages(data.messages);
        setStatus(data.status);
        lastSeen.current = Math.max(0, ...data.messages.map((m) => m.at));
      })
      .catch(() => writeId(null));
  }, []);

  // While Joshua is (or may be) in the chat, listen for his replies.
  useEffect(() => {
    if (status === "ai" || status === "closed") return;
    const tick = async () => {
      const id = convoId.current;
      if (!id || document.hidden) return;
      try {
        const res = await fetch(`/api/chat?id=${id}&after=${lastSeen.current}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: ConversationStatus;
          messages: ChatMessage[];
        };
        setStatus(data.status);
        mergeOwner(data.messages);
      } catch {
        // transient — try again next tick
      }
    };
    const t = window.setInterval(tick, open ? 3000 : 8000);
    return () => window.clearInterval(t);
  }, [status, open, mergeOwner]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy || status === "closed") return;

      const now = Date.now();
      const visitorMsg: ChatMessage = { id: `v-${now}`, role: "visitor", text, at: now };
      const pendingId = `p-${now}`;
      setInput("");
      setMessages((m) => [...m, visitorMsg]);

      const patchPending = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((all) => all.map((m) => (m.id === pendingId ? fn(m) : m)));

      // Joshua has taken over: no AI reply, just deliver the message.
      const aiHandling = status !== "human";
      if (aiHandling) {
        setMessages((m) => [...m, { id: pendingId, role: "ai", text: "", at: now + 1 }]);
        setBusy(true);
        setMood("thinking");
      }

      const fail = (message: string, cards?: Card[]) =>
        patchPending((m) => ({ ...m, text: message, cards }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: convoId.current,
            message: text,
            page: pathname,
          }),
        });

        if (res.status === 429) {
          fail(
            "We've been chatting a lot — give me a little while. In the meantime, here's the quick route to Joshua.",
            FALLBACK_CARDS,
          );
          return;
        }
        if (!res.ok || !res.body) {
          fail("Something went wrong on my end. Try again in a moment?");
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let spoke = false;

        const handle = (e: StreamEvent) => {
          switch (e.type) {
            case "meta":
              convoId.current = e.conversationId;
              writeId(e.conversationId);
              break;
            case "delta":
              if (!spoke) {
                spoke = true;
                setMood("talking");
              }
              patchPending((m) => ({ ...m, text: m.text + e.text }));
              break;
            case "card":
              patchPending((m) => ({ ...m, cards: [...(m.cards ?? []), e.card] }));
              break;
            case "status":
              setStatus(e.status);
              break;
            case "done":
              setStatus(e.status);
              if (e.messageId) {
                patchPending((m) => ({ ...m, id: e.messageId as string }));
              } else {
                setMessages((all) => all.filter((m) => m.id !== pendingId));
              }
              break;
            case "error":
              fail(
                e.code === "not_configured"
                  ? "I'm not fully switched on yet — but you can still reach the real Joshua right here."
                  : e.message,
                e.code === "not_configured" ? FALLBACK_CARDS : undefined,
              );
              break;
          }
        };

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (line) handle(JSON.parse(line) as StreamEvent);
          }
        }
      } catch {
        fail("I lost the connection for a second. Mind trying that again?");
      } finally {
        setBusy(false);
        setMood("idle");
        // Drop an empty placeholder if nothing ever arrived.
        setMessages((all) => all.filter((m) => m.id !== pendingId || m.text || m.cards));
      }
    },
    [busy, status, pathname],
  );

  const humanHere = status === "human";
  const showChips = messages.length === 0 && !busy;

  return (
    <div className={styles.dock} data-open={open || undefined}>
      {open && (
        <section
          className={styles.panel}
          role="dialog"
          aria-label="Chat with Joshua's digital version"
        >
          <header className={styles.header}>
            <span className={styles.avatarWrap} data-mood={mood}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.headerFace} src={FACE} alt="" />
            </span>
            <span className={styles.who}>
              <span className={styles.name}>
                {humanHere ? "Joshua" : "Joshua · digital"}
              </span>
              <span className={styles.sub}>
                {humanHere
                  ? "The real one is here"
                  : status === "escalated"
                    ? "Joshua's been pinged"
                    : mood === "thinking"
                      ? "Thinking…"
                      : "Replies instantly"}
              </span>
            </span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div
            ref={listRef}
            className={styles.list}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            <div className={`${styles.msg} ${styles.ai}`}>
              <p className={styles.bubble}>{GREETING}</p>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.msg} ${
                  m.role === "visitor" ? styles.visitor : styles.ai
                }`}
              >
                {m.role === "owner" && <span className={styles.tag}>Joshua</span>}
                {(m.text || (m.role === "ai" && busy && !m.cards)) && (
                  <p className={styles.bubble}>
                    {m.text ? (
                      linkify(m.text)
                    ) : (
                      <span className={styles.dots} aria-label="Thinking">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </p>
                )}
                {m.cards?.map((c, i) => <CardView key={i} card={c} />)}
              </div>
            ))}

            {status === "escalated" && (
              <p className={styles.notice}>
                Joshua has been notified and can jump into this chat — or follow up
                by email.
              </p>
            )}
            {humanHere && (
              <p className={styles.notice}>Joshua has joined the conversation.</p>
            )}
            {status === "closed" && (
              <p className={styles.notice}>This chat has ended. Thanks for stopping by.</p>
            )}

            {showChips && (
              <div className={styles.chips}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={inputRef}
              className={styles.input}
              value={input}
              rows={1}
              maxLength={1000}
              disabled={status === "closed"}
              placeholder={humanHere ? "Message Joshua…" : "Ask me anything…"}
              aria-label="Your message"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={busy || !input.trim() || status === "closed"}
            >
              Send
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button
          type="button"
          className={styles.launcher}
          onClick={() => {
            setUnread(0);
            setOpen(true);
          }}
          aria-label="Chat with Joshua's digital version"
          data-mood={mood}
        >
          <span className={styles.hello}>Chat with my digital self</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.launcherFace} src={FACE} alt="" />
          {unread > 0 && <span className={styles.badge}>{unread}</span>}
        </button>
      )}
    </div>
  );
}
