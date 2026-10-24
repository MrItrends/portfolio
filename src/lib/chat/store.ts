import fs from "node:fs";
import path from "node:path";
import type { Conversation } from "./types";

/**
 * Minimal key-value layer so the chat works in three environments with the
 * same code: Upstash Redis (production), a JSON file (local dev), and an
 * in-memory map (fallback — per-instance only, so not durable on serverless).
 */
interface KV {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSec?: number): Promise<void>;
  incr(key: string, ttlSec: number): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
}

class UpstashKV implements KV {
  constructor(
    private url: string,
    private token: string,
  ) {}

  private async cmd<T>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    const json = (await res.json()) as { result?: T; error?: string };
    if (!res.ok || json.error) {
      throw new Error(`Upstash error: ${json.error ?? res.status}`);
    }
    return json.result as T;
  }

  get(key: string) {
    return this.cmd<string | null>("GET", key);
  }
  async set(key: string, value: string, ttlSec?: number) {
    if (ttlSec) await this.cmd("SET", key, value, "EX", ttlSec);
    else await this.cmd("SET", key, value);
  }
  async incr(key: string, ttlSec: number) {
    const n = await this.cmd<number>("INCR", key);
    if (n === 1) await this.cmd("EXPIRE", key, ttlSec);
    return n;
  }
  async zadd(key: string, score: number, member: string) {
    await this.cmd("ZADD", key, score, member);
  }
  zrevrange(key: string, start: number, stop: number) {
    return this.cmd<string[]>("ZREVRANGE", key, start, stop);
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
  async zadd(key: string, score: number, member: string) {
    const z = this.state.z.get(key) ?? new Map<string, number>();
    z.set(member, score);
    this.state.z.set(key, z);
    this.persist();
  }
  async zrevrange(key: string, start: number, stop: number) {
    const z = this.state.z.get(key);
    if (!z) return [];
    const sorted = [...z.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
    return sorted.slice(start, stop < 0 ? undefined : stop + 1);
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

const g = globalThis as unknown as { __chatKV?: KV };

function createKV(): KV {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new UpstashKV(url, token);
  if (process.env.NODE_ENV !== "production") return new FileKV();
  console.warn(
    "[chat] UPSTASH_REDIS_REST_URL/TOKEN not set — using in-memory store; conversations will not persist.",
  );
  return new MemoryKV();
}

const kv = () => (g.__chatKV ??= createKV());

const CONVO_TTL = 60 * 60 * 24 * 90; // keep chats 90 days
const key = (id: string) => `chat:c:${id}`;
const INDEX = "chat:index";

export const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function getConversation(id: string): Promise<Conversation | null> {
  if (!ID_RE.test(id)) return null;
  const raw = await kv().get(key(id));
  return raw ? (JSON.parse(raw) as Conversation) : null;
}

export async function saveConversation(c: Conversation): Promise<void> {
  c.updatedAt = Date.now();
  await kv().set(key(c.id), JSON.stringify(c), CONVO_TTL);
  await kv().zadd(INDEX, c.updatedAt, c.id);
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
