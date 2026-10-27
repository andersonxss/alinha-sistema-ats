export interface VersionsService {
  approve(
    id: string,
    input: { text: string; accepted: boolean; revision: number },
  ): Promise<unknown>;
  downloadUrl(id: string): string;
}
