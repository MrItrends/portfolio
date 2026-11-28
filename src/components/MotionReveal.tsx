"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

const STAGGER_MS = 45;
// Last resort: whatever happens, nothing stays hidden past this.
const FAILSAFE_MS = 4000;

/**
 * Reveals below-the-fold [data-reveal] elements once, as they scroll into view.
 * Nothing above the fold is ever tagged, and everything is force-shown after a
 * short failsafe, so content can never stay hidden.
 */
export default function MotionReveal() {
  const pathname = usePathname();

  useEffect(() => {
    window.__motionReady = true;

    const showAll = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")
        .forEach((el) => el.setAttribute("data-in", ""));

    if (typeof IntersectionObserver === "undefined") {
      showAll();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const batch: HTMLElement[] = [];
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          batch.push(e.target as HTMLElement);
        }
        batch
          .sort((a, b) =>
            a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          )
          .forEach((el, i) => {
            el.style.setProperty("--d", el.dataset.d ?? String(i * STAGGER_MS));
            requestAnimationFrame(() => el.setAttribute("data-in", ""));
          });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")
      .forEach((el) => io.observe(el));

    // Anything still hidden shortly after load (e.g. observer never fired) is shown.
    const failsafe = window.setTimeout(() => {
      const el = document.querySelector("[data-reveal]:not([data-in])");
      if (!el) return;
      // Only force what is already in or above the viewport.
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")
        .forEach((n) => {
          if (n.getBoundingClientRect().top < window.innerHeight) n.setAttribute("data-in", "");
        });
    }, FAILSAFE_MS);

    return () => {
      clearTimeout(failsafe);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
