"use client";

import { useEffect, useRef } from "react";
import { HEADS, type HeadExpr } from "@/lib/avatar/sprites";
import styles from "./Avatar.module.css";

const EXPRS = Object.keys(HEADS) as HeadExpr[];
const MAX_W = Math.max(...EXPRS.map((e) => HEADS[e].w));
const UNITS = HEADS.smile.h;

type Props = {
  expression: HeadExpr;
  /** Rendered height in px. */
  height: number;
  /** Live head-turn from the camera, -1..1 (mirror mode). */
  yawRef?: React.RefObject<number>;
};

export default function AvatarHead({ expression, height, yawRef }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const s = height / UNITS;

  useEffect(() => {
    const el = ref.current;
    if (!el || !yawRef) return;
    let raf = 0;
    const tick = () => {
      el.style.setProperty("--yaw", (yawRef.current ?? 0).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--yaw", "0");
    };
  }, [yawRef]);

  return (
    <span
      ref={ref}
      className={styles.head}
      style={{ width: MAX_W * s, height }}
      aria-hidden="true"
    >
      {EXPRS.map((e) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={e}
          src={HEADS[e].src}
          alt=""
          draggable={false}
          width={HEADS[e].w * s}
          height={height}
          className={`${styles.expr} ${e === expression ? styles.exprOn : ""}`}
          style={{ width: HEADS[e].w * s, height }}
        />
      ))}
    </span>
  );
}
