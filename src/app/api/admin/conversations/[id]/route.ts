import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import {
  deleteConversation,
  getConversation,
  mutateConversation,
} from "@/lib/chat/store";

type Ctx = { params: Promise<{ id: string }> };

const MAX_REPLY = 2000;

export async function GET(req: Request, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  const convo = await getConversation(id);
  if (!convo) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ conversation: convo }, { headers: { "Cache-Control": "no-store" } });
}

type Action =
  | { action: "reply"; text: string }
  | { action: "takeover" | "release" | "close" | "reopen" | "read" };

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  const ok = await deleteConversation(id);
  return ok
    ? Response.json({ ok: true })
    : Response.json({ error: "bad_request" }, { status: 400 });
}

export async function POST(req: Request, { params }: Ctx) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  let body: Action;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const updated = await mutateConversation(id, (c) => {
    switch (body.action) {
      case "reply": {
        const text = typeof body.text === "string" ? body.text.trim().slice(0, MAX_REPLY) : "";
        if (!text) return;
        c.messages.push({ id: randomUUID(), role: "owner", text, at: Date.now() });
        c.status = "human";
        c.unread = false;
        break;
      }
      case "takeover":
        c.status = "human";
        c.unread = false;
        break;
      case "release":
      case "reopen":
        c.status = "ai";
        break;
      case "close":
        c.status = "closed";
        c.unread = false;
        break;
      case "read":
        c.unread = false;
        break;
    }
  });

  if (!updated) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ conversation: updated });
}
