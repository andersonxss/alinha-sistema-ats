export type Resume = {
  id: string;
  name: string;
  reviewedText: string;
  extractionWarning: string | null;
  sections: Record<string, string>;
};
