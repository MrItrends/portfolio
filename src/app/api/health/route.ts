import { env } from "@/lib/env";
import { adminConfigured } from "@/lib/admin/auth";
import { pushConfigured } from "@/lib/chat/push";
import { storageStatus } from "@/lib/chat/store";

export const dynamic = "force-dynamic";

/**
 * Which pieces of the digital Joshua are wired up on this deployment.
 * Booleans only — no secrets, and it never calls the model (so it costs nothing).
 */
export async function GET() {
  const storage = await storageStatus();
  const checks = {
    anthropicKey: Boolean(env("ANTHROPIC_API_KEY") || env("ANTHROPIC_AUTH_TOKEN")),
    storage: storage.mode,
    storageReachable: storage.ok,
    ownerEmail: Boolean(env("RESEND_API_KEY") && env("OWNER_EMAIL")),
    adminPassword: adminConfigured(),
    push: pushConfigured(),
    voice: Boolean(env("ELEVENLABS_API_KEY")),
  };
  const ready = checks.anthropicKey && storage.mode === "upstash" && storage.ok;
  return Response.json({ ready, ...checks }, { headers: { "Cache-Control": "no-store" } });
}
