import type { WebHandler } from "./http-handler.contract";

export interface IAnalysisHandlers {
  createAnalysis: WebHandler;
  getAnalysis: WebHandler;
  adaptAnalysis: WebHandler;
  deleteAnalysis: WebHandler;
}

export type ReviewedResume = {
  id: string;
  reviewedText: string;
  extractionWarning: string | null;
};

export type CreateAnalysisInput = {
  userId: string;
  resumeId: string;
  vacancyText: string;
  title: string;
  company: string;
  sourceUrl?: string;
  model: string;
};

export interface IAnalysisRepository {
  findOwnedAnalysis(
    userId: string,
    analysisId: string,
  ): Promise<unknown | null>;
  queueAdaptation(userId: string, analysisId: string): Promise<boolean>;
  deleteOwnedAnalysis(userId: string, analysisId: string): Promise<boolean>;
  findReviewedResume(
    userId: string,
    resumeId: string,
  ): Promise<ReviewedResume | null>;
  createWithVacancy(
    input: CreateAnalysisInput & { resumeSnapshot: string },
  ): Promise<{ id: string }>;
}
