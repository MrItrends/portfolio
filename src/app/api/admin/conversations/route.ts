import { requireAdmin } from "@/lib/admin/auth";
import { listConversations } from "@/lib/chat/store";
import type { ConversationStatus } from "@/lib/chat/types";

export type ConversationSummary = {
  id: string;
  status: ConversationStatus;
  name?: string;
  email?: string;
  page?: string;
  unread: boolean;
  urgent: boolean;
  createdAt: number;
  updatedAt: number;
  count: number;
  preview: string;
  previewRole: "visitor" | "ai" | "owner" | null;
};

export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const all = await listConversations(100);
  const items: ConversationSummary[] = all.map((c) => {
    const last = c.messages[c.messages.length - 1];
    return {
      id: c.id,
      status: c.status,
      name: c.visitor.name,
      email: c.visitor.email,
      page: c.page,
      unread: c.unread,
      urgent: c.escalation?.urgency === "urgent",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      count: c.messages.length,
      preview: (last?.text ?? "").slice(0, 140),
      previewRole: last?.role ?? null,
    };
  });

  return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
