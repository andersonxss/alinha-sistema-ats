export interface VersionReview {
  text: string;
  accepted: boolean;
  revision: number;
}

export interface IVersionRepository {
  /** Check owner/revision and enqueue the export within the same transaction. */
  reviewAndQueueExport(
    userId: string,
    versionId: string,
    review: VersionReview,
  ): Promise<boolean>;
}
