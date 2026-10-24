import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import {
  COOKIE,
  adminConfigured,
  checkPassword,
  createSessionToken,
} from "@/lib/admin/auth";
import { hit } from "@/lib/chat/store";

const MAX_ATTEMPTS = 8;
const WINDOW_SEC = 15 * 60;

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
  const bucket = createHash("sha256").update(ip).digest("hex").slice(0, 24);
  if ((await hit(`login:${bucket}`, WINDOW_SEC)) > MAX_ATTEMPTS) {
    return Response.json({ error: "too_many_attempts" }, { status: 429 });
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return Response.json({ error: "invalid_password" }, { status: 401 });
  }

  const { token, maxAge } = createSessionToken();
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return Response.json({ ok: true });
}
