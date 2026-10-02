"use client";

import { useRef } from "react";
import styles from "./Hero.module.css";

/**
 * Landing hero — a single oversized line of the brand phrase scrolling across
 * the centre, with a refined collage of stickers and project stills floating
 * around it (reference-style). Header carries the nav + contact. Each sticker
 * can be dragged anywhere on screen (same as the About photo pile), and
 * resized/rotated together via its corner handle — Figma/Canva-style. Once
 * touched, a sticker becomes ordinary page content and stops bobbing.
 */

const PHRASE = "Understanding before interface";

const RESUME_URL =
  "https://drive.google.com/file/d/1HiwxVZHbhg37MiNFBmEBiKmhSVLSZSCw/view?usp=sharing";

const DECOR = [
  { src: "/images/decor/decor-spal.png", cls: "d1" },
  { src: "/images/decor/decor-balloon.webp", cls: "d2" },
  { src: "/images/decor/decor-skfans.png", cls: "d3" },
  { src: "/images/decor/decor-figma.png", cls: "d4" },
  { src: "/images/decor/decor-face.png", cls: "d5" },
  { src: "/images/decor/decor-monster.png", cls: "d6" },
  { src: "/images/decor/decor-moodoo.png", cls: "d7" },
  { src: "/images/decor/decor-grass.webp", cls: "d8" },
  { src: "/images/decor/decor-jj.png", cls: "d9" },
] as const;

const DRAG_Z = 999;
const DROPPED_Z = 30;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.6;

type Transform = { rot: number; scale: number };

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const decorRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Current rotation/scale per sticker — persists across separate gestures.
  const transforms = useRef<Transform[]>(DECOR.map(() => ({ rot: 0, scale: 1 })));

  const drag = useRef<{
    index: number;
    startClientX: number;
    startClientY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const spin = useRef<{
    index: number;
    centerX: number;
    centerY: number;
    startDist: number;
    startAngle: number;
    baseRot: number;
    baseScale: number;
  } | null>(null);

  const applyTransform = (index: number) => {
    const el = decorRefs.current[index];
    if (!el) return;
    const t = transforms.current[index];
    el.style.transform = `rotate(${t.rot}deg) scale(${t.scale})`;
  };

  const detach = (index: number) => {
    const el = decorRefs.current[index];
    const stageEl = stageRef.current;
    if (!el || !stageEl) return null;
    if (el.style.position !== "absolute") {
      const elRect = el.getBoundingClientRect();
      const stageRect = stageEl.getBoundingClientRect();
      el.style.animation = "none";
      el.style.transition = "none";
      el.style.position = "absolute";
      el.style.left = `${elRect.left - stageRect.left}px`;
      el.style.top = `${elRect.top - stageRect.top}px`;
      el.style.right = "auto";
      el.style.margin = "0";
      applyTransform(index);
    }
    return el;
  };

  // Drag the sticker body to move it.
  const onMoveDown = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const el = detach(index);
    if (!el) return;
    e.preventDefault();

    drag.current = {
      index,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startLeft: parseFloat(el.style.left),
      startTop: parseFloat(el.style.top),
    };
    el.style.zIndex = String(DRAG_Z);
    el.style.cursor = "grabbing";

    const onMove = (ev: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dEl = decorRefs.current[d.index];
      if (!dEl) return;
      dEl.style.left = `${d.startLeft + (ev.clientX - d.startClientX)}px`;
      dEl.style.top = `${d.startTop + (ev.clientY - d.startClientY)}px`;
    };
    const onUp = () => {
      const d = drag.current;
      if (d) {
        const dEl = decorRefs.current[d.index];
        if (dEl) {
          dEl.style.zIndex = String(DROPPED_Z);
          dEl.style.cursor = "grab";
        }
      }
      drag.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  // Drag the corner handle to resize + rotate together.
  const onHandleDown = (index: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = detach(index);
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const base = transforms.current[index];

    spin.current = {
      index,
      centerX,
      centerY,
      startDist: Math.hypot(e.clientX - centerX, e.clientY - centerY),
      startAngle: (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI,
      baseRot: base.rot,
      baseScale: base.scale,
    };
    el.style.zIndex = String(DRAG_Z);

    const onMove = (ev: PointerEvent) => {
      const s = spin.current;
      if (!s) return;
      const dist = Math.hypot(ev.clientX - s.centerX, ev.clientY - s.centerY);
      const angle = (Math.atan2(ev.clientY - s.centerY, ev.clientX - s.centerX) * 180) / Math.PI;
      const scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, s.baseScale * (dist / Math.max(s.startDist, 1)))
      );
      const rot = s.baseRot + (angle - s.startAngle);
      transforms.current[s.index] = { rot, scale };
      applyTransform(s.index);
    };
    const onUp = () => {
      const s = spin.current;
      if (s) {
        const dEl = decorRefs.current[s.index];
        if (dEl) dEl.style.zIndex = String(DROPPED_Z);
      }
      spin.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  return (
    <section className={styles.heroWrap}>
      <header className={styles.header}>
        <span className={styles.identity}>Joshua Jumbo</span>
        <nav className={styles.nav}>
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </nav>
        <a
          className={styles.contact}
          href="https://cal.com/joshua-jumbo/project-discussion?overlayCalendar=true"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact me
        </a>
      </header>

      <div ref={stageRef} className={styles.stage}>
        <div className={styles.collage} aria-hidden="true">
          {DECOR.map((d, i) => (
            <div
              key={d.cls}
              ref={(el) => {
                decorRefs.current[i] = el;
              }}
              className={`${styles.decor} ${styles[d.cls]}`}
              onPointerDown={onMoveDown(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.src} alt="" draggable={false} className={styles.decorImg} />
              <button
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className={styles.handle}
                onPointerDown={onHandleDown(i)}
              />
            </div>
          ))}
        </div>

        <h1 className={styles.marquee} aria-label={PHRASE}>
          <span className={styles.marqueeTrack} aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={styles.marqueeItem}>
                {PHRASE}
                <span className={styles.dot}>&bull;</span>
              </span>
            ))}
          </span>
        </h1>
      </div>
    </section>
  );
}
