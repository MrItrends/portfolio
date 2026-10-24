export const MP_VERSION = "1.1.1";
export const MP_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;

type Vision = typeof import("@mediapipe/tasks-vision");

let cached: Promise<Vision> | null = null;

/**
 * Loads MediaPipe straight from the CDN at runtime, only when a visitor opts in
 * to camera mode. It is deliberately not bundled: the library ships its own
 * WASM loader and worker plumbing that bundlers handle poorly, and keeping it
 * out of the build means no visitor downloads it unless they ask for it.
 */
export function loadVision(): Promise<Vision> {
  cached ??= import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ `${MP_CDN}/vision_bundle.mjs`
  ) as Promise<Vision>;
  return cached;
}
