import { errorResponse } from "./error-response";

export async function handle(
  operation: () => Promise<Response>,
): Promise<Response> {
  try {
    return await operation();
  } catch (error) {
    const response = errorResponse(error);
    return Response.json(response.body, { status: response.status });
  }
}
