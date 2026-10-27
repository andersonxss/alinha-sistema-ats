import { randomUUID } from "node:crypto";
import type { Task } from "@/generated/prisma/client";
import { db } from "@/infrastructure/database/db";

export async function claimTask() {
  const token = randomUUID();
  const rows = await db.$queryRaw<
    Task[]
  >`UPDATE "Task" SET status='processing', "lockedAt"=NOW(), "lockToken"=${token}, attempts=attempts+1, "updatedAt"=NOW() WHERE id=(SELECT id FROM "Task" WHERE (status='pending' AND "availableAt"<=NOW() OR status='processing' AND "lockedAt"<NOW()-INTERVAL '5 minutes') AND attempts<3 ORDER BY "createdAt" LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *`;
  return rows[0] ?? null;
}

export async function recoverExhausted() {
  await db.$transaction(async (tx) => {
    const stale = await tx.task.findMany({
      where: {
        status: "processing",
        attempts: { gte: 3 },
        lockedAt: { lt: new Date(Date.now() - 300000) },
      },
    });
    for (const task of stale) {
      await tx.task.update({
        where: { id: task.id },
        data: {
          status: "failed",
          stage: "failed",
          error: "O processamento foi interrompido após três tentativas.",
        },
      });
      if (task.analysisId && task.kind === "analyze")
        await tx.analysis.updateMany({
          where: { id: task.analysisId },
          data: {
            status: "failed",
            error:
              "O processamento foi interrompido. Solicite uma nova análise.",
          },
        });
    }
  });
}
