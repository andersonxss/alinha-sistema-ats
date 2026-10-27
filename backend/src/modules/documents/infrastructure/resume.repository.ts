import type {
  IResumeRepository,
  ResumeReview,
} from "@/domain/repositories/resume.repository";
import { db } from "@/infrastructure/database/db";

export class ResumeRepository implements IResumeRepository {
  findOwned(userId: string, id: string) {
    return db.resume.findFirst({ where: { id, userId } });
  }

  async reviewOwned(
    userId: string,
    id: string,
    review: ResumeReview & { sections: Record<string, string> },
  ) {
    const updated = await db.resume.updateMany({
      where: { id, userId },
      data: {
        reviewedText: review.text,
        name: review.name,
        sections: review.sections,
        extractionWarning: null,
      },
    });
    return updated.count > 0;
  }

  deleteOwned(userId: string, id: string) {
    return db.$transaction(async (tx) => {
      const row = await tx.resume.findFirst({
        where: { id, userId },
        include: { versions: { include: { exports: true } } },
      });
      if (!row) return false;
      const keys = [
        row.fileKey,
        ...row.versions.flatMap((v) => v.exports.map((e) => e.fileKey)),
      ].filter((k): k is string => !!k);
      for (const key of keys)
        await tx.fileGarbage.upsert({
          where: { key },
          create: { key },
          update: {},
        });
      await tx.resume.delete({ where: { id } });
      await tx.vacancy.deleteMany({
        where: { userId, analyses: { none: {} } },
      });
      return true;
    });
  }
}
