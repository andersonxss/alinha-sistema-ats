export interface VacancyService {
  importUrl(url: string): Promise<{ text: string }>;
}
