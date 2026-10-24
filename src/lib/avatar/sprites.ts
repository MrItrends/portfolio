/**
 * Sprites cut from the character sheet. Body poses share one scale (the
 * standing figure is 522 units tall, every other pose is normalised to match),
 * so swapping poses never makes him grow or shrink.
 */
export const BODY_UNITS = 522;

export type Sprite = { src: string; w: number; h: number };

export const BODIES = {
  front: { src: "/images/joshua/body-front.webp", w: 177, h: 522 },
  threeQuarter: { src: "/images/joshua/body-threeQuarter.webp", w: 147, h: 527 },
  laptop: { src: "/images/joshua/body-laptop.webp", w: 162, h: 483 },
  jump: { src: "/images/joshua/body-jump.webp", w: 285, h: 433 },
  lean: { src: "/images/joshua/body-lean.webp", w: 219, h: 343 },
  crouch: { src: "/images/joshua/body-crouch.webp", w: 173, h: 316 },
} as const satisfies Record<string, Sprite>;

export const HEADS = {
  smile: { src: "/images/joshua/head-smile.webp", w: 217, h: 280 },
  wink: { src: "/images/joshua/head-wink.webp", w: 238, h: 280 },
  surprised: { src: "/images/joshua/head-surprised.webp", w: 232, h: 280 },
  laugh: { src: "/images/joshua/head-laugh.webp", w: 235, h: 280 },
  serious: { src: "/images/joshua/head-serious.webp", w: 226, h: 280 },
  think: { src: "/images/joshua/head-think.webp", w: 220, h: 280 },
} as const satisfies Record<string, Sprite>;

export type BodyPose = keyof typeof BODIES;
export type HeadExpr = keyof typeof HEADS;
