export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = httpErrorCodes[status] ?? "HTTP_ERROR",
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const httpErrorCodes: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  429: "RATE_LIMIT_EXCEEDED",
  503: "SERVICE_UNAVAILABLE",
};
