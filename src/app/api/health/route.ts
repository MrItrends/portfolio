import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import { adminConfigured } from "@/lib/admin/auth";
import { CHAT_MODEL } from "@/lib/chat/config";
import { pushConfigured } from "@/lib/chat/push";
import { storageStatus } from "@/lib/chat/store";

export const dynamic = "force-dynamic";

/**
 * Which pieces of the digital Joshua are wired up on this deployment.
 * Booleans only — no secrets. Add ?deep=1 to also check that the Anthropic key
 * and model are accepted (token counting is free and never generates text, so
 * it costs nothing — but it can't see your credit balance).
 */
export async function GET(req: Request) {
  const storage = await storageStatus();
  const apiKey = env("ANTHROPIC_API_KEY");
  const authToken = env("ANTHROPIC_AUTH_TOKEN");

  const checks: Record<string, unknown> = {
    anthropicKey: Boolean(apiKey || authToken),
    model: CHAT_MODEL,
    storage: storage.mode,
    storageReachable: storage.ok,
    ownerEmail: Boolean(env("RESEND_API_KEY") && env("OWNER_EMAIL")),
    adminPassword: adminConfigured(),
    push: pushConfigured(),
    voice: Boolean(env("ELEVENLABS_API_KEY")),
  };

  if (new URL(req.url).searchParams.get("deep") === "1" && (apiKey || authToken)) {
    try {
      const client = new Anthropic({ apiKey, authToken, maxRetries: 0, timeout: 8000 });
      await client.messages.countTokens({
        model: CHAT_MODEL,
        messages: [{ role: "user", content: "ping" }],
      });
      checks.anthropicAccepted = true;
    } catch (err) {
      checks.anthropicAccepted = false;
      checks.anthropicError =
        err instanceof Anthropic.APIError
          ? `${err.status ?? "network"} ${(err.error as { error?: { type?: string } } | undefined)?.error?.type ?? err.name}`
          : "unknown";
    }
  }

  const ready = Boolean(checks.anthropicKey) && storage.mode === "upstash" && storage.ok;
  return Response.json({ ready, ...checks }, { headers: { "Cache-Control": "no-store" } });
}
