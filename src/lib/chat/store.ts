import fs from "node:fs";
import path from "node:path";
import type { Conversation } from "./types";
import { env } from "@/lib/env";

/**
 * Minimal key-value layer so the chat works in three environments with the
 * same code: Upstash Redis (production), a JSON file (local dev), and an
 * in-memory map (fallback — per-instance only, so not durable on serverless).
 */
interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec?: number): Promise<void>;
  /** Set a value and index it in a sorted set in one round trip. */
  putIndexed(
    key: string,
    value: string,
    ttlSec: number,
    index: string,
    score: number,
    member: string,
  ): Promise<void>;
  incr(key: string, ttlSec: number): Promise<number>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  del(key: string): Promise<void>;
  zrem(key: string, member: string): Promise<void>;
}

type Cmd = (string | number)[];

class UpstashKV implements KV {
  private base: string;

  constructor(
    url: string,
    private token: string,
  ) {
    this.base = url.replace(/\/+$/, "");
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(this.base + path, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    const json = (await res.json()) as unknown;
    if (!res.ok) {
      const msg = (json as { error?: string })?.error ?? res.status;
      throw new Error(`Upstash error: ${msg}`);
    }
    return json as T;
  }

  private async cmd<T>(...args: Cmd): Promise<T> {
    const json = await this.post<{ result?: T; error?: string }>("", args);
    if (json.error) throw new Error(`Upstash error: ${json.error}`);
    return json.result as T;
  }

  /** Several commands, one HTTP round trip. */
  private async pipeline(cmds: Cmd[]): Promise<unknown[]> {
    const out = await this.post<{ result?: unknown; error?: string }[]>("/pipeline", cmds);
    return out.map((r) => {
      if (r.error) throw new Error(`Upstash error: ${r.error}`);
      return r.result;
    });
  }

  get(key: string) {
    return this.cmd<string | null>("GET", key);
  }
  async set(key: string, value: string, ttlSec?: number) {
    if (ttlSec) await this.cmd("SET", key, value, "EX", ttlSec);
    else await this.cmd("SET", key, value);
  }
  async putIndexed(
    key: string,
    value: string,
    ttlSec: number,
    index: string,
    score: number,
    member: string,
  ) {
    await this.pipeline([
      ["SET", key, value, "EX", ttlSec],
      ["ZADD", index, score, member],
    ]);
  }
  async incr(key: string, ttlSec: number) {
    const [n] = await this.pipeline([
      ["INCR", key],
      ["EXPIRE", key, ttlSec, "NX"],
    ]);
    return Number(n);
  }
  zrevrange(key: string, start: number, stop: number) {
    return this.cmd<string[]>("ZREVRANGE", key, start, stop);
  }
  async del(key: string) {
    await this.cmd("DEL", key);
  }
  async zrem(key: string, member: string) {
    await this.cmd("ZREM", key, member);
  }
}

type MemState = {
  kv: Map<string, { v: string; exp?: number }>;
  z: Map<string, Map<string, number>>;
};

class MemoryKV implements KV {
  protected state: MemState;

  constructor(state?: MemState) {
    this.state = state ?? { kv: new Map(), z: new Map() };
  }

  protected persist() {}

  async get(key: string) {
    const e = this.state.kv.get(key);
    if (!e) return null;
    if (e.exp && e.exp < Date.now()) {
      this.state.kv.delete(key);
      return null;
    }
    return e.v;
  }
  async set(key: string, value: string, ttlSec?: number) {
    this.state.kv.set(key, {
      v: value,
      exp: ttlSec ? Date.now() + ttlSec * 1000 : undefined,
    });
    this.persist();
  }
  async putIndexed(
    key: string,
    value: string,
    ttlSec: number,
    index: string,
    score: number,
    member: string,
  ) {
    this.state.kv.set(key, { v: value, exp: Date.now() + ttlSec * 1000 });
    const z = this.state.z.get(index) ?? new Map<string, number>();
    z.set(member, score);
    this.state.z.set(index, z);
    this.persist();
  }
  async incr(key: string, ttlSec: number) {
    const cur = Number((await this.get(key)) ?? 0) + 1;
    const existing = this.state.kv.get(key);
    this.state.kv.set(key, {
      v: String(cur),
      exp: existing?.exp ?? Date.now() + ttlSec * 1000,
    });
    this.persist();
    return cur;
  }
  async zrevrange(key: string, start: number, stop: number) {
    const z = this.state.z.get(key);
    if (!z) return [];
    const sorted = [...z.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
    return sorted.slice(start, stop < 0 ? undefined : stop + 1);
  }
  async del(key: string) {
    this.state.kv.delete(key);
    this.persist();
  }
  async zrem(key: string, member: string) {
    this.state.z.get(key)?.delete(member);
    this.persist();
  }
}

class FileKV extends MemoryKV {
  private file = path.join(process.cwd(), ".data", "chat-store.json");

  constructor() {
    super();
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, "utf8")) as {
        kv: [string, { v: string; exp?: number }][];
        z: [string, [string, number][]][];
      };
      this.state = {
        kv: new Map(raw.kv),
        z: new Map(raw.z.map(([k, entries]) => [k, new Map(entries)])),
      };
    } catch {
      // first run
    }
  }

  protected persist() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.writeFileSync(
        this.file,
        JSON.stringify({
          kv: [...this.state.kv.entries()],
          z: [...this.state.z.entries()].map(([k, m]) => [k, [...m.entries()]]),
        }),
      );
    } catch {
      // read-only filesystem — stay in memory
    }
  }
}

/**
 * Storage must never take the chat down. If the primary store errors (bad
 * credentials, an outage, a timeout) we log it and carry on in memory — chats
 * still work, they just won't persist or show up in the inbox until it's fixed.
 */
class ResilientKV implements KV {
  private fallback = new MemoryKV();
  private lastLog = 0;
  /** False after the most recent operation had to fall back. */
  healthy = true;

  constructor(private primary: KV) {}

  private async run<T>(op: string, fn: (kv: KV) => Promise<T>): Promise<T> {
    try {
      const out = await fn(this.primary);
      this.healthy = true;
      return out;
    } catch (err) {
      this.healthy = false;
      const now = Date.now();
      if (now - this.lastLog > 30_000) {
        this.lastLog = now;
        console.error(`[chat] storage ${op} failed — falling back to memory:`, err);
      }
      return fn(this.fallback);
    }
  }

  get(key: string) {
    return this.run("get", (kv) => kv.get(key));
  }
  set(key: string, value: string, ttlSec?: number) {
    return this.run("set", (kv) => kv.set(key, value, ttlSec));
  }
  putIndexed(key: string, value: string, ttlSec: number, index: string, score: number, member: string) {
    return this.run("put", (kv) => kv.putIndexed(key, value, ttlSec, index, score, member));
  }
  incr(key: string, ttlSec: number) {
    return this.run("incr", (kv) => kv.incr(key, ttlSec));
  }
  zrevrange(key: string, start: number, stop: number) {
    return this.run("list", (kv) => kv.zrevrange(key, start, stop));
  }
  del(key: string) {
    return this.run("del", (kv) => kv.del(key));
  }
  zrem(key: string, member: string) {
    return this.run("zrem", (kv) => kv.zrem(key, member));
  }
}

const g = globalThis as unknown as { __chatKV?: KV };

function createKV(): KV {
  const url = env("UPSTASH_REDIS_REST_URL");
  const token = env("UPSTASH_REDIS_REST_TOKEN");
  if (url && token) return new ResilientKV(new UpstashKV(url, token));
  if (process.env.NODE_ENV !== "production") return new FileKV();
  console.warn(
    "[chat] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory store; conversations will not persist.",
  );
  return new MemoryKV();
}

const kv = () => (g.__chatKV ??= createKV());

/** Where chats are stored, and (for Upstash) whether it is actually reachable. */
export async function storageStatus(): Promise<{ mode: "upstash" | "file" | "memory"; ok: boolean }> {
  const store = kv();
  await store.get("chat:health").catch(() => null);
  return { mode: storageMode(), ok: store instanceof ResilientKV ? store.healthy : true };
}

/** Where chats are stored. */
export function storageMode(): "upstash" | "file" | "memory" {
  if (env("UPSTASH_REDIS_REST_URL") && env("UPSTASH_REDIS_REST_TOKEN")) return "upstash";
  return process.env.NODE_ENV !== "production" ? "file" : "memory";
}

const CONVO_TTL = 60 * 60 * 24 * 90; // keep chats 90 days
const key = (id: string) => `chat:c:${id}`;
const INDEX = "chat:index";

export const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function getConversation(id: string): Promise<Conversation | null> {
  if (!ID_RE.test(id)) return null;
  const raw = await kv().get(key(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Conversation;
  } catch {
    return null;
  }
}

export async function saveConversation(c: Conversation): Promise<void> {
  c.updatedAt = Date.now();
  await kv().putIndexed(key(c.id), JSON.stringify(c), CONVO_TTL, INDEX, c.updatedAt, c.id);
}

export async function deleteConversation(id: string): Promise<boolean> {
  if (!ID_RE.test(id)) return false;
  await Promise.all([kv().del(key(id)), kv().zrem(INDEX, id)]);
  return true;
}

/**
 * Re-reads the latest copy, applies `fn`, saves. Use for any write that may
 * race another actor (visitor stream vs. Joshua replying) so a stale copy
 * held during a multi-second AI reply can't overwrite newer messages.
 */
export async function mutateConversation(
  id: string,
  fn: (c: Conversation) => void,
): Promise<Conversation | null> {
  const c = await getConversation(id);
  if (!c) return null;
  fn(c);
  await saveConversation(c);
  return c;
}

export type PushSub = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

const PUSH_KEY = "chat:push-subs";

export async function getPushSubs(): Promise<PushSub[]> {
  const raw = await kv().get(PUSH_KEY);
  return raw ? (JSON.parse(raw) as PushSub[]) : [];
}

export async function savePushSubs(subs: PushSub[]): Promise<void> {
  await kv().set(PUSH_KEY, JSON.stringify(subs));
}

export async function listConversations(limit = 50): Promise<Conversation[]> {
  const ids = await kv().zrevrange(INDEX, 0, limit - 1);
  const all = await Promise.all(ids.map((id) => getConversation(id)));
  return all.filter((c): c is Conversation => c !== null);
}

/** Returns the new count for this key within the window. */
export function hit(bucket: string, windowSec: number): Promise<number> {
  return kv().incr(`chat:rl:${bucket}`, windowSec);
}
