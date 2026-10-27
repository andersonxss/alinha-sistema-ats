import type { IHealthRepository } from "@/domain/repositories/health.repository";

export class HealthService {
  constructor(private readonly repository: IHealthRepository) {}
  async check() {
    try {
      return await this.repository.check();
    } catch {
      return false;
    }
  }
}
