import { SITE_URL } from "@/lib/site";
import { sendPush } from "./push";
import type { Conversation } from "./types";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export const adminLink = (id: string) => `${SITE_URL}/admin/c/${id}`;

type Kind = "escalation" | "message";

/**
 * Pings the owner. Email via Resend when configured; always logs so local
 * development shows what would have been sent. Never throws — a failed
 * notification must not break the visitor's chat.
 */
export async function notifyOwner(c: Conversation, kind: Kind): Promise<void> {
  const last = [...c.messages].reverse().find((m) => m.role === "visitor");
  const who = c.visitor.name || c.visitor.email || "A visitor";
  const urgent = c.escalation?.urgency === "urgent";

  const subject =
    kind === "escalation"
      ? `${urgent ? "[URGENT] " : ""}${who} wants to talk to you`
      : `New message from ${who}`;

  const lines = [
    kind === "escalation" && c.escalation ? `Why: ${c.escalation.reason}` : null,
    kind === "escalation" && c.escalation ? `Summary: ${c.escalation.summary}` : null,
    c.visitor.name ? `Name: ${c.visitor.name}` : null,
    c.visitor.email ? `Email: ${c.visitor.email}` : null,
    last ? `Latest message: ${last.text}` : null,
    `Open the chat: ${adminLink(c.id)}`,
  ].filter(Boolean) as string[];

  console.log(`[chat] notify owner — ${subject}\n${lines.join("\n")}`);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;

  const push = sendPush({
    title: subject,
    body:
      kind === "escalation" && c.escalation
        ? c.escalation.summary
        : (last?.text ?? "New activity in a chat").slice(0, 140),
    url: `/admin/c/${c.id}`,
    tag: c.id,
  });

  await Promise.all([push, sendEmail()]);

  async function sendEmail() {
    if (!key || !to) return;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM || "Joshua's digital twin <onboarding@resend.dev>",
          to: [to],
          subject,
          text: lines.join("\n\n"),
          html: `<div style="font-family:system-ui,sans-serif;line-height:1.5">${lines
            .map((l) => `<p>${esc(l)}</p>`)
            .join("")}<p><a href="${esc(adminLink(c.id))}">Open the chat</a></p></div>`,
          reply_to: c.visitor.email || undefined,
        }),
      });
      if (!res.ok) {
        console.error("[chat] Resend rejected the email", res.status, await res.text());
      }
    } catch (err) {
      console.error("[chat] email notification failed", err);
    }
  }
}
