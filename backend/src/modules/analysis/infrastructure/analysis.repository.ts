import { AdaptationAlreadyQueuedError } from "@/domain/errors/analysis-errors";
import type {
  CreateAnalysisInput,
  IAnalysisRepository,
  ReviewedResume,
} from "@/domain/repositories/analysis.repository";
import { db } from "@/infrastructure/database/db";

export class AnalysisRepository implements IAnalysisRepository {
  async findReviewedResume(
    userId: string,
    resumeId: string,
  ): Promise<ReviewedResume | null> {
    return db.resume.findFirst({
      where: { id: resumeId, userId },
      select: { id: true, reviewedText: true, extractionWarning: true },
    });
  }

  async createWithVacancy(
    input: CreateAnalysisInput & { resumeSnapshot: string },
  ): Promise<{ id: string }> {
    return db.$transaction(async (tx) => {
      const vacancy = await tx.vacancy.create({
        data: {
          userId: input.userId,
          title: input.title,
          company: input.company,
          description: input.vacancyText,
          sourceUrl: input.sourceUrl,
        },
      });
      return tx.analysis.create({
        data: {
          userId: input.userId,
          resumeId: input.resumeId,
          vacancyId: vacancy.id,
          resumeSnapshot: input.resumeSnapshot,
          vacancySnapshot: input.vacancyText,
          model: input.model,
          tasks: { create: { userId: input.userId, kind: "analyze" } },
        },
        select: { id: true },
      });
    });
  }

  async findOwnedAnalysis(userId: string, analysisId: string) {
    return db.analysis.findFirst({
      where: { id: analysisId, userId },
      include: {
        vacancy: true,
        versions: {
          include: { suggestions: true, exports: true },
          orderBy: { createdAt: "desc" },
        },
        tasks: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async queueAdaptation(userId: string, analysisId: string) {
    return db.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        { id: string }[]
      >`SELECT id FROM "Analysis" WHERE id=${analysisId} AND "userId"=${userId} AND status='completed' FOR UPDATE`;
      if (!rows.length) return false;
      const exists = await tx.task.findFirst({
        where: {
          analysisId,
          kind: "adapt",
          status: { in: ["pending", "processing"] },
        },
      });
      if (exists) throw new AdaptationAlreadyQueuedError();
      await tx.task.create({ data: { userId, analysisId, kind: "adapt" } });
      return true;
    });
  }

  async deleteOwnedAnalysis(userId: string, analysisId: string) {
    return db.$transaction(async (tx) => {
      const row = await tx.analysis.findFirst({
        where: { id: analysisId, userId },
        include: { versions: { include: { exports: true } } },
      });
      if (!row) return false;
      for (const version of row.versions)
        for (const file of version.exports) {
          await tx.fileGarbage.upsert({
            where: { key: file.fileKey },
            create: { key: file.fileKey },
            update: {},
          });
        }
      await tx.analysis.delete({ where: { id: analysisId } });
      await tx.vacancy.deleteMany({
        where: { id: row.vacancyId, analyses: { none: {} } },
      });
      return true;
    });
  }
}
