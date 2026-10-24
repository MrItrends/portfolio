import { createHash, randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { PROJECTS, getProject } from "@/lib/projects";
import { BOOKING_URL, RESUME_URL, SITE_URL } from "@/lib/site";
import { buildSystemPrompt } from "@/lib/chat/persona";
import { notifyOwner } from "@/lib/chat/notify";
import {
  ID_RE,
  getConversation,
  hit,
  saveConversation,
} from "@/lib/chat/store";
import type {
  Card,
  ChatMessage,
  Conversation,
  StreamEvent,
} from "@/lib/chat/types";

export const maxDuration = 60;

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
const MAX_MESSAGE_CHARS = 1000;
const MAX_MESSAGES_PER_CONVERSATION = 80;
const MAX_TOOL_STEPS = 4;
const RATE_LIMIT = { perIp: 30, windowSec: 600 };
const NOTIFY_COOLDOWN_MS = 2 * 60 * 1000;

const shareable = PROJECTS.filter((p) => !p.comingSoon).map((p) => p.slug);

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "share_resource",
    description:
      "Show the visitor a card: the CV, a project, or the link to book a call with Joshua.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["cv", "project", "booking"] },
        slug: {
          type: "string",
          enum: shareable,
          description: "Required when kind is 'project'.",
        },
      },
      required: ["kind"],
    },
  },
  {
    name: "escalate_to_joshua",
    description:
      "Notify the real Joshua so he can read this chat and step in. Include whatever contact details the visitor volunteered.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Short reason for escalating." },
        summary: {
          type: "string",
          description: "Two or three sentences for Joshua: who this is, what they want, any deadline.",
        },
        urgency: { type: "string", enum: ["normal", "urgent"] },
        visitor_name: { type: "string" },
        visitor_email: { type: "string" },
      },
      required: ["reason", "summary", "urgency"],
    },
  },
];

const clip = (s: unknown, n: number) =>
  typeof s === "string" ? s.trim().slice(0, n) : "";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

function toApiMessages(messages: ChatMessage[]): Anthropic.Beta.BetaMessageParam[] {
  return messages.map((m) => ({
    role: m.role === "visitor" ? "user" : "assistant",
    content:
      m.role === "owner" ? `[Joshua himself replied here]: ${m.text}` : m.text,
  }));
}

function runTool(
  name: string,
  input: Record<string, unknown>,
  convo: Conversation,
  emit: (e: StreamEvent) => void,
  cards: Card[],
): { text: string; escalated?: boolean } {
  if (name === "share_resource") {
    const kind = input.kind;
    if (kind === "cv") {
      const card: Card = { type: "cv", url: RESUME_URL, label: "Joshua's CV" };
      cards.push(card);
      emit({ type: "card", card });
      return { text: "CV card shown to the visitor." };
    }
    if (kind === "booking") {
      const card: Card = { type: "booking", url: BOOKING_URL, label: "Book a call with Joshua" };
      cards.push(card);
      emit({ type: "card", card });
      return { text: "Booking card shown to the visitor." };
    }
    if (kind === "project") {
      const p = typeof input.slug === "string" ? getProject(input.slug) : undefined;
      if (!p || p.comingSoon) return { text: "Unknown or unavailable project; no card shown." };
      const card: Card = {
        type: "project",
        slug: p.slug,
        title: p.title,
        category: p.category,
        image: p.image,
        url: `${SITE_URL}/work/${p.slug}`,
      };
      cards.push(card);
      emit({ type: "card", card });
      return { text: `Project card for ${p.title} shown to the visitor.` };
    }
    return { text: "Invalid kind." };
  }

  if (name === "escalate_to_joshua") {
    const email = clip(input.visitor_email, 254);
    const name_ = clip(input.visitor_name, 80);
    if (name_) convo.visitor.name = name_;
    if (EMAIL_RE.test(email)) convo.visitor.email = email;
    convo.escalation = {
      reason: clip(input.reason, 300),
      summary: clip(input.summary, 800),
      urgency: input.urgency === "urgent" ? "urgent" : "normal",
      at: Date.now(),
    };
    if (convo.status === "ai") convo.status = "escalated";
    convo.unread = true;
    emit({ type: "status", status: convo.status });
    return {
      text: "Joshua has been notified by email and on his phone. Tell the visitor he'll see this chat and can jump in or follow up by email.",
      escalated: true,
    };
  }

  return { text: "Unknown tool." };
}

export async function POST(req: Request) {
  let body: { conversationId?: unknown; message?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const text = clip(body.message, MAX_MESSAGE_CHARS);
  if (!text) return Response.json({ error: "empty_message" }, { status: 400 });

  const ipHash = createHash("sha256").update(clientIp(req)).digest("hex").slice(0, 24);
  if ((await hit(`ip:${ipHash}`, RATE_LIMIT.windowSec)) > RATE_LIMIT.perIp) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

  let convo =
    typeof body.conversationId === "string" ? await getConversation(body.conversationId) : null;
  if (typeof body.conversationId === "string" && !ID_RE.test(body.conversationId)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!convo) {
    const now = Date.now();
    convo = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      status: "ai",
      visitor: {},
      messages: [],
      unread: false,
    };
  }
  const page = typeof body.page === "string" && /^\/[\w\-/]{0,98}$/.test(body.page) ? body.page : undefined;
  if (page) convo.page = page;

  if (convo.messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
    return Response.json({ error: "conversation_limit" }, { status: 429 });
  }

  convo.messages.push({ id: randomUUID(), role: "visitor", text, at: Date.now() });
  convo.unread = true;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (e: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          // client went away
        }
      };
      const finish = () => {
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      const c = convo!;
      emit({ type: "meta", conversationId: c.id });

      const maybeNotify = async (kind: "escalation" | "message") => {
        const now = Date.now();
        if (kind === "message" && c.notifiedAt && now - c.notifiedAt < NOTIFY_COOLDOWN_MS) return;
        c.notifiedAt = now;
        await notifyOwner(c, kind);
      };

      // Joshua has taken over — the AI stays out of it.
      if (c.status === "human" || c.status === "closed") {
        await saveConversation(c);
        if (c.status === "human") await maybeNotify("message");
        emit({ type: "done", messageId: null, status: c.status });
        return finish();
      }

      if (!hasKey) {
        await saveConversation(c);
        emit({
          type: "error",
          code: "not_configured",
          message: "The digital Joshua isn't switched on yet.",
        });
        return finish();
      }

      await saveConversation(c);

      const client = new Anthropic();
      const history = toApiMessages(c.messages);
      const system = buildSystemPrompt(c.page);
      const cards: Card[] = [];
      let reply = "";
      let escalatedNow = false;

      try {
        for (let step = 0; step < MAX_TOOL_STEPS; step++) {
          const live = client.beta.messages.stream({
            model: MODEL,
            max_tokens: 2048,
            system,
            tools: TOOLS,
            messages: history,
            output_config: { effort: "low" },
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
          });

          let stepText = "";
          live.on("text", (t) => {
            if (!stepText && reply) {
              reply += "\n\n";
              emit({ type: "delta", text: "\n\n" });
            }
            stepText += t;
            reply += t;
            emit({ type: "delta", text: t });
          });

          const final = await live.finalMessage();
          history.push({ role: "assistant", content: final.content });

          if (final.stop_reason === "refusal") {
            if (!reply) {
              reply =
                "I'd rather not go down that road. Happy to talk about Joshua's work, though, or bring in the real Joshua.";
              emit({ type: "delta", text: reply });
            }
            break;
          }
          if (final.stop_reason === "max_tokens" && !reply) {
            reply = "Sorry — I lost my train of thought. Could you ask that again?";
            emit({ type: "delta", text: reply });
          }
          if (final.stop_reason !== "tool_use") break;

          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const block of final.content) {
            if (block.type !== "tool_use") continue;
            const out = runTool(
              block.name,
              (block.input ?? {}) as Record<string, unknown>,
              c,
              emit,
              cards,
            );
            if (out.escalated) escalatedNow = true;
            results.push({ type: "tool_result", tool_use_id: block.id, content: out.text });
          }
          history.push({ role: "user", content: results });
        }
      } catch (err) {
        console.error("[chat] model call failed", err);
        if (!reply) {
          emit({
            type: "error",
            code: "model_error",
            message: "Something went wrong on my end. Try again in a moment?",
          });
          return finish();
        }
      }

      const aiMessage: ChatMessage = {
        id: randomUUID(),
        role: "ai",
        text: reply.trim(),
        at: Date.now(),
        cards: cards.length ? cards : undefined,
      };
      if (aiMessage.text || aiMessage.cards) c.messages.push(aiMessage);
      await saveConversation(c);

      if (escalatedNow) await maybeNotify("escalation");
      else if (c.status === "escalated") await maybeNotify("message");

      emit({ type: "done", messageId: aiMessage.id, status: c.status });
      finish();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Poll for new messages (e.g. Joshua taking over) and the current status. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const after = Number(url.searchParams.get("after") ?? 0) || 0;

  const convo = await getConversation(id);
  if (!convo) return Response.json({ error: "not_found" }, { status: 404 });

  const full = url.searchParams.get("full") === "1";

  return Response.json(
    {
      status: convo.status,
      messages: full
        ? convo.messages
        : convo.messages.filter((m) => m.at > after && m.role === "owner"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
