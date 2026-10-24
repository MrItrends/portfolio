import { requireAdmin } from "@/lib/admin/auth";
import { pushConfigured, sendPush } from "@/lib/chat/push";
import { getPushSubs } from "@/lib/chat/store";

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  if (!pushConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  const devices = (await getPushSubs()).length;
  if (!devices) return Response.json({ error: "no_devices" }, { status: 400 });

  await sendPush({
    title: "Test notification",
    body: "Push is working. You'll hear about new chats here.",
    url: "/admin",
    tag: "test",
  });
  return Response.json({ ok: true, devices });
}
