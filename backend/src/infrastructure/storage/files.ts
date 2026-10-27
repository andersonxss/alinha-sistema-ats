import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const storage = path.resolve(
  /*turbopackIgnore: true*/ process.env.STORAGE_PATH ?? "data",
);

export function filePath(key: string) {
  if (!/^[a-f0-9-]{36}\.(pdf|docx)$/.test(key))
    throw new Error("Arquivo inválido.");
  return path.join(/*turbopackIgnore: true*/ storage, key);
}
export async function saveFile(data: Buffer, format: "pdf" | "docx") {
  await mkdir(storage, { recursive: true });
  const key = `${randomUUID()}.${format}`;
  await writeFile(filePath(key), data, { flag: "wx" });
  return key;
}
export async function removeFile(key: string) {
  await unlink(filePath(key)).catch((e) => {
    if (e.code !== "ENOENT") throw e;
  });
}
export async function loadFile(key: string) {
  return readFile(/*turbopackIgnore: true*/ filePath(key));
}
export function validateFile(name: string, data: Buffer): "pdf" | "docx" {
  const max = Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024;
  if (!data.length || data.length > max)
    throw new Error(`O arquivo deve ter até ${max / 1024 / 1024} MB.`);
  const ext = path.extname(name).toLowerCase();
  if (ext === ".pdf" && data.subarray(0, 5).toString() === "%PDF-")
    return "pdf";
  if (
    ext === ".docx" &&
    data.length >= 4 &&
    data.readUInt32LE(0) === 0x04034b50 &&
    data.includes(Buffer.from("word/document.xml"))
  ) {
    // Inspect central directory sizes before decompressing the document.
    let expanded = 0,
      entries = 0;
    for (let i = 0; i < data.length - 46; i++) {
      if (data.readUInt32LE(i) === 0x02014b50) {
        expanded += data.readUInt32LE(i + 24);
        entries++;
        if (expanded > 40 * 1024 * 1024 || entries > 2000)
          throw new Error("DOCX excede o limite descompactado.");
        i += 45;
      }
    }
    if (!entries) throw new Error("DOCX inválido.");
    return "docx";
  }
  throw new Error("Envie um PDF com texto ou um DOCX válido.");
}
export async function extractFile(name: string, data: Buffer) {
  const format = validateFile(name, data);
  let text = "";
  if (format === "docx") {
    text = (await mammoth.extractRawText({ buffer: data })).value;
  } else {
    const parser = new PDFParse({ data: new Uint8Array(data) });
    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }
  if (text.length > 60000)
    throw new Error("O currículo excede 60 mil caracteres.");
  return {
    format,
    text: text.trim(),
    warning:
      text.trim().length < 150
        ? "Não foi possível extrair texto suficiente. PDFs escaneados precisam de OCR, indisponível nesta versão. Cole o texto abaixo ou envie outro arquivo."
        : null,
  };
}
export function sectionsFromText(text: string) {
  const result: Record<string, string> = {
    contato: "",
    resumo: "",
    experiencias: "",
    competencias: "",
    formacao: "",
    certificacoes: "",
    idiomas: "",
    projetos: "",
  };
  let current = "contato";
  for (const line of text.split("\n")) {
    const title = line.trim().toLowerCase();
    const headings: Record<string, RegExp> = {
      resumo: /^(resumo|objetivo|perfil)( profissional)?\s*:?$/,
      experiencias:
        /^(experi[eê]ncias?|hist[oó]rico)( profissionais?| profissional)?\s*:?$/,
      competencias:
        /^(compet[eê]ncias|habilidades|tecnologias)( t[eé]cnicas)?\s*:?$/,
      formacao: /^forma[çc][aã]o( acad[eê]mica)?\s*:?$/,
      certificacoes: /^(certifica[çc][oõ]es|cursos)\s*:?$/,
      idiomas: /^idiomas\s*:?$/,
      projetos: /^projetos( relevantes)?\s*:?$/,
    };
    const match = Object.entries(headings).find(([, regex]) =>
      regex.test(title),
    );
    if (match) current = match[0];
    else result[current] += (result[current] ? "\n" : "") + line;
  }
  return result;
}
