import "server-only";

/** In-process sliding window. Honest: one Next.js process, not Redis. */

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
};

type Window = { hits: number[] };

const windows = new Map<string, Window>();

function prune(hits: number[], now: number, windowMs: number): number[] {
  return hits.filter((t) => now - t < windowMs);
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const current = windows.get(key) ?? { hits: [] };
  const hits = prune(current.hits, now, windowMs);
  if (hits.length >= limit) {
    windows.set(key, { hits });
    const oldest = hits[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, limit, remaining: 0, retryAfterSec };
  }
  hits.push(now);
  windows.set(key, { hits });
  return {
    ok: true,
    limit,
    remaining: Math.max(0, limit - hits.length),
    retryAfterSec: 0,
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "local";
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (!result.ok) headers["Retry-After"] = String(result.retryAfterSec);
  return headers;
}

export const RATE = {
  ussdPhone: { limit: 20, windowMs: 60_000 },
  ussdIp: { limit: 40, windowMs: 60_000 },
  invoicePost: { limit: 8, windowMs: 60_000 },
  invoiceGet: { limit: 60, windowMs: 60_000 },
  opsWrite: { limit: 8, windowMs: 60_000 },
  opsStatus: { limit: 60, windowMs: 60_000 },
} as const;

export function jsonRateLimited(result: RateLimitResult): Response {
  return Response.json(
    {
      error: "rate_limited",
      retryAfterSec: result.retryAfterSec,
    },
    { status: 429, headers: rateLimitHeaders(result) },
  );
}
