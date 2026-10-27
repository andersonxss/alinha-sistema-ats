import type { HttpClient } from "@/shared/api/transport";
import type { ResumesService } from "../application/ports";
import type { Resume } from "../model/types";
export function createResumesService(
  http: HttpClient,
  baseUrl = "",
): ResumesService {
  return {
    get: (id) => http<Resume>(`/api/resumes/${id}`),
    upload: (file) => {
      const form = new FormData();
      form.set("file", file);
      return http<Resume>("/api/resumes", "POST", form);
    },
    update: (id, input) => http(`/api/resumes/${id}`, "PATCH", input),
    remove: (id) => http(`/api/resumes/${id}`, "DELETE"),
    fileUrl: (id) => `${baseUrl}/api/resumes/${id}/file`,
  };
}
