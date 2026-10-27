import { writeFile } from "node:fs/promises";
import { db } from "@/infrastructure/database/db";
import { removeFile } from "@/infrastructure/storage/files";

const HEALTH_FILE_PATH = "/tmp/ats-worker-health";
const GARBAGE_BATCH_SIZE = 20;

export async function writeWorkerHealth(now = Date.now()): Promise<void> {
  await writeFile(HEALTH_FILE_PATH, String(now)).catch(() => {});
}

export async function cleanFileGarbage(): Promise<void> {
  const files = await db.fileGarbage.findMany({ take: GARBAGE_BATCH_SIZE });
  for (const file of files) {
    await removeFile(file.key);
    await db.fileGarbage.delete({ where: { key: file.key } });
  }
}
