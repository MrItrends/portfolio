/**
 * Reads a server env var, tolerating the usual copy-paste damage: surrounding
 * quotes (from .env-style `KEY="value"` lines pasted into Vercel's UI) and
 * stray whitespace or newlines. Returns undefined when empty.
 */
export function env(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null) return undefined;
  const cleaned = raw.trim().replace(/^(["'`])([\s\S]*)\1$/, "$2").trim();
  return cleaned || undefined;
}
