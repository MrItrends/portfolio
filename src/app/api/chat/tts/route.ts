import { createHash } from "node:crypto";
import { getConversation, hit, ID_RE } from "@/lib/chat/store";
import { env } from "@/lib/env";

export const maxDuration = 30;

// Joshua's cloned voice ("Joshua Jumbo"). Not a secret — only the API key is.
const DEFAULT_VOICE_ID = "WhxlORslJQKGrm3Kfxlf";
const BASE = env("ELEVENLABS_BASE_URL") || "https://api.elevenlabs.io";

const MAX_CHARS = 900;
const LIMITS = {
  perIp: { max: 25, windowSec: 600 },
  perConversation: { max: 20, windowSec: 60 * 60 * 24 },
};

/** Turn a chat message into something that sounds natural read aloud. */
function toSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s*\n+\s*/g, ". ")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_CHARS);
}

/** Lets the widget know whether to show voice controls at all. */
export async function GET() {
  return Response.json(
    { enabled: Boolean(env("ELEVENLABS_API_KEY")) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Speaks one stored AI message in Joshua's voice. The client names a message,
 * not text: only words the digital Joshua actually said can be voiced, so the
 * clone can't be used to say arbitrary things.
 */
export async function POST(req: Request) {
  const apiKey = env("ELEVENLABS_API_KEY");
  if (!apiKey) return Response.json({ error: "not_configured" }, { status: 503 });

  let body: { conversationId?: unknown; messageId?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { conversationId, messageId } = body;
  if (
    typeof conversationId !== "string" ||
    !ID_RE.test(conversationId) ||
    typeof messageId !== "string"
  ) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 24);
  if ((await hit(`tts:ip:${ipHash}`, LIMITS.perIp.windowSec)) > LIMITS.perIp.max) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  if (
    (await hit(`tts:c:${conversationId}`, LIMITS.perConversation.windowSec)) >
    LIMITS.perConversation.max
  ) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const convo = await getConversation(conversationId);
  const message = convo?.messages.find((m) => m.id === messageId);
  if (!message || message.role !== "ai") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const text = toSpeech(message.text);
  if (!text) return new Response(null, { status: 204 });

  const voiceId = env("ELEVENLABS_VOICE_ID") || DEFAULT_VOICE_ID;
  const upstream = await fetch(
    `${BASE}/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: env("ELEVENLABS_MODEL") || "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          use_speaker_boost: true,
        },
      }),
    },
  ).catch((err) => {
    console.error("[chat] ElevenLabs request failed", err);
    return null;
  });

  if (!upstream || !upstream.ok || !upstream.body) {
    const detail = upstream ? await upstream.text().catch(() => "") : "";
    console.error("[chat] ElevenLabs error", upstream?.status, detail.slice(0, 300));
    // 401/402/429 mean the key or quota needs attention — surface as "unavailable".
    return Response.json({ error: "voice_unavailable" }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
