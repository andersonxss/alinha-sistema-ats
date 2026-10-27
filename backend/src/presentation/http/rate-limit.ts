import { HttpError } from "./http-error";

type RateLimit = (
  userId: string,
  action: string,
  maxRequests: number,
) => Promise<boolean>;
let rateLimit: RateLimit | undefined;

export function configureRateLimit(limit: RateLimit): void {
  rateLimit = limit;
}

export async function limited(
  userId: string,
  action: string,
  maxRequests: number,
): Promise<void> {
  if (!rateLimit) throw new Error("Rate limiter is not configured.");
  const allowed = await rateLimit(userId, action, maxRequests);
  if (!allowed)
    throw new HttpError(429, "Muitas solicitações. Aguarde um minuto.");
}
