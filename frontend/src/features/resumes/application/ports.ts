import type { Resume } from "../model/types";
export interface ResumesService {
  get(id: string): Promise<Resume>;
  upload(file: File): Promise<Resume>;
  update(id: string, input: { text: string; name: string }): Promise<unknown>;
  remove(id: string): Promise<unknown>;
  fileUrl(id: string): string;
}
