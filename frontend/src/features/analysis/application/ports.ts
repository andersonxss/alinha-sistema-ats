import type { Analysis } from "../model/types";
export type CreateAnalysisInput = {
  resumeId: string;
  text: string;
  title: string;
  company: string;
  consent: boolean;
  url?: string;
};
export interface AnalysisService {
  get(id: string): Promise<Analysis>;
  create(input: CreateAnalysisInput): Promise<{ id: string }>;
  adapt(id: string): Promise<unknown>;
  remove(id: string): Promise<unknown>;
}
