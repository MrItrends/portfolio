import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "jj_admin";
const SESSION_DAYS = 30;

const password = () => process.env.ADMIN_PASSWORD || "";

/** Admin is disabled (login refused) until ADMIN_PASSWORD is set. */
export const adminConfigured = () => password().length >= 8;

// Sessions are signed with a key derived from the password, so changing the
// password signs everyone out. ADMIN_SESSION_SECRET overrides if you want it.
const secret = () =>
  process.env.ADMIN_SESSION_SECRET ||
  createHash("sha256").update(`jj-admin-session:${password()}`).digest("hex");

const sign = (data: string) =>
  createHmac("sha256", secret()).update(data).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export function checkPassword(input: unknown): boolean {
  if (!adminConfigured() || typeof input !== "string") return false;
  return safeEqual(input, password());
}

export function createSessionToken(): { token: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const exp = String(Math.floor(Date.now() / 1000) + maxAge);
  return { token: `${exp}.${sign(exp)}`, maxAge };
}

function verifyToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (!safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

/** For pages and route handlers: is the request carrying a valid session? */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

/**
 * Guard for admin API routes. Returns an error Response to send back, or null
 * when the caller is the signed-in owner. State-changing requests must also
 * come from this site's own origin.
 */
export async function requireAdmin(req: Request): Promise<Response | null> {
  if (!(await isAdmin())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) {
      return Response.json({ error: "forbidden" }, { status: 403 });
    }
  }
  return null;
}
