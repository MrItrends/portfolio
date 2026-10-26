import { env } from "@/lib/env";

/** The model that answers visitors. Override with CHAT_MODEL (e.g. claude-haiku-5-5 for speed). */
export const CHAT_MODEL = env("CHAT_MODEL") || "claude-opus-5-5";
