export type HttpResourceContext = { params: Promise<{ id: string }> };

export type WebHandler = (
  request: Request,
  context: HttpResourceContext,
) => Promise<Response>;
