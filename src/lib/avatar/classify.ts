import type { BodyPose, HeadExpr } from "./sprites";

/** What the avatar should do in response to what the visitor's camera sees. */
export type Reaction = { expression?: HeadExpr; pose?: BodyPose };

export type Blendshapes = Record<string, number>;

const g = (b: Blendshapes, k: string) => b[k] ?? 0;

/**
 * Turns MediaPipe face blendshape scores (0–1) into an expression for the
 * avatar. Order matters: the most specific signals win.
 */
export function classifyFace(b: Blendshapes): HeadExpr | null {
  const smile = (g(b, "mouthSmileLeft") + g(b, "mouthSmileRight")) / 2;
  const jaw = g(b, "jawOpen");
  const brows = g(b, "browInnerUp");
  const blinkL = g(b, "eyeBlinkLeft");
  const blinkR = g(b, "eyeBlinkRight");
  const frown = (g(b, "mouthFrownLeft") + g(b, "mouthFrownRight")) / 2;
  const browDown = (g(b, "browDownLeft") + g(b, "browDownRight")) / 2;

  // One eye shut, the other open — a wink, not a blink.
  if (Math.abs(blinkL - blinkR) > 0.45 && Math.max(blinkL, blinkR) > 0.6) return "wink";
  const eyesWide = (g(b, "eyeWideLeft") + g(b, "eyeWideRight")) / 2;
  if (jaw > 0.4 && brows > 0.35 && smile < 0.35) return "surprised";
  if (brows > 0.6 && eyesWide > 0.5 && smile < 0.3) return "surprised";
  if (smile > 0.5 && jaw > 0.2) return "laugh";
  if (smile > 0.4) return "smile";
  if (frown > 0.3 || browDown > 0.5) return "serious";
  return null;
}

/** Hand gestures from MediaPipe's gesture recogniser → an avatar reply. */
export function classifyGesture(name: string | undefined): Reaction | null {
  switch (name) {
    case "Open_Palm":
      return { pose: "jump", expression: "laugh" }; // waving hello — he waves back
    case "Victory":
      return { pose: "jump", expression: "laugh" };
    case "Thumb_Up":
      return { expression: "wink" };
    case "Pointing_Up":
      return { pose: "lean", expression: "surprised" };
    case "ILoveYou":
      return { pose: "jump", expression: "smile" };
    default:
      return null;
  }
}

/**
 * Head yaw in -1..1 from MediaPipe's 4×4 facial transformation matrix
 * (column-major): positive when the visitor turns toward their right.
 */
export function yawFromMatrix(m: ArrayLike<number>): number {
  const yaw = Math.atan2(m[8], m[10]); // radians
  return Math.max(-1, Math.min(1, yaw / 0.5));
}
