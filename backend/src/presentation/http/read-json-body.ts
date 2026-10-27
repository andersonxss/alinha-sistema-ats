import { HttpError } from "./http-error";

const DEFAULT_MAX_BODY_BYTES = 150_000;

export async function jsonBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Dados ausentes.");

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Conteúdo muito grande.");
    }
    chunks.push(value);
  }

  return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(body: string): unknown {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new HttpError(400, "Dados inválidos.");
  }
}
