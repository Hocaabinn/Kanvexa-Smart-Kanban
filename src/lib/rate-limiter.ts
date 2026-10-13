// Simple in-memory sliding window rate limiter per user/IP
// Tidak memerlukan dependensi eksternal / Redis

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically to avoid memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;      // Maksimum jumlah request
  windowMs: number;   // Jangka waktu dalam milidetik (misal 60_000 untuk 1 menit)
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 15, windowMs: 60 * 1000 }
): { success: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt <= now) {
    // Window baru
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      remaining: options.limit - 1,
      resetInSec: Math.ceil(options.windowMs / 1000),
    };
  }

  // Record masih dalam window aktif
  if (record.count >= options.limit) {
    const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      success: false,
      remaining: 0,
      resetInSec,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: options.limit - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}
