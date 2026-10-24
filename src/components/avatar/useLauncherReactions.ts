"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BodyPose } from "@/lib/avatar/sprites";

const HELLO_KEY = "jj-avatar-hello";
const COOLDOWN_MS = 9000;
const IDLE_MS = 45_000;

/**
 * The closed-chat avatar's personality: a hello once per session, a nod to the
 * Work and About sections as you scroll to them, and a rest when you go quiet.
 * Deliberately sparse — one reaction at a time, never repeated, and never while
 * the chat is open or the visitor prefers reduced motion.
 */
export function useLauncherReactions(enabled: boolean, onHome: boolean) {
  const [pose, setPose] = useState<BodyPose>("front");
  const [bubble, setBubble] = useState<string | null>(null);

  const timers = useRef<number[]>([]);
  const readyAt = useRef(0);
  const seen = useRef(new Set<string>());

  const play = useCallback((p: BodyPose, text: string | null, ms = 4000) => {
    if (Date.now() < readyAt.current) return;
    readyAt.current = Date.now() + ms + COOLDOWN_MS;
    setPose(p);
    setBubble(text);
    timers.current.push(
      window.setTimeout(() => {
        setPose("front");
        setBubble(null);
      }, ms),
    );
  }, []);

  const dismiss = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPose("front");
    setBubble(null);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      dismiss();
      return;
    }

    const cleanups: (() => void)[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      cleanups.push(() => clearTimeout(id));
    };

    // Hello — once per session, after the preloader has finished.
    let helloDone = false;
    try {
      helloDone = sessionStorage.getItem(HELLO_KEY) === "1";
    } catch {}
    if (!helloDone) {
      let waited = 0;
      const poll = window.setInterval(() => {
        waited += 500;
        let intro = false;
        try {
          intro = sessionStorage.getItem("intro-seen") === "1";
        } catch {}
        if (intro || waited > 15_000) {
          clearInterval(poll);
          later(() => {
            play("laptop", "Hi, I'm Joshua's digital self. Ask me anything.", 5200);
            try {
              sessionStorage.setItem(HELLO_KEY, "1");
            } catch {}
          }, 1500);
        }
      }, 500);
      cleanups.push(() => clearInterval(poll));
    }

    // Section nods (home page only).
    if (onHome && "IntersectionObserver" in window) {
      const nods: Record<string, [BodyPose, string]> = {
        work: ["lean", "Open any case study to see how I think."],
        about: ["jump", "That's me!"],
      };
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const id = e.target.id;
            if (!e.isIntersecting || seen.current.has(id) || !nods[id]) continue;
            seen.current.add(id);
            play(nods[id][0], nods[id][1]);
          }
        },
        { threshold: 0.4 },
      );
      for (const id of Object.keys(nods)) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }
      cleanups.push(() => io.disconnect());
    }

    // Rest when nothing has happened for a while.
    let idleTimer = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => play("crouch", null, 9000), IDLE_MS);
    };
    const events = ["pointermove", "scroll", "keydown", "pointerdown"] as const;
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    arm();
    cleanups.push(() => {
      clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    });

    const t = timers.current;
    return () => {
      cleanups.forEach((fn) => fn());
      t.forEach(clearTimeout);
      timers.current = [];
    };
  }, [enabled, onHome, play, dismiss]);

  return { pose, bubble, dismiss };
}
