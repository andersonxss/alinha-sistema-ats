import type { IHealthRepository } from "@/domain/repositories/health.repository";
import { db } from "@/infrastructure/database/db";
export class HealthRepository implements IHealthRepository {
  async check() {
    await db.$queryRaw`SELECT 1`;
    return true;
  }
}
