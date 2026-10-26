import Anthropic from "@anthropic-ai/sdk";
import { env, envProblem } from "@/lib/env";
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
          
          : err instanceof Error
            ? `${err.name}: ${err.message.slice(0, 160)}`
            : "unknown";
    }
  }

  // Variables that are set but unusable, with the reason (never the value).
  const problems: Record<string, string> = {};
  for (const name of ["ANTHROPIC_API_KEY", "UPSTASH_REDIS_REST_TOKEN", "UPSTASH_REDIS_REST_URL", "RESEND_API_KEY", "ELEVENLABS_API_KEY", "VAPID_PRIVATE_KEY"]) {
    const p = envProblem(name);
    if (p) problems[name] = p;
  }
  if (Object.keys(problems).length) checks.problems = problems;

  const ready = Boolean(checks.anthropicKey) && storage.mode === "upstash" && storage.ok;
  return Response.json({ ready, ...checks }, { headers: { "Cache-Control": "no-store" } });
}
