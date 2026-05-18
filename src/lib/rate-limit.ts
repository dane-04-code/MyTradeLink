/**
 * Tiny in-memory rate limiter — fixed-window per key. Good enough for
 * spam control on the public quote form without pulling in Upstash or
 * Redis. Resets on every process restart; on Vercel each lambda has its
 * own copy, which means a determined attacker can route around it, but
 * the realistic threat (someone hammering one tradesman's form) is
 * caught.
 *
 * If we ever need cross-instance limits, swap the Map for an Upstash
 * Redis client — call sites don't change.
 */

type Bucket = { hits: number; windowStart: number };

const BUCKETS = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
};

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const bucket = BUCKETS.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    BUCKETS.set(key, { hits: 1, windowStart: now });
    return { allowed: true, remaining: max - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  bucket.hits += 1;
  const remaining = Math.max(0, max - bucket.hits);
  const resetInSeconds = Math.ceil((bucket.windowStart + windowMs - now) / 1000);
  return { allowed: bucket.hits <= max, remaining, resetInSeconds };
}

/**
 * Best-effort client IP. Falls back to "unknown" so missing headers don't
 * collapse everyone into one bucket on local dev.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
