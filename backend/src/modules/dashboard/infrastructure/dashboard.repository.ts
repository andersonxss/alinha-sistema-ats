import type { IDashboardRepository } from "@/domain/repositories/dashboard.repository";
import { db } from "@/infrastructure/database/db";

export class DashboardRepository implements IDashboardRepository {
  getDashboardData(userId: string) {
    return Promise.all([
      db.resume.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true },
      }),
      db.analysis.findMany({
        where: { userId },
        include: { vacancy: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      db.task.findMany({
        where: { userId, status: { in: ["pending", "processing", "failed"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]).then(([resumes, analyses, tasks]) => ({ resumes, analyses, tasks }));
  }
}
