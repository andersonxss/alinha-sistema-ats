import { HttpError } from "./http-error";

/** Read multipart within the upload budget before invoking the form parser. */
export async function formBody(
  request: Request,
  maxBytes: number,
): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType.split(";", 1)[0].trim().toLowerCase() !== "multipart/form-data"
  ) {
    throw new HttpError(415, "Envie o arquivo como multipart/form-data.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Selecione um arquivo.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Arquivo muito grande.");
    }
    chunks.push(value);
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    throw new HttpError(400, "Formulário de upload inválido.");
  }
}
