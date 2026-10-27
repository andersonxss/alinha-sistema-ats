import type { IDashboardRepository } from "@/domain/repositories/dashboard.repository";

export class DashboardService {
  constructor(private readonly repository: IDashboardRepository) {}
  get(userId: string) {
    return this.repository.getDashboardData(userId);
  }
}
