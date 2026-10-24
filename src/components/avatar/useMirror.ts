"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BodyPose, HeadExpr } from "@/lib/avatar/sprites";
import { classifyFace, classifyGesture, yawFromMatrix } from "@/lib/avatar/classify";
import { MP_CDN, loadVision } from "@/lib/avatar/vision";

const WASM = `${MP_CDN}/wasm`;
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const GESTURE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

export type MirrorStatus = "off" | "loading" | "on" | "error";

const FRAME_MS = 80; // ~12 fps is plenty for expressions and keeps CPU low
const HOLD_GESTURE_MS = 1800;

type Closable = { close: () => void };

/**
 * Opt-in camera mirroring. Everything runs in this tab: the video never leaves
 * the device, nothing is recorded, and the models are fetched only when the
 * visitor turns this on. Reports a discrete expression/pose (state) plus a
 * continuous head-turn (ref, so it doesn't re-render every frame).
 */
export function useMirror() {
  const [status, setStatus] = useState<MirrorStatus>("off");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [expression, setExpression] = useState<HeadExpr | null>(null);
  const [pose, setPose] = useState<BodyPose | null>(null);
  const [error, setError] = useState("");
  const yawRef = useRef(0);
  const stopRef = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    stopRef.current();
    stopRef.current = () => {};
    yawRef.current = 0;
    setStream(null);
    setExpression(null);
    setPose(null);
    setStatus("off");
  }, []);

  const start = useCallback(async () => {
    if (status === "loading" || status === "on") return;
    setError("");
    setStatus("loading");

    let media: MediaStream | null = null;
    const tasks: Closable[] = [];
    let cancelled = false;
    let timer = 0;

    const cleanup = () => {
      cancelled = true;
      window.clearTimeout(timer);
      media?.getTracks().forEach((t) => t.stop());
      tasks.forEach((t) => {
        try {
          t.close();
        } catch {}
      });
    };
    stopRef.current = cleanup;

    try {
      // Ask for the camera first so the permission prompt appears immediately.
      media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });
      if (cancelled) return cleanup();
      setStream(media);

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = media;
      await video.play();

      const { FilesetResolver, FaceLandmarker, GestureRecognizer } = await loadVision();
      const fileset = await FilesetResolver.forVisionTasks(WASM);
      if (cancelled) return cleanup();

      const make = async <T extends Closable>(
        build: (delegate: "GPU" | "CPU") => Promise<T>,
      ): Promise<T> => {
        try {
          return await build("GPU");
        } catch {
          return await build("CPU");
        }
      };

      const face = await make((delegate) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        }),
      );
      tasks.push(face);
      const gesture = await make((delegate) =>
        GestureRecognizer.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: GESTURE_MODEL, delegate },
          runningMode: "VIDEO",
          numHands: 1,
        }),
      );
      tasks.push(gesture);
      if (cancelled) return cleanup();

      setStatus("on");

      // --- frame loop with light smoothing ---
      let lastTime = -1;
      let frame = 0;
      let candidate: HeadExpr | null = null;
      let candidateCount = 0;
      let shownExpr: HeadExpr | null = null;
      let gestureName: string | undefined;
      let gestureCount = 0;
      let holdUntil = 0;
      let heldReaction: { expression?: HeadExpr; pose?: BodyPose } | null = null;
      let shownPose: BodyPose | null = null;
      let yaw = 0;

      const tick = () => {
        if (cancelled) return;
        timer = window.setTimeout(tick, FRAME_MS);
        if (document.hidden || video.readyState < 2 || video.currentTime === lastTime) return;
        lastTime = video.currentTime;
        const now = performance.now();
        frame++;

        const f = face.detectForVideo(video, now);
        const shapes: Record<string, number> = {};
        for (const c of f.faceBlendshapes?.[0]?.categories ?? []) {
          shapes[c.categoryName] = c.score;
        }
        const seen = f.faceLandmarks.length > 0;
        const faceExpr = seen ? classifyFace(shapes) : null;

        // an expression must persist a few frames before the avatar commits to it
        if (faceExpr === candidate) candidateCount++;
        else {
          candidate = faceExpr;
          candidateCount = 1;
        }
        if (candidate !== shownExpr && candidateCount >= (candidate ? 3 : 8)) {
          shownExpr = candidate;
        }

        const m = f.facialTransformationMatrixes?.[0]?.data;
        if (m) yaw += (yawFromMatrix(m) - yaw) * 0.35;
        else yaw *= 0.9;
        yawRef.current = Math.abs(yaw) < 0.04 ? 0 : yaw;

        // hands are costlier — check every other frame
        if (frame % 2 === 0) {
          const g = gesture.recognizeForVideo(video, now);
          const name = g.gestures[0]?.[0]?.categoryName;
          if (name && name === gestureName) gestureCount++;
          else {
            gestureName = name;
            gestureCount = 1;
          }
          if (gestureCount === 3) {
            const reaction = classifyGesture(name);
            if (reaction) {
              heldReaction = reaction;
              holdUntil = Date.now() + HOLD_GESTURE_MS;
            }
          }
        }

        const holding = heldReaction && Date.now() < holdUntil ? heldReaction : null;
        const nextExpr = holding?.expression ?? shownExpr;
        const nextPose = holding?.pose ?? null;
        setExpression((cur) => (cur === nextExpr ? cur : nextExpr));
        if (nextPose !== shownPose) {
          shownPose = nextPose;
          setPose(nextPose);
        }
      };
      tick();
    } catch (err) {
      cleanup();
      stopRef.current = () => {};
      setStream(null);
      const denied =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError");
      setError(
        denied
          ? "Camera permission was declined — no problem."
          : "Couldn't start camera mode on this device.",
      );
      setStatus("error");
    }
  }, [status]);

  // Never leave a camera running behind the visitor's back.
  useEffect(() => () => stopRef.current(), []);

  return { status, stream, expression, pose, yawRef, error, start, stop };
}
