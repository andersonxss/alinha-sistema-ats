import type { HttpClient } from "@/shared/api/transport";

import type { VersionsService } from "../application/ports";
export function createVersionsService(
  http: HttpClient,
  baseUrl = "",
): VersionsService {
  return {
    approve: (id, input) => http(`/api/versions/${id}`, "PATCH", input),
    downloadUrl: (id) => `${baseUrl}/api/download/${id}`,
  };
}
