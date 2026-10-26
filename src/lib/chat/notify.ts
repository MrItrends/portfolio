import { SITE_URL } from "@/lib/site";
import { sendPush } from "./push";
import { hit } from "./store";
import type { Conversation } from "./types";
import { env } from "@/lib/env";

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

  const key = env("RESEND_API_KEY");
  const to = env("OWNER_EMAIL");

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
          from: env("NOTIFY_FROM") || "Joshua's digital twin <onboarding@resend.dev>",
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

/**
 * Tells the owner the chat can't answer visitors (e.g. Anthropic credits ran
 * out or the API key was rejected). At most one email per hour. Never throws.
 */
export async function alertOwnerOffline(reason: string): Promise<void> {
  try {
    if ((await hit("alert:offline", 60 * 60)) > 1) return;
    console.error(`[chat] OFFLINE — ${reason}`);

    const key = env("RESEND_API_KEY");
    const to = env("OWNER_EMAIL");
    if (!key || !to) return;

    const text = [
      "Your digital Joshua couldn't answer a visitor just now, so they were shown your CV and booking links instead.",
      `Reason: ${reason}`,
      "Most likely fix: add credits (Plans & Billing) or check the API key in your Anthropic console, then check ANTHROPIC_API_KEY in Vercel.",
    ].join("\n\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env("NOTIFY_FROM") || "Joshua's digital twin <onboarding@resend.dev>",
        to: [to],
        subject: "Your digital Joshua is offline",
        text,
        html: `<div style="font-family:system-ui,sans-serif;line-height:1.5">${text
          .split("\n\n")
          .map((l) => `<p>${esc(l)}</p>`)
          .join("")}</div>`,
      }),
    });
    if (!res.ok) console.error("[chat] Resend rejected the offline alert", res.status);
  } catch (err) {
    console.error("[chat] offline alert failed", err);
  }
}
