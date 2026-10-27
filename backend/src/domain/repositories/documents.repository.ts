import type { WebHandler } from "./http-handler.contract";

export interface IDocumentsHandlers {
  createResume: WebHandler;
  getResume: WebHandler;
  updateResume: WebHandler;
  deleteResume: WebHandler;
  getResumeFile: WebHandler;
  download: WebHandler;
  updateVersion: WebHandler;
}
