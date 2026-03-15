/**
 * Rate Limiter
 * 
 * Per-user sliding window rate limiter.
 * In production, replace with Redis-based rate limiting (e.g., upstash/ratelimit).
 * 
 * Default: 3 requests per second per user.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 1000; // 1 second window
const MAX_REQUESTS = 3;  // 3 requests per window

// Cleanup old entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS * 10);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 30_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();

  if (!store.has(userId)) {
    store.set(userId, { timestamps: [] });
  }

  const entry = store.get(userId)!;

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldestInWindow);

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  // Allow request
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Reset rate limits (for testing/reset)
 */
export function resetRateLimits(): void {
  store.clear();
}
