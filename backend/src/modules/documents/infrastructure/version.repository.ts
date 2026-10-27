import type {
  IVersionRepository,
  VersionReview,
} from "@/domain/repositories/version.repository";
import { db } from "@/infrastructure/database/db";

export class VersionRepository implements IVersionRepository {
  reviewAndQueueExport(userId: string, id: string, review: VersionReview) {
    return db.$transaction(async (tx) => {
      const updated = await tx.resumeVersion.updateMany({
        where: { id, revision: review.revision, resume: { userId } },
        data: { approvedText: review.text, revision: { increment: 1 } },
      });
      if (!updated.count) return false;
      await tx.suggestion.updateMany({
        where: { versionId: id },
        data: { accepted: review.accepted },
      });
      const version = await tx.resumeVersion.findUniqueOrThrow({
        where: { id },
      });
      await tx.task.create({
        data: {
          userId,
          analysisId: version.analysisId,
          versionId: id,
          kind: "export",
          payload: { text: review.text, revision: review.revision + 1 },
        },
      });
      return true;
    });
  }
}
