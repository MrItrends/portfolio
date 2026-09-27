"use client";

import { useEffect } from "react";
import styles from "./WorkCursor.module.css";

/**
 * Custom cursor for the work grid — replaces the pointer with a small pill
 * reading "View" that follows the mouse while hovering a live case-study
 * tile (studio-wilhelm.com's video-hover mechanic, adapted for project links).
 */
export default function WorkCursor() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = document.createElement("div");
    el.className = styles.pill;
    el.textContent = "View";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    const onMove = (e: MouseEvent) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };

    // Delegate hover detection to the work grid's live-project links, so we
    // don't need a listener per tile.
    const work = document.getElementById("work");
    const onOver = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLElement>(
        `a[href^="/work/"]`
      );
      if (link) el.classList.add(styles.active);
    };
    const onOut = (e: MouseEvent) => {
      const to = e.relatedTarget as HTMLElement | null;
      const stillOnLink = to?.closest?.(`a[href^="/work/"]`);
      if (!stillOnLink) el.classList.remove(styles.active);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    work?.addEventListener("mouseover", onOver);
    work?.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      work?.removeEventListener("mouseover", onOver);
      work?.removeEventListener("mouseout", onOut);
      el.remove();
    };
  }, []);

  return null;
}
