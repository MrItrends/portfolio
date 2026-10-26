import { requireAdmin } from "@/lib/admin/auth";
import { pushConfigured } from "@/lib/chat/push";
import { getPushSubs, savePushSubs, type PushSub } from "@/lib/chat/store";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  return Response.json({
    configured: pushConfigured(),
    publicKey: env("VAPID_PUBLIC_KEY") ?? null,
  });
}

function parseSub(raw: unknown): PushSub | null {
  const s = raw as Partial<PushSub> | null;
  if (
    !s ||
    typeof s.endpoint !== "string" ||
    !s.endpoint.startsWith("https://") ||
    s.endpoint.length > 1000 ||
    typeof s.keys?.p256dh !== "string" ||
    typeof s.keys?.auth !== "string"
  ) {
    return null;
  }
  return {
    endpoint: s.endpoint,
    expirationTime: s.expirationTime ?? null,
    keys: { p256dh: s.keys.p256dh, auth: s.keys.auth },
  };
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const sub = parseSub(await req.json().catch(() => null));
  if (!sub) return Response.json({ error: "bad_request" }, { status: 400 });

  const subs = (await getPushSubs()).filter((s) => s.endpoint !== sub.endpoint);
  subs.push(sub);
  await savePushSubs(subs.slice(-10));
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) return Response.json({ error: "bad_request" }, { status: 400 });

  const subs = await getPushSubs();
  await savePushSubs(subs.filter((s) => s.endpoint !== body.endpoint));
  return Response.json({ ok: true });
}
