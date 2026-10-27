export interface ResumeReview {
  text: string;
  name: string;
}

export interface IResumeRepository {
  findOwned(userId: string, resumeId: string): Promise<unknown | null>;
  reviewOwned(
    userId: string,
    resumeId: string,
    review: ResumeReview & { sections: Record<string, string> },
  ): Promise<boolean>;
  deleteOwned(userId: string, resumeId: string): Promise<boolean>;
}
