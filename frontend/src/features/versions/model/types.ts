export type ExportFile = { id: string; format: string; revision: number };

export type Version = {
  id: string;
  originalText: string;
  proposedText: string;
  approvedText: string | null;
  revision: number;
  suggestions: { justification: string }[];
  exports: ExportFile[];
};
