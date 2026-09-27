"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./AboutStack.module.css";

/**
 * A loosely stacked pile of portraits that blooms open as the cursor moves
 * across it, and settles back into a stack when it leaves. Each photo can
 * also be picked up and dragged anywhere on screen — once dropped it stays
 * put (and stops reacting to the cursor bloom), like a real scattered print.
 */

type Card = {
  src: string;
  angle: number; // degrees — direction this card fans out toward
  restX: number; // px — resting jitter, so the stack doesn't look too neat
  restY: number;
  rot: number; // deg — resting tilt
};

const CARDS: Card[] = [
  { src: "/media/about/about-1.webp", angle: -90, restX: -6, restY: 4, rot: -7 },
  { src: "/media/about/about-2.webp", angle: -30, restX: 5, restY: -3, rot: 5 },
  { src: "/media/about/about-3.webp", angle: 30, restX: -3, restY: -6, rot: -4 },
  { src: "/media/about/about-4.webp", angle: 90, restX: 6, restY: 5, rot: 8 },
  { src: "/media/about/about-5.webp", angle: 150, restX: -5, restY: 2, rot: -6 },
  { src: "/media/about/about-6.webp", angle: 210, restX: 3, restY: -2, rot: 3 },
];

const SPREAD = 190; // px, at full intensity (cursor at the container's edge)
const DRAG_Z = 999; // while actively held — on top of literally everything
const DROPPED_Z = 30; // resting z once released — above normal content

export default function AboutStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detached = useRef<boolean[]>(CARDS.map(() => false));
  const raf = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const drag = useRef<{ index: number; offsetX: number; offsetY: number } | null>(null);

  const applyBloom = (nx: number, ny: number) => {
    const intensity = Math.min(1, Math.hypot(nx, ny));
    CARDS.forEach((c, i) => {
      if (detached.current[i]) return; // dragged cards ignore the group bloom
      const el = cardRefs.current[i];
      if (!el) return;
      const rad = (c.angle * Math.PI) / 180;
      const x = c.restX + Math.cos(rad) * SPREAD * intensity;
      const y = c.restY + Math.sin(rad) * SPREAD * intensity;
      const rot = c.rot + c.rot * intensity * 0.8;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
      el.style.setProperty("--rot", `${rot}deg`);
    });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current) return; // an active drag takes priority
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    pending.current = { x: nx, y: ny };
    if (!raf.current) {
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        if (pending.current) applyBloom(pending.current.x, pending.current.y);
      });
    }
  };

  const onMouseLeave = () => {
    if (drag.current) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    applyBloom(0, 0);
  };

  // Touch devices have no hover — settle into a partly-open fan on mount so
  // it still reads as a deliberate pile rather than a flat, dead stack.
  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) applyBloom(0.5, 0.32);
  }, []);

  const onPointerDown = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRefs.current[index];
    if (!el) return;
    e.preventDefault();

    const rect = el.getBoundingClientRect();
    drag.current = { index, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    detached.current[index] = true;

    // Freeze mid-bloom exactly where it visually sits, then hand it fully
    // to the pointer — fixed to the viewport, so it can go anywhere on screen.
    el.style.transition = "none";
    el.style.position = "fixed";
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.margin = "0";
    el.style.transform = "none";
    el.style.zIndex = String(DRAG_Z);
    el.classList.add(styles.dragging);

    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const cardEl = cardRefs.current[d.index];
      if (!cardEl) return;
      cardEl.style.left = `${ev.clientX - d.offsetX}px`;
      cardEl.style.top = `${ev.clientY - d.offsetY}px`;
    };
    const onUp = () => {
      const d = drag.current;
      if (d) {
        const cardEl = cardRefs.current[d.index];
        if (cardEl) {
          cardEl.classList.remove(styles.dragging);
          cardEl.style.zIndex = String(DROPPED_Z);
        }
      }
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  return (
    <div
      ref={containerRef}
      className={styles.stage}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {CARDS.map((c, i) => (
        <div
          key={c.src}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className={styles.card}
          style={
            {
              "--x": `${c.restX}px`,
              "--y": `${c.restY}px`,
              "--rot": `${c.rot}deg`,
              zIndex: i + 1,
            } as React.CSSProperties
          }
          onPointerDown={onPointerDown(i)}
        >
          <Image
            src={c.src}
            alt="Joshua Jumbo"
            fill
            draggable={false}
            sizes="(max-width: 768px) 40vw, 220px"
            className={styles.img}
          />
        </div>
      ))}
    </div>
  );
}
