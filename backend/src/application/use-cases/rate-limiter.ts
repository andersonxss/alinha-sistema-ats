import type { IRateLimitRepository } from "@/domain/repositories/rate-limit.repository";

const WINDOW_MS = 60_000;
const RECORD_RETENTION_MS = 60 * 60 * 1_000;
const CLEANUP_INTERVAL_MS = 60_000;

export function createRateLimiter(
  repository: IRateLimitRepository,
  now: () => number = Date.now,
) {
  let lastCleanupAt = 0;

  return async function limitRequests(
    userId: string,
    action: string,
    maxRequests: number,
  ): Promise<boolean> {
    const timestamp = now();
    if (timestamp - lastCleanupAt > CLEANUP_INTERVAL_MS) {
      lastCleanupAt = timestamp;
      void repository
        .deleteBefore(timestamp - RECORD_RETENTION_MS)
        .catch(() => {});
    }

    const window = Math.floor(timestamp / WINDOW_MS);
    const count = await repository.increment(
      `app:${action}:${userId}:${window}`,
      timestamp,
    );
    return count <= maxRequests;
  };
}
