import type {
  IResumeRepository,
  ResumeReview,
} from "@/domain/repositories/resume.repository";

export class ResumeService {
  constructor(
    private readonly repository: IResumeRepository,
    private readonly parseSections: (text: string) => Record<string, string>,
  ) {}

  get(userId: string, resumeId: string) {
    return this.repository.findOwned(userId, resumeId);
  }

  review(userId: string, resumeId: string, review: ResumeReview) {
    return this.repository.reviewOwned(userId, resumeId, {
      ...review,
      sections: this.parseSections(review.text),
    });
  }

  delete(userId: string, resumeId: string) {
    return this.repository.deleteOwned(userId, resumeId);
  }
}
