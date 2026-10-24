"use client";

import { useEffect, useRef } from "react";
import { BODIES, BODY_UNITS, type BodyPose } from "@/lib/avatar/sprites";
import styles from "./Avatar.module.css";

const POSES = Object.keys(BODIES) as BodyPose[];
const MAX_W = Math.max(...POSES.map((p) => BODIES[p].w));
const MAX_H = Math.max(...POSES.map((p) => BODIES[p].h));

type Props = {
  pose: BodyPose;
  /** Rendered height of the standing figure, in px. */
  height: number;
  /** Lean slightly toward the pointer (fine pointers only). */
  follow?: boolean;
  /** Live head-turn from the camera, -1..1 (mirror mode). */
  yawRef?: React.RefObject<number>;
};

export default function AvatarBody({ pose, height, follow, yawRef }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const s = height / BODY_UNITS;

  // Lean toward the cursor — written straight to a CSS variable, no re-renders.
  useEffect(() => {
    const el = ref.current;
    if (!el || (!follow && !yawRef)) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let target = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth / 2, 1);
      target = Math.max(-1, Math.min(1, dx));
    };
    if (follow && fine) window.addEventListener("pointermove", onMove, { passive: true });

    const tick = () => {
      const v = yawRef && yawRef.current !== 0 ? yawRef.current : target;
      el.style.setProperty("--lean", v.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      el.style.setProperty("--lean", "0");
    };
  }, [follow, yawRef]);

  return (
    <span
      ref={ref}
      className={styles.body}
      style={{ width: MAX_W * s, height: MAX_H * s }}
      aria-hidden="true"
    >
      <span className={styles.breath}>
        {POSES.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p}
            src={BODIES[p].src}
            alt=""
            draggable={false}
            width={BODIES[p].w * s}
            height={BODIES[p].h * s}
            className={`${styles.pose} ${p === pose ? styles.poseOn : ""}`}
            style={{ width: BODIES[p].w * s, height: BODIES[p].h * s }}
          />
        ))}
      </span>
    </span>
  );
}
