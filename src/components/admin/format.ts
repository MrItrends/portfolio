import type { ConversationStatus } from "@/lib/chat/types";

export function timeAgo(ts: number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return "now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  ai: "AI",
  escalated: "Needs you",
  human: "You're in",
  closed: "Closed",
};

export function visitorLabel(v: { name?: string; email?: string }): string {
  return v.name || v.email || "Visitor";
}
