import type { IRateLimitRepository } from "@/domain/repositories/rate-limit.repository";
import { db } from "./db";

export class PrismaRateLimitRepository implements IRateLimitRepository {
  async deleteBefore(timestamp: number): Promise<void> {
    await db.rateLimit.deleteMany({
      where: { lastRequest: { lt: BigInt(timestamp) } },
    });
  }

  async increment(key: string, timestamp: number): Promise<number> {
    const result = await db.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, lastRequest: BigInt(timestamp) },
      update: { count: { increment: 1 }, lastRequest: BigInt(timestamp) },
    });
    return result.count;
  }
}
