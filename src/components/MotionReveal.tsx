"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

const STAGGER_MS = 45;

/**
 * Reveals [data-reveal] elements once, as they scroll into view. Elements that
 * arrive together (a row of tiles, a hero's lines) cascade by 45ms each, or use
 * their own data-d="<ms>". Nothing reveals until the preloader has finished.
 */
export default function MotionReveal() {
  const pathname = usePathname();

  useEffect(() => {
    window.__motionReady = true;

    const introDone = () => {
      try {
        return sessionStorage.getItem("intro-seen") === "1";
      } catch {
        return true;
      }
    };

    const waiting = new Set<HTMLElement>();
    const show = (batch: HTMLElement[]) => {
      batch
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .forEach((el, i) => {
          const own = el.dataset.d;
          el.style.setProperty("--d", own ?? String(i * STAGGER_MS));
          // next frame, so the hidden state is painted before it transitions
          requestAnimationFrame(() => el.setAttribute("data-in", ""));
        });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const batch: HTMLElement[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          batch.push(e.target as HTMLElement);
        }
        if (!batch.length) return;
        if (introDone()) show(batch);
        else batch.forEach((el) => waiting.add(el));
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const onIntroDone = () => {
      if (waiting.size) show([...waiting]);
      waiting.clear();
    };
    window.addEventListener("intro:done", onIntroDone);

    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")
      .forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      window.removeEventListener("intro:done", onIntroDone);
    };
  }, [pathname]);

  return null;
}
