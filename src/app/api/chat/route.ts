import { createHash, randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import { env } from "@/lib/env";
import { CHAT_MODEL } from "@/lib/chat/config";
import { PROJECTS, getProject } from "@/lib/projects";
import { BOOKING_URL, RESUME_URL, SITE_URL } from "@/lib/site";
import { buildSystemPrompt } from "@/lib/chat/persona";
import { alertOwnerOffline, notifyOwner } from "@/lib/chat/notify";
import {
  ID_RE,
  getConversation,
  hit,
  mutateConversation,
  saveConversation,
} from "@/lib/chat/store";
import type {
  Card,
  ChatMessage,
  Conversation,
  Escalation,
  StreamEvent,
} from "@/lib/chat/types";

export const maxDuration = 60;

const MODEL = CHAT_MODEL;
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

type EscalationData = {
  escalation: Escalation;
  name?: string;
  email?: string;
};

function runTool(
  name: string,
  input: Record<string, unknown>,
  emit: (e: StreamEvent) => void,
  cards: Card[],
  pending: { current?: EscalationData },
): { text: string } {
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
    pending.current = {
      name: clip(input.visitor_name, 80) || undefined,
      email: EMAIL_RE.test(email) ? email : undefined,
      escalation: {
        reason: clip(input.reason, 300),
        summary: clip(input.summary, 800),
        urgency: input.urgency === "urgent" ? "urgent" : "normal",
        at: Date.now(),
      },
    };
    emit({ type: "status", status: "escalated" });
    return {
      text: "Joshua has been notified by email and on his phone. Tell the visitor he'll see this chat and can jump in or follow up by email.",
    };
  }

  return { text: "Unknown tool." };
}

/** Status + error type only (never the message), so an outage can be diagnosed from outside. */
function describeError(err: unknown): string {
  if (err instanceof Anthropic.APIError) {
    const type = (err.error as { error?: { type?: string } } | undefined)?.error?.type;
    return [err.status ?? "network", type ?? err.name].join(" ");
  }
  // Local client errors (bad config, not an HTTP response) never carry secrets.
  return err instanceof Error ? `${err.name}: ${err.message.slice(0, 160)}` : "unknown";
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    console.error("[chat] unhandled error in POST /api/chat", err);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}

async function handle(req: Request) {
  let body: { conversationId?: unknown; message?: unknown; page?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const text = clip(body.message, MAX_MESSAGE_CHARS);
  if (!text) return Response.json({ error: "empty_message" }, { status: 400 });

  const ipHash = createHash("sha256").update(clientIp(req)).digest("hex").slice(0, 24);
  const apiKey = env("ANTHROPIC_API_KEY");
  const authToken = env("ANTHROPIC_AUTH_TOKEN");
  const hasKey = Boolean(apiKey || authToken);

  const givenId = typeof body.conversationId === "string" ? body.conversationId : null;
  if (givenId && !ID_RE.test(givenId)) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Independent lookups — run together rather than one after the other.
  const [hits, existing] = await Promise.all([
    hit(`ip:${ipHash}`, RATE_LIMIT.windowSec),
    givenId ? getConversation(givenId) : Promise.resolve(null),
  ]);
  if (hits > RATE_LIMIT.perIp) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let convo = existing;
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
  // Chats the AI is handling alone don't need Joshua's attention; escalation sets this later.
  if (convo.status !== "ai") convo.unread = true;

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

      const maybeNotify = async (conv: Conversation, kind: "escalation" | "message") => {
        const now = Date.now();
        if (kind === "message" && conv.notifiedAt && now - conv.notifiedAt < NOTIFY_COOLDOWN_MS) return;
        conv.notifiedAt = now;
        await mutateConversation(conv.id, (x) => {
          x.notifiedAt = now;
        });
        await notifyOwner(conv, kind);
      };
      // Email + push take a second or two; do them after the reply is sent.
      const notifyLater = (conv: Conversation, kind: "escalation" | "message") =>
        after(() => maybeNotify(conv, kind));

      // Joshua has taken over — the AI stays out of it.
      if (c.status === "human" || c.status === "closed") {
        await saveConversation(c);
        if (c.status === "human") notifyLater(c, "message");
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

      // Persist the visitor's message in parallel with the model call, not before it.
      const preSave = saveConversation(c).catch((err) => {
        console.error("[chat] saving visitor message failed", err);
      });

      const client = new Anthropic({ apiKey, authToken });
      const history = toApiMessages(c.messages);
      const system = buildSystemPrompt(c.page);
      const cards: Card[] = [];
      const pendingEscalation: { current?: EscalationData } = {};
      let reply = "";

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
              emit,
              cards,
              pendingEscalation,
            );
            results.push({ type: "tool_result", tool_use_id: block.id, content: out.text });
          }
          history.push({ role: "user", content: results });
        }
      } catch (err) {
        console.error("[chat] model call failed", err);
        // Billing/credential problems aren't the visitor's to retry: show the
        // quick routes to Joshua, and let him know the chat is down.
        const unavailable =
          err instanceof Anthropic.APIError &&
          (/credit balance|billing/i.test(err.message) ||
            err.status === 401 ||
            err.status === 403);
        if (unavailable) {
          const why =
            err instanceof Anthropic.APIError
              ? `${err.status}: ${err.message.slice(0, 200)}`
              : "unknown";
          after(() => alertOwnerOffline(why));
        }
        if (!reply) {
          emit({
            type: "error",
            code: unavailable ? "unavailable" : "model_error",
            message: "Something went wrong on my end. Try again in a moment?",
            detail: describeError(err),
          });
          await preSave;
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
      await preSave;
      // Re-read before writing: Joshua may have replied or taken over while the
      // model was generating, and a stale copy would erase that.
      const esc = pendingEscalation.current;
      const latest =
        (await mutateConversation(c.id, (x) => {
          if (aiMessage.text || aiMessage.cards) x.messages.push(aiMessage);
          if (esc) {
            if (esc.name) x.visitor.name = esc.name;
            if (esc.email) x.visitor.email = esc.email;
            x.escalation = esc.escalation;
            if (x.status === "ai") x.status = "escalated";
            x.unread = true;
          }
        })) ?? c;

      if (esc) notifyLater(latest, "escalation");
      else if (latest.status === "escalated") notifyLater(latest, "message");

      emit({ type: "done", messageId: aiMessage.id, status: latest.status });
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
