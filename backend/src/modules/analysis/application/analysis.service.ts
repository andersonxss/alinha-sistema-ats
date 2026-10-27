import {
  ResumeNeedsReviewError,
  ResumeNotFoundError,
} from "@/domain/errors/resume-errors";
import type {
  CreateAnalysisInput,
  IAnalysisRepository,
} from "@/domain/repositories/analysis.repository";

export class AnalysisService {
  constructor(private readonly repository: IAnalysisRepository) {}

  async create(input: CreateAnalysisInput) {
    const resume = await this.repository.findReviewedResume(
      input.userId,
      input.resumeId,
    );
    if (!resume) throw new ResumeNotFoundError();
    if (resume.reviewedText.length < 150 || resume.extractionWarning) {
      throw new ResumeNeedsReviewError();
    }

    return this.repository.createWithVacancy({
      ...input,
      resumeSnapshot: resume.reviewedText,
    });
  }

  async get(userId: string, analysisId: string) {
    return this.repository.findOwnedAnalysis(userId, analysisId);
  }

  async queueAdaptation(userId: string, analysisId: string) {
    return this.repository.queueAdaptation(userId, analysisId);
  }

  async delete(userId: string, analysisId: string) {
    return this.repository.deleteOwnedAnalysis(userId, analysisId);
  }
}
