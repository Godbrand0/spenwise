export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const trackers = new Map<string, RateLimitInfo>();

/**
 * Simple fixed-window rate limiter
 * Note: In serverless environments, this Map is per-instance.
 * For production with multiple instances, use Redis.
 */
export function isRateLimited(ip: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const info = trackers.get(ip);

  if (!info || now > info.resetTime) {
    trackers.set(ip, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }

  info.count++;
  
  if (info.count > config.max) {
    return true;
  }

  return false;
}

// Cleanup expired trackers every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, info] of trackers.entries()) {
      if (now > info.resetTime) {
        trackers.delete(ip);
      }
    }
  }, 60000);
}
