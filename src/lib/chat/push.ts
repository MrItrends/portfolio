import webpush from "web-push";
import { getPushSubs, savePushSubs } from "./store";
import { env } from "@/lib/env";

export const pushConfigured = () =>
  Boolean(env("VAPID_PUBLIC_KEY") && env("VAPID_PRIVATE_KEY"));

export type PushPayload = {
  title: string;
  body: string;
  /** Path to open when the notification is tapped. */
  url: string;
  /** Same tag replaces the previous notification for that chat. */
  tag?: string;
};

/** Sends to every registered device; prunes subscriptions that no longer exist. Never throws. */
export async function sendPush(payload: PushPayload): Promise<void> {
  if (!pushConfigured()) return;
  try {
    webpush.setVapidDetails(
      `mailto:${env("OWNER_EMAIL") || "owner@example.com"}`,
      env("VAPID_PUBLIC_KEY")!,
      env("VAPID_PRIVATE_KEY")!,
    );
    const subs = await getPushSubs();
    if (!subs.length) return;

    const dead = new Set<string>();
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(s, JSON.stringify(payload), { TTL: 60 * 60 * 24 });
        } catch (err) {
          const code = (err as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) dead.add(s.endpoint);
          else console.error("[chat] push failed", code ?? err);
        }
      }),
    );
    if (dead.size) await savePushSubs(subs.filter((s) => !dead.has(s.endpoint)));
  } catch (err) {
    console.error("[chat] push error", err);
  }
}
