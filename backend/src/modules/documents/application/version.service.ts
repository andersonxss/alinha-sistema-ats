import type {
  IVersionRepository,
  VersionReview,
} from "@/domain/repositories/version.repository";

export class VersionService {
  constructor(private readonly repository: IVersionRepository) {}

  review(userId: string, versionId: string, review: VersionReview) {
    return this.repository.reviewAndQueueExport(userId, versionId, review);
  }
}
