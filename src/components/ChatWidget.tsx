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
import type { BodyPose, HeadExpr } from "@/lib/avatar/sprites";
import AvatarBody from "./avatar/AvatarBody";
import AvatarHead from "./avatar/AvatarHead";
import { ensureLipSync, useMouthOpen } from "./avatar/lipsync";
import { useLauncherReactions } from "./avatar/useLauncherReactions";
import { useMirror } from "./avatar/useMirror";
import styles from "./ChatWidget.module.css";

const STORAGE_KEY = "jj-chat-id";
const VOICE_KEY = "jj-chat-voice";

// Tiny silent clip, played on a user tap to unlock audio on iOS/Safari so
// replies can speak automatically afterwards.
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

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

  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [voiceNote, setVoiceNote] = useState("");

  // Avatar: transient reactions, camera mirroring, launcher personality.
  const [flash, setFlash] = useState<{ expr?: HeadExpr; pose?: BodyPose } | null>(null);
  const [mirrorAsk, setMirrorAsk] = useState(false);
  const flashTimer = useRef(0);
  const mirror = useMirror();
  const reactions = useLauncherReactions(!open, pathname === "/");

  const react = useCallback((expr?: HeadExpr, pose?: BodyPose, ms = 2200) => {
    window.clearTimeout(flashTimer.current);
    setFlash({ expr, pose });
    flashTimer.current = window.setTimeout(() => setFlash(null), ms);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCache = useRef(new Map<string, string>());
  const voiceOnRef = useRef(false);
  voiceOnRef.current = voiceOn;

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

  // Audio element + whether the server has a voice configured.
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener("ended", () => setPlayingId(null));
    audio.addEventListener("error", () => setPlayingId(null));
    audioRef.current = audio;
    const cache = audioCache.current;

    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceOn(localStorage.getItem(VOICE_KEY) === "on");
    } catch {}

    fetch("/api/chat/tts", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { enabled: boolean }) => setVoiceAvailable(Boolean(d.enabled)))
      .catch(() => setVoiceAvailable(false));

    return () => {
      audio.pause();
      cache.forEach((u) => URL.revokeObjectURL(u));
      cache.clear();
    };
  }, []);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlayingId(null);
  }, []);

  const speak = useCallback(
    async (messageId: string) => {
      const audio = audioRef.current;
      const convo = convoId.current;
      if (!audio || !convo) return;
      audio.pause();
      setVoiceNote("");
      setLoadingId(messageId);
      try {
        let url = audioCache.current.get(messageId);
        if (!url) {
          const res = await fetch("/api/chat/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: convo, messageId }),
          });
          if (res.status === 204) return;
          if (!res.ok) {
            setVoiceNote(
              res.status === 429
                ? "Voice is taking a breather — try again later."
                : "My voice isn't available right now.",
            );
            return;
          }
          url = URL.createObjectURL(await res.blob());
          audioCache.current.set(messageId, url);
        }
        await ensureLipSync(audio);
        audio.src = url;
        await audio.play();
        setPlayingId(messageId);
      } catch {
        setVoiceNote("Couldn't play that. Tap Listen to try again.");
      } finally {
        setLoadingId(null);
      }
    },
    [],
  );

  const toggleVoice = useCallback(() => {
    const next = !voiceOnRef.current;
    setVoiceOn(next);
    try {
      localStorage.setItem(VOICE_KEY, next ? "on" : "off");
    } catch {}
    if (next) {
      // This tap is the user gesture that unlocks audio for later auto-play.
      const audio = audioRef.current;
      if (audio) {
        audio.src = SILENCE;
        audio.play().catch(() => {});
      }
    } else {
      stopAudio();
    }
  }, [stopAudio]);

  const hasConvo = messages.length > 0;

  // While Joshua is (or may be) in the chat, listen for his replies. An open
  // panel always listens, since he can take over from the inbox at any time.
  useEffect(() => {
    if (status === "closed" || !hasConvo) return;
    if (status === "ai" && !open) return;
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
  }, [status, open, hasConvo, mergeOwner]);

  const newChat = useCallback(() => {
    writeId(null);
    convoId.current = null;
    lastSeen.current = 0;
    setMessages([]);
    setStatus("ai");
    setInput("");
  }, []);

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

      stopAudio();
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
          fail(
            "I hit a snag on my end. In the meantime, here’s the quickest way to reach Joshua.",
            FALLBACK_CARDS,
          );
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
              if (e.card.type === "project") react("smile", "lean", 3200);
              else react("wink", "laptop", 3200);
              break;
            case "status":
              setStatus(e.status);
              if (e.status === "escalated") react("surprised", "jump", 2800);
              break;
            case "done":
              setStatus(e.status);
              if (e.messageId) {
                patchPending((m) => ({ ...m, id: e.messageId as string }));
                if (voiceOnRef.current) void speak(e.messageId);
              } else {
                setMessages((all) => all.filter((m) => m.id !== pendingId));
              }
              break;
            case "error":
              if (e.code === "not_configured") {
                fail(
                  "I'm not fully switched on yet — but you can still reach the real Joshua right here.",
                  FALLBACK_CARDS,
                );
              } else if (e.code === "unavailable") {
                fail(
                  "I can't chat right now. Here's the quickest way to reach the real Joshua.",
                  FALLBACK_CARDS,
                );
              } else {
                fail(
                  "Something went wrong on my end. Here’s the quickest way to reach Joshua while I sort it out.",
                  FALLBACK_CARDS,
                );
              }
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
    [busy, status, pathname, speak, stopAudio, react],
  );

  const humanHere = status === "human";
  const showChips = messages.length === 0 && !busy;
  const [launcherHeight, setLauncherHeight] = useState(168);
  const [mirrorSupported, setMirrorSupported] = useState(false);

  useEffect(() => {
    const update = () => setLauncherHeight(window.innerWidth <= 768 ? 118 : 168);
    update();
    window.addEventListener("resize", update);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMirrorSupported(Boolean(navigator.mediaDevices?.getUserMedia));
    return () => window.removeEventListener("resize", update);
  }, []);
  const shownMood: Mood = playingId ? "talking" : mood;

  // What the avatar shows, in priority order: the visitor's own expression
  // (mirror mode) > a one-off reaction > lip-sync > thinking > attentive > calm.
  const mouthOpen = useMouthOpen(audioRef.current, Boolean(playingId));
  const mirroring = mirror.status === "on";
  const typing = input.trim().length > 0;
  const headExpr: HeadExpr =
    (mirroring && mirror.expression) ||
    flash?.expr ||
    (playingId ? (mouthOpen ? "laugh" : "smile") : null) ||
    (busy && mood === "thinking" ? "think" : null) ||
    (status === "closed" || typing ? "serious" : null) ||
    "smile";
  const bodyPose: BodyPose =
    (mirroring && mirror.pose) ||
    flash?.pose ||
    (playingId ? "laptop" : null) ||
    (busy && mood === "thinking" ? "crouch" : null) ||
    (typing ? "threeQuarter" : null) ||
    "front";

  return (
    <div className={styles.dock} data-open={open || undefined}>
      {open && (
        <div className={styles.panelWrap}>
        {/* He stands on the top edge of the window and acts out the conversation. */}
        <div className={styles.stage} aria-hidden="true">
          <AvatarBody
            pose={bodyPose}
            height={150}
            yawRef={mirroring ? mirror.yawRef : undefined}
          />
        </div>
        <section
          className={styles.panel}
          role="dialog"
          aria-label="Chat with Joshua's digital version"
        >
          <header className={styles.header}>
            <span className={styles.avatarWrap} data-mood={shownMood}>
              <AvatarHead
                expression={headExpr}
                height={56}
                yawRef={mirroring ? mirror.yawRef : undefined}
              />
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
                    : mirror.status === "loading"
                      ? "Loading vision model…"
                      : mirroring
                        ? "Watching on your device only"
                        : mood === "thinking"
                          ? "Thinking…"
                          : "Replies instantly"}
              </span>
            </span>
            {mirror.status === "on" || mirror.status === "loading" ? (
              <button
                type="button"
                className={styles.selfView}
                onClick={mirror.stop}
                aria-label="Turn camera off"
                title="Camera on, processed on your device only. Click to stop."
              >
                <SelfView stream={mirror.stream} />
                <span className={styles.rec} aria-hidden="true" />
              </button>
            ) : mirrorSupported ? (
              <button
                type="button"
                className={styles.voice}
                onClick={() => setMirrorAsk((v) => !v)}
                aria-label="Let him react to your expressions with your camera"
                title="Camera mode: he reacts to your smile or a wave"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <rect x="3" y="7" width="12" height="10" rx="2" fill="currentColor" />
                  <path d="M16 11l5-3v8l-5-3z" fill="currentColor" />
                </svg>
              </button>
            ) : null}
            {voiceAvailable && (
              <button
                type="button"
                className={`${styles.voice} ${voiceOn ? styles.voiceOn : ""}`}
                onClick={toggleVoice}
                aria-pressed={voiceOn}
                aria-label={voiceOn ? "Turn voice off" : "Turn voice on"}
                title={voiceOn ? "Voice on — replies are spoken" : "Hear replies in Joshua's voice"}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"
                    fill="currentColor"
                  />
                  {voiceOn ? (
                    <path
                      d="M15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M16 9.5l5 5M21 9.5l-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            )}
            <button
              type="button"
              className={styles.close}
              onClick={() => {
                stopAudio();
                mirror.stop();
                setMirrorAsk(false);
                setOpen(false);
              }}
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
                {voiceAvailable &&
                  m.role === "ai" &&
                  m.text &&
                  !busy &&
                  /^[0-9a-f-]{36}$/.test(m.id) && (
                    <button
                      type="button"
                      className={styles.listen}
                      onClick={() => (playingId === m.id ? stopAudio() : speak(m.id))}
                      disabled={loadingId === m.id}
                    >
                      {loadingId === m.id
                        ? "Loading voice…"
                        : playingId === m.id
                          ? "■ Stop"
                          : "▶ Listen"}
                    </button>
                  )}
              </div>
            ))}

            {voiceNote && <p className={styles.notice}>{voiceNote}</p>}

            {mirrorAsk && mirror.status === "off" && (
              <div className={styles.ask}>
                <p className={styles.askTitle}>Want me to see you?</p>
                <p className={styles.askText}>
                  I can react to your smile, a wave or a thumbs-up. Your camera runs only
                  in this tab: nothing is recorded or uploaded, and you can stop any time.
                </p>
                <div className={styles.askActions}>
                  <button
                    type="button"
                    className={styles.askYes}
                    onClick={() => {
                      setMirrorAsk(false);
                      void mirror.start();
                    }}
                  >
                    Turn on camera
                  </button>
                  <button
                    type="button"
                    className={styles.noticeBtn}
                    onClick={() => setMirrorAsk(false)}
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}
            {mirror.status === "error" && mirror.error && (
              <p className={styles.notice}>{mirror.error}</p>
            )}

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
              <p className={styles.notice}>
                This chat has ended. Thanks for stopping by.{" "}
                <button type="button" className={styles.noticeBtn} onClick={newChat}>
                  Start a new chat
                </button>
              </p>
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
        </div>
      )}

      {!open && (
        <div className={styles.launcherWrap}>
          {reactions.bubble && (
            <button
              type="button"
              className={styles.bubbleTip}
              onClick={() => {
                reactions.dismiss();
                setUnread(0);
                setOpen(true);
              }}
            >
              {reactions.bubble}
            </button>
          )}
          <button
            type="button"
            className={styles.launcher}
            onClick={() => {
              reactions.dismiss();
              setUnread(0);
              setOpen(true);
            }}
            aria-label="Chat with Joshua's digital version"
          >
            <span className={styles.hello}>Chat with my digital self</span>
            <AvatarBody pose={reactions.pose} height={launcherHeight} follow />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
        </div>
      )}
    </div>
  );
}

/** Small live preview so the visitor can always see their camera is on. */
function SelfView({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream) v.play().catch(() => {});
  }, [stream]);
  return <video ref={ref} className={styles.selfVideo} muted playsInline aria-hidden="true" />;
}
