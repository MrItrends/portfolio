/**
 * Reads a server env var, tolerating the usual copy-paste damage: surrounding
 * quotes (from .env-style `KEY="value"` lines pasted into Vercel's UI) and
 * stray whitespace or newlines. Returns undefined when empty.
 *
 * Secrets (names containing KEY, TOKEN or SECRET) must be plain printable
 * ASCII. A value with other characters — typically the bullets (•••) from a
 * *masked* key copied off a settings screen — can never work, so it is treated
 * as unset and reported by envProblem() instead of failing mysteriously later.
 */
const SECRET_NAME = /KEY|TOKEN|SECRET/;
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;

function clean(raw: string): string {
  return raw.trim().replace(/^(["'`])([\s\S]*)\1$/, "$2").trim();
}

export function env(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null) return undefined;
  const cleaned = clean(raw);
  if (!cleaned) return undefined;
  if (SECRET_NAME.test(name) && !PRINTABLE_ASCII.test(cleaned)) return undefined;
  return cleaned;
}

/** Why a variable that *is* set can't be used, or null if it's fine or simply unset. */
export function envProblem(name: string): string | null {
  const raw = process.env[name];
  if (raw == null || !clean(raw)) return null;
  if (SECRET_NAME.test(name) && !PRINTABLE_ASCII.test(clean(raw))) {
    return "contains non-ASCII characters (it looks like a masked or truncated value — paste the full original)";
  }
  return null;
}
