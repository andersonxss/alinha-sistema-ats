export type HttpClient = <T>(
  url: string,
  method?: string,
  body?: unknown,
) => Promise<T>;
